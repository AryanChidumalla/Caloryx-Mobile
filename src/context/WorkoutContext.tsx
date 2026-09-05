import { useAuth } from "@/context/AuthContext";
import exerciseData from "@/data/exercises.json";
import { useWorkoutTimer } from "@/hooks/useWorkoutTimer";
import {
  WorkoutAuthContext,
  createWorkoutRoutine,
  deleteWorkoutRoutine,
  deleteWorkoutSession,
  loadWorkoutData,
  saveCompletedWorkoutSession,
  saveCustomExercise,
  syncActiveWorkoutCache,
  updateWorkoutRoutine,
  updateWorkoutSession,
} from "@/services/workoutService";
import { DEFAULT_ROUTINES } from "@/storage/workoutStorage";
import {
  Exercise,
  ExerciseSet,
  WorkoutRoutine,
  WorkoutSession,
} from "@/types/workout";
import { formatLocalDate, getTodayDateString } from "@/utils/date";
import {
  addExercise,
  addSet,
  createEmptySession,
  createSessionFromRoutine,
  finalizeSession,
  removeExercise,
  removeSet,
  reorderExercises,
  replaceExercise,
  toggleSetCompleted as toggleWorkoutSetCompleted,
  updateExerciseNotes as updateExerciseNotesMutation,
  updateSet as updateWorkoutSet,
} from "@/utils/workoutMutations";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type WorkoutContextType = {
  // Data
  routines: WorkoutRoutine[];
  sessions: WorkoutSession[];
  exercises: Exercise[];
  isLoading: boolean;

  // Active Workout
  activeWorkout: WorkoutSession | null;
  activeDurationSeconds: number;
  isActivePaused: boolean;

  // Today's summary
  todayWorkout: WorkoutSession | null;

  // Active workout actions
  startRoutine: (routine: WorkoutRoutine) => void;
  startEmptyWorkout: (name?: string) => void;
  resumeWorkout: () => void;
  pauseWorkout: () => void;
  cancelWorkout: () => void;
  finishWorkout: () => Promise<WorkoutSession | null>;

  // Modifying active workout
  addExerciseToActive: (exercise: Exercise) => void;
  removeExerciseFromActive: (exerciseIndex: number) => void;
  replaceExerciseInActive: (
    exerciseIndex: number,
    newExercise: Exercise,
  ) => void;
  reorderActiveExercises: (fromIndex: number, toIndex: number) => void;
  updateExerciseNotes: (exerciseIndex: number, notes: string) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  removeSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<ExerciseSet>,
  ) => void;
  toggleSetCompleted: (exerciseIndex: number, setIndex: number) => void;

  // Routine Management
  createRoutine: (
    routine: Omit<WorkoutRoutine, "id" | "createdAt" | "updatedAt">,
  ) => Promise<WorkoutRoutine>;
  editRoutine: (routine: WorkoutRoutine) => Promise<WorkoutRoutine>;
  deleteRoutine: (id: string) => Promise<void>;

  // History & Exercises
  updateSession: (session: WorkoutSession) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getWorkoutForDate: (dateStr: string) => WorkoutSession | null;
  createCustomExercise: (exercise: Omit<Exercise, "id">) => Promise<Exercise>;
  refreshWorkouts: () => Promise<void>;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const { session, mode } = useAuth();
  const userId = session?.user?.id ?? null;

  const authContext: WorkoutAuthContext = useMemo(
    () => ({
      userId,
      isAuthenticated: mode === "authenticated" && Boolean(userId),
    }),
    [userId, mode],
  );

  const [routines, setRoutines] = useState<WorkoutRoutine[]>(DEFAULT_ROUTINES);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(getExercises());
  const [isLoading, setIsLoading] = useState(true);

  // Active workout state
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(
    null,
  );

  // Dedicated timer hook
  const {
    elapsedSeconds: activeDurationSeconds,
    isPaused: isActivePaused,
    startTimer,
    pauseTimer: pauseWorkout,
    resumeTimer: resumeWorkout,
    resetTimer,
  } = useWorkoutTimer();

  // Track active user ID to purge state on user switch
  const activeUserIdRef = useRef<string | null | undefined>(undefined);
  const loadSequenceRef = useRef<number>(0);

  // Load all workouts & cached active session via service layer
  const refreshWorkouts = useCallback(async () => {
    const currentUserId = authContext.userId;
    const sequence = ++loadSequenceRef.current;

    setIsLoading(true);

    try {
      const data = await loadWorkoutData(authContext);

      // Discard stale responses if user switched while load was in-flight
      if (
        sequence !== loadSequenceRef.current ||
        activeUserIdRef.current !== currentUserId
      ) {
        return;
      }

      setExercises([...getExercises(), ...data.customExercises]);
      setRoutines(data.routines);
      setSessions(data.sessions);

      if (data.cachedActive) {
        setActiveWorkout(data.cachedActive);
        const started = new Date(data.cachedActive.startedAt).getTime();
        const elapsed = Math.max(0, Math.floor((Date.now() - started) / 1000));
        startTimer(elapsed);
      } else {
        setActiveWorkout(null);
        resetTimer();
      }
    } catch (err) {
      console.warn("Failed to load workout data:", err);
    } finally {
      if (sequence === loadSequenceRef.current) {
        setIsLoading(false);
      }
    }
  }, [authContext, startTimer, resetTimer]);

  useEffect(() => {
    // Detect user switch or logout
    if (activeUserIdRef.current !== authContext.userId) {
      activeUserIdRef.current = authContext.userId;
      // Instantly wipe previous user's in-memory data
      setSessions([]);
      setRoutines(DEFAULT_ROUTINES);
      setActiveWorkout(null);
      resetTimer();
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshWorkouts();
  }, [authContext.userId, refreshWorkouts, resetTimer]);

  // Sync active workout to recovery cache whenever it changes
  useEffect(() => {
    syncActiveWorkoutCache(activeWorkout, authContext);
  }, [activeWorkout, authContext]);

  // Today's completed workout for Dashboard widget
  const todayWorkout = useMemo(() => {
    const todayStr = getTodayDateString();

    return (
      sessions.find((s) => {
        const raw = s.startedAt || s.completedAt;
        if (!raw) return false;
        const d = new Date(raw);
        const date = !isNaN(d.getTime()) ? formatLocalDate(d) : raw.substring(0, 10);
        return date === todayStr;
      }) || null
    );
  }, [sessions]);

  // ---------------------------------------------------------------------------
  // Active Workout Actions
  // ---------------------------------------------------------------------------

  const startRoutine = useCallback(
    (routine: WorkoutRoutine) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newSession = createSessionFromRoutine(routine);

      setActiveWorkout(newSession);
      startTimer(0);
    },
    [startTimer],
  );

  const startEmptyWorkout = useCallback(
    (name = "Quick Workout") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newSession = createEmptySession(name);

      setActiveWorkout(newSession);
      startTimer(0);
    },
    [startTimer],
  );

  const cancelWorkout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    setActiveWorkout(null);
    resetTimer();
    syncActiveWorkoutCache(null, authContext);
  }, [resetTimer, authContext]);

  const finishWorkout =
    useCallback(async (): Promise<WorkoutSession | null> => {
      if (!activeWorkout) return null;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const completedSession = finalizeSession(
        activeWorkout,
        activeDurationSeconds,
      );

      try {
        const saved = await saveCompletedWorkoutSession(
          completedSession,
          authContext,
        );

        setSessions((prev) => [saved, ...prev]);
        return saved;
      } finally {
        setActiveWorkout(null);
        resetTimer();
      }
    }, [activeWorkout, activeDurationSeconds, authContext, resetTimer]);

  // ---------------------------------------------------------------------------
  // Modifying Exercises & Sets inside Active Workout (Pure Mutations)
  // ---------------------------------------------------------------------------

  const addExerciseToActive = useCallback((exercise: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setActiveWorkout((current) => {
      if (!current) return current;
      return addExercise(current, exercise);
    });
  }, []);

  const removeExerciseFromActive = useCallback((exerciseIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setActiveWorkout((current) => {
      if (!current) return current;
      return removeExercise(current, exerciseIndex);
    });
  }, []);

  const replaceExerciseInActive = useCallback(
    (exerciseIndex: number, newExercise: Exercise) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setActiveWorkout((current) => {
        if (!current) return current;
        return replaceExercise(current, exerciseIndex, newExercise);
      });
    },
    [],
  );

  const reorderActiveExercises = useCallback(
    (fromIndex: number, toIndex: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setActiveWorkout((current) => {
        if (!current) return current;
        return reorderExercises(current, fromIndex, toIndex);
      });
    },
    [],
  );

  const updateActiveExerciseNotes = useCallback(
    (exerciseIndex: number, notes: string) => {
      setActiveWorkout((current) => {
        if (!current) return current;
        return updateExerciseNotesMutation(current, exerciseIndex, notes);
      });
    },
    [],
  );

  const addSetToExercise = useCallback((exerciseIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setActiveWorkout((current) => {
      if (!current) return current;
      return addSet(current, exerciseIndex);
    });
  }, []);

  const removeSetFromExercise = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setActiveWorkout((current) => {
        if (!current) return current;
        return removeSet(current, exerciseIndex, setIndex);
      });
    },
    [],
  );

  const updateSet = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      updates: Partial<ExerciseSet>,
    ) => {
      setActiveWorkout((current) => {
        if (!current) return current;
        return updateWorkoutSet(current, exerciseIndex, setIndex, updates);
      });
    },
    [],
  );

  const toggleSetCompleted = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      Haptics.selectionAsync();

      setActiveWorkout((current) => {
        if (!current) return current;
        return toggleWorkoutSetCompleted(current, exerciseIndex, setIndex);
      });
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Routine Management
  // ---------------------------------------------------------------------------

  const createRoutine = useCallback(
    async (
      routineData: Omit<WorkoutRoutine, "id" | "createdAt" | "updatedAt">,
    ): Promise<WorkoutRoutine> => {
      const created = await createWorkoutRoutine(routineData, authContext);
      setRoutines((prev) => [created, ...prev]);
      return created;
    },
    [authContext],
  );

  const editRoutine = useCallback(
    async (routine: WorkoutRoutine): Promise<WorkoutRoutine> => {
      const updated = await updateWorkoutRoutine(routine, authContext);
      setRoutines((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
      return updated;
    },
    [authContext],
  );

  const deleteRoutine = useCallback(
    async (id: string): Promise<void> => {
      await deleteWorkoutRoutine(id, authContext);
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    },
    [authContext],
  );

  // ---------------------------------------------------------------------------
  // History & Custom Exercises
  // ---------------------------------------------------------------------------

  const getWorkoutForDate = useCallback(
    (dateStr: string): WorkoutSession | null => {
      return (
        sessions.find((s) => {
          const raw = s.startedAt || s.completedAt;
          if (!raw) return false;
          const d = new Date(raw);
          const date = !isNaN(d.getTime()) ? formatLocalDate(d) : raw.substring(0, 10);
          return date === dateStr;
        }) || null
      );
    },
    [sessions],
  );

  const updateSession = useCallback(
    async (updatedSession: WorkoutSession): Promise<void> => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await updateWorkoutSession(updatedSession, authContext);

      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === updatedSession.id ? updatedSession : s,
        );
        return [...updated].sort((a, b) => {
          const timeA = new Date(a.startedAt || a.completedAt || 0).getTime();
          const timeB = new Date(b.startedAt || b.completedAt || 0).getTime();
          return timeB - timeA;
        });
      });
    },
    [authContext],
  );

  const deleteSession = useCallback(
    async (id: string): Promise<void> => {
      await deleteWorkoutSession(id, authContext);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [authContext],
  );

  const createCustomExercise = useCallback(
    async (exerciseData: Omit<Exercise, "id">): Promise<Exercise> => {
      const created = await saveCustomExercise(exerciseData, authContext);
      setExercises((prev) => [...prev, created]);
      return created;
    },
    [authContext],
  );

  const contextValue = useMemo(
    (): WorkoutContextType => ({
      routines,
      sessions,
      exercises,
      isLoading,
      activeWorkout,
      activeDurationSeconds,
      isActivePaused,
      todayWorkout,
      getWorkoutForDate,
      startRoutine,
      startEmptyWorkout,
      resumeWorkout,
      pauseWorkout,
      cancelWorkout,
      finishWorkout,
      addExerciseToActive,
      removeExerciseFromActive,
      replaceExerciseInActive,
      reorderActiveExercises,
      updateExerciseNotes: updateActiveExerciseNotes,
      addSetToExercise,
      removeSetFromExercise,
      updateSet,
      toggleSetCompleted,
      createRoutine,
      editRoutine,
      deleteRoutine,
      updateSession,
      deleteSession,
      createCustomExercise,
      refreshWorkouts,
    }),
    [
      routines,
      sessions,
      exercises,
      isLoading,
      activeWorkout,
      activeDurationSeconds,
      isActivePaused,
      todayWorkout,
      getWorkoutForDate,
      startRoutine,
      startEmptyWorkout,
      resumeWorkout,
      pauseWorkout,
      cancelWorkout,
      finishWorkout,
      addExerciseToActive,
      removeExerciseFromActive,
      replaceExerciseInActive,
      reorderActiveExercises,
      updateActiveExerciseNotes,
      addSetToExercise,
      removeSetFromExercise,
      updateSet,
      toggleSetCompleted,
      createRoutine,
      editRoutine,
      deleteRoutine,
      updateSession,
      deleteSession,
      createCustomExercise,
      refreshWorkouts,
    ],
  );

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextType {
  const context = useContext(WorkoutContext);

  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }

  return context;
}

export const getExercises = () => {
  return exerciseData.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    bodyPart: item.body_part,
    equipment: item.equipment,
    instructions: item.instructions,
    instructionSteps: item.instruction_steps,
    muscleGroup: item.muscle_group,
    secondaryMuscles: item.secondary_muscles,
    target: item.target,
    image: item.image,
    gifUrl: item.gif_url,
    mediaId: item.media_id,
    attribution: item.attribution,
    isCustom: false,
  }));
};
