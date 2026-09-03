import { useAuth } from "@/context/AuthContext";
import exerciseData from "@/data/exercises.json";
import {
  deleteUserRoutine,
  deleteUserWorkoutSession,
  fetchUserRoutines,
  fetchUserWorkoutSessions,
  saveUserWorkoutSession,
  syncUserRoutine,
  updateCloudWorkoutSession,
} from "@/services/workoutSync";
import {
  DEFAULT_ROUTINES,
  addStoredCustomExercise,
  addStoredRoutine,
  addStoredSession,
  deleteStoredRoutine,
  deleteStoredSession,
  getActiveWorkoutCache,
  getStoredCustomExercises,
  getStoredRoutines,
  getStoredSessions,
  setActiveWorkoutCache,
  updateStoredRoutine,
  updateStoredSession,
} from "@/storage/workoutStorage";
import {
  Exercise,
  ExerciseSet,
  SessionExercise,
  WorkoutRoutine,
  WorkoutSession,
} from "@/types/workout";
import { getTodayDateString } from "@/utils/date";
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

  // const [routines, setRoutines] = useState<WorkoutRoutine[]>(DEFAULT_ROUTINES);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(DEFAULT_ROUTINES);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  // const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [exercises, setExercises] = useState<Exercise[]>(getExercises());
  const [isLoading, setIsLoading] = useState(true);

  // Active Workout State
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(
    null,
  );
  const [activeDurationSeconds, setActiveDurationSeconds] = useState(0);
  const [isActivePaused, setIsActivePaused] = useState(false);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load all workouts & cached active session
  const refreshWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      // const [customEx, cachedActive] = await Promise.all([
      //   getStoredCustomExercises(),
      //   getActiveWorkoutCache(),
      // ]);

      // setExercises([...DEFAULT_EXERCISES, ...customEx]);

      const [customEx, cachedActive] = await Promise.all([
        getStoredCustomExercises(),
        getActiveWorkoutCache(),
      ]);

      setExercises([...getExercises(), ...customEx]);

      if (cachedActive) {
        setActiveWorkout(cachedActive);
        const started = new Date(cachedActive.startedAt).getTime();
        const now = Date.now();
        const elapsed = Math.max(0, Math.floor((now - started) / 1000));
        setActiveDurationSeconds(elapsed);
      }

      if (mode === "authenticated" && userId) {
        const [cloudRoutines, cloudSessions] = await Promise.all([
          fetchUserRoutines(userId),
          fetchUserWorkoutSessions(userId),
        ]);

        // Merge cloud routines with default templates
        const combinedRoutines = [
          ...cloudRoutines,
          ...DEFAULT_ROUTINES.filter(
            (def) => !cloudRoutines.some((cr) => cr.name === def.name),
          ),
        ];

        setRoutines(combinedRoutines);
        setSessions(cloudSessions);
      } else {
        const [localRoutines, localSessions] = await Promise.all([
          getStoredRoutines(),
          getStoredSessions(),
        ]);
        setRoutines(localRoutines);
        setSessions(localSessions);
      }
    } catch (err) {
      console.warn("Failed to load workout data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [mode, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshWorkouts();
  }, [refreshWorkouts]);

  // Timer runner for active workout
  useEffect(() => {
    if (activeWorkout && !isActivePaused) {
      timerRef.current = setInterval(() => {
        setActiveDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeWorkout, isActivePaused]);

  // Sync active workout to local cache whenever it changes
  useEffect(() => {
    setActiveWorkoutCache(activeWorkout);
  }, [activeWorkout]);

  // Today's completed workout for Dashboard widget
  const todayWorkout = useMemo(() => {
    const todayStr = getTodayDateString();
    return (
      sessions.find((s) => {
        if (!s.completedAt && !s.startedAt) return false;
        const date = (s.completedAt || s.startedAt).substring(0, 10);
        return date === todayStr;
      }) || null
    );
  }, [sessions]);

  // ---------------------------------------------------------------------------
  // Active Workout Actions
  // ---------------------------------------------------------------------------

  const startRoutine = useCallback((routine: WorkoutRoutine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = new Date().toISOString();

    // Deep-clone exercises into session exercises with concrete sets
    const sessionExercises: SessionExercise[] = routine.exercises.map(
      (re, exIdx) => {
        const setCount = Math.max(1, re.targetSets || 3);
        const parsedReps = parseInt(re.targetReps) || 10;
        const targetWeight = re.targetWeightKg || 0;

        const sets: ExerciseSet[] = Array.from(
          { length: setCount },
          (_, sIdx) => ({
            id: `set-${Date.now()}-${exIdx}-${sIdx}`,
            setNumber: sIdx + 1,
            setType: "regular",
            weightKg: targetWeight,
            reps: parsedReps,
            durationSeconds: re.targetDurationSeconds,
            completed: false,
          }),
        );

        return {
          id: `se-${Date.now()}-${exIdx}`,
          exerciseId: re.exerciseId,
          exerciseName: re.exerciseName,
          category: re.category,
          orderIndex: exIdx,
          notes: re.notes,
          sets,
        };
      },
    );

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      routineId: routine.id,
      name: routine.name,
      startedAt: now,
      durationSeconds: 0,
      totalVolumeKg: 0,
      exercises: sessionExercises,
      createdAt: now,
    };

    setActiveWorkout(newSession);
    setActiveDurationSeconds(0);
    setIsActivePaused(false);
  }, []);

  const startEmptyWorkout = useCallback((name = "Quick Workout") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = new Date().toISOString();
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      name,
      startedAt: now,
      durationSeconds: 0,
      totalVolumeKg: 0,
      exercises: [],
      createdAt: now,
    };

    setActiveWorkout(newSession);
    setActiveDurationSeconds(0);
    setIsActivePaused(false);
  }, []);

  const resumeWorkout = useCallback(() => {
    setIsActivePaused(false);
  }, []);

  const pauseWorkout = useCallback(() => {
    setIsActivePaused(true);
  }, []);

  const cancelWorkout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setActiveWorkout(null);
    setActiveDurationSeconds(0);
    setIsActivePaused(false);
    setActiveWorkoutCache(null);
  }, []);

  const finishWorkout =
    useCallback(async (): Promise<WorkoutSession | null> => {
      if (!activeWorkout) return null;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const now = new Date().toISOString();

      // Calculate total volume (weight * reps for completed sets)
      let volume = 0;
      for (const ex of activeWorkout.exercises) {
        for (const set of ex.sets) {
          if (set.completed && set.weightKg > 0 && set.reps > 0) {
            volume += set.weightKg * set.reps;
          }
        }
      }

      const completedSession: WorkoutSession = {
        ...activeWorkout,
        completedAt: now,
        durationSeconds: activeDurationSeconds,
        totalVolumeKg: Math.round(volume),
      };

      try {
        if (mode === "authenticated" && userId) {
          const saved = await saveUserWorkoutSession(userId, completedSession);
          setSessions((prev) => [saved, ...prev]);
        } else {
          const saved = await addStoredSession(completedSession);
          setSessions((prev) => [saved, ...prev]);
        }
      } catch (err) {
        console.warn("Failed to persist finished workout to cloud:", err);
        // Always persist to local storage as fallback
        const saved = await addStoredSession(completedSession);
        setSessions((prev) => [saved, ...prev]);
      } finally {
        setActiveWorkout(null);
        setActiveDurationSeconds(0);
        setIsActivePaused(false);
        await setActiveWorkoutCache(null);
      }

      return completedSession;
    }, [activeWorkout, activeDurationSeconds, mode, userId]);

  // ---------------------------------------------------------------------------
  // Modifying Exercises & Sets inside Active Workout
  // ---------------------------------------------------------------------------

  const addExerciseToActive = useCallback((exercise: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveWorkout((current) => {
      if (!current) return current;

      const newEx: SessionExercise = {
        id: `se-${Date.now()}-${current.exercises.length}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        category: exercise.category,
        orderIndex: current.exercises.length,
        notes: "",
        sets: [
          {
            id: `set-${Date.now()}-1`,
            setNumber: 1,
            setType: "regular",
            weightKg: 0,
            reps: 10,
            completed: false,
          },
          {
            id: `set-${Date.now()}-2`,
            setNumber: 2,
            setType: "regular",
            weightKg: 0,
            reps: 10,
            completed: false,
          },
          {
            id: `set-${Date.now()}-3`,
            setNumber: 3,
            setType: "regular",
            weightKg: 0,
            reps: 10,
            completed: false,
          },
        ],
      };

      return {
        ...current,
        exercises: [...current.exercises, newEx],
      };
    });
  }, []);

  const removeExerciseFromActive = useCallback((exerciseIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveWorkout((current) => {
      if (!current) return current;
      const updated = current.exercises.filter(
        (_, idx) => idx !== exerciseIndex,
      );
      return {
        ...current,
        exercises: updated.map((e, i) => ({ ...e, orderIndex: i })),
      };
    });
  }, []);

  const replaceExerciseInActive = useCallback(
    (exerciseIndex: number, newExercise: Exercise) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveWorkout((current) => {
        if (!current) return current;
        const updated = [...current.exercises];
        if (updated[exerciseIndex]) {
          updated[exerciseIndex] = {
            ...updated[exerciseIndex],
            exerciseId: newExercise.id,
            exerciseName: newExercise.name,
            category: newExercise.category,
          };
        }
        return {
          ...current,
          exercises: updated,
        };
      });
    },
    [],
  );

  const reorderActiveExercises = useCallback(
    (fromIndex: number, toIndex: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveWorkout((current) => {
        if (!current) return current;
        const items = [...current.exercises];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        return {
          ...current,
          exercises: items.map((e, idx) => ({ ...e, orderIndex: idx })),
        };
      });
    },
    [],
  );

  const updateExerciseNotes = useCallback(
    (exerciseIndex: number, notes: string) => {
      setActiveWorkout((current) => {
        if (!current) return current;
        const exercises = [...current.exercises];
        if (exercises[exerciseIndex]) {
          exercises[exerciseIndex] = { ...exercises[exerciseIndex], notes };
        }
        return { ...current, exercises };
      });
    },
    [],
  );

  const addSetToExercise = useCallback((exerciseIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveWorkout((current) => {
      if (!current) return current;
      const exercises = [...current.exercises];
      const targetEx = exercises[exerciseIndex];
      if (!targetEx) return current;

      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      const nextSetNumber = targetEx.sets.length + 1;
      const newSet: ExerciseSet = {
        id: `set-${Date.now()}-${nextSetNumber}`,
        setNumber: nextSetNumber,
        setType: "regular",
        weightKg: lastSet?.weightKg ?? 0,
        reps: lastSet?.reps ?? 10,
        completed: false,
      };

      exercises[exerciseIndex] = {
        ...targetEx,
        sets: [...targetEx.sets, newSet],
      };

      return { ...current, exercises };
    });
  }, []);

  const removeSetFromExercise = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveWorkout((current) => {
        if (!current) return current;
        const exercises = [...current.exercises];
        const targetEx = exercises[exerciseIndex];
        if (!targetEx) return current;

        const updatedSets = targetEx.sets
          .filter((_, idx) => idx !== setIndex)
          .map((s, i) => ({ ...s, setNumber: i + 1 }));

        exercises[exerciseIndex] = {
          ...targetEx,
          sets: updatedSets,
        };

        return { ...current, exercises };
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
        const exercises = [...current.exercises];
        const targetEx = exercises[exerciseIndex];
        if (!targetEx || !targetEx.sets[setIndex]) return current;

        const sets = [...targetEx.sets];
        sets[setIndex] = { ...sets[setIndex], ...updates };
        exercises[exerciseIndex] = { ...targetEx, sets };

        return { ...current, exercises };
      });
    },
    [],
  );

  const toggleSetCompleted = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      Haptics.selectionAsync();
      setActiveWorkout((current) => {
        if (!current) return current;
        const exercises = [...current.exercises];
        const targetEx = exercises[exerciseIndex];
        if (!targetEx || !targetEx.sets[setIndex]) return current;

        const sets = [...targetEx.sets];
        const currentDone = sets[setIndex].completed;
        sets[setIndex] = { ...sets[setIndex], completed: !currentDone };
        exercises[exerciseIndex] = { ...targetEx, sets };

        return { ...current, exercises };
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
      let created: WorkoutRoutine;
      if (mode === "authenticated" && userId) {
        const full: WorkoutRoutine = {
          ...routineData,
          id: `routine-${Date.now()}`,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCustom: true,
        };
        created = await syncUserRoutine(userId, full);
      } else {
        created = await addStoredRoutine(routineData);
      }

      setRoutines((prev) => [created, ...prev]);
      return created;
    },
    [mode, userId],
  );

  const editRoutine = useCallback(
    async (routine: WorkoutRoutine): Promise<WorkoutRoutine> => {
      let updated: WorkoutRoutine;
      if (mode === "authenticated" && userId) {
        updated = await syncUserRoutine(userId, routine);
      } else {
        updated = await updateStoredRoutine(routine);
      }

      setRoutines((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
      return updated;
    },
    [mode, userId],
  );

  const deleteRoutine = useCallback(
    async (id: string): Promise<void> => {
      if (mode === "authenticated" && userId) {
        await deleteUserRoutine(userId, id);
      } else {
        await deleteStoredRoutine(id);
      }
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    },
    [mode, userId],
  );

  // ---------------------------------------------------------------------------
  // History & Custom Exercises
  // ---------------------------------------------------------------------------

  const getWorkoutForDate = useCallback(
    (dateStr: string): WorkoutSession | null => {
      return (
        sessions.find((s) => {
          if (!s.completedAt && !s.startedAt) return false;
          const date = (s.completedAt || s.startedAt).substring(0, 10);
          return date === dateStr;
        }) || null
      );
    },
    [sessions],
  );

  const updateSession = useCallback(
    async (updatedSession: WorkoutSession): Promise<void> => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (mode === "authenticated" && userId) {
        await updateCloudWorkoutSession(userId, updatedSession);
      }
      await updateStoredSession(updatedSession);
      setSessions((prev) =>
        prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)),
      );
    },
    [mode, userId],
  );

  const deleteSession = useCallback(
    async (id: string): Promise<void> => {
      if (mode === "authenticated" && userId) {
        await deleteUserWorkoutSession(userId, id);
      } else {
        await deleteStoredSession(id);
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [mode, userId],
  );

  const createCustomExercise = useCallback(
    async (exerciseData: Omit<Exercise, "id">): Promise<Exercise> => {
      const created = await addStoredCustomExercise(exerciseData);
      setExercises((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
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
      updateExerciseNotes,
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
      updateExerciseNotes,
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
