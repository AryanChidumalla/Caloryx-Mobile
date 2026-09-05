import type {
  Exercise,
  ExerciseSet,
  RoutineExercise,
  SessionExercise,
  WorkoutRoutine,
  WorkoutSession,
} from "@/types/workout";
import { calculateWorkoutVolume } from "./workoutCalculations";

/**
 * Creates an active WorkoutSession from a WorkoutRoutine template.
 */
export function createSessionFromRoutine(
  routine: WorkoutRoutine,
): WorkoutSession {
  const now = new Date().toISOString();

  const sessionExercises: SessionExercise[] = routine.exercises.map(
    (re, exIdx) => {
      const setCount = Math.max(1, re.targetSets || 3);
      const parsedReps = parseInt(re.targetReps, 10) || 10;
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

  return {
    id: `session-${Date.now()}`,
    routineId: routine.id,
    name: routine.name,
    startedAt: now,
    durationSeconds: 0,
    totalVolumeKg: 0,
    exercises: sessionExercises,
    createdAt: now,
  };
}

/**
 * Creates an empty WorkoutSession (e.g. for quick / on-the-fly workouts).
 */
export function createEmptySession(name = "Quick Workout"): WorkoutSession {
  const now = new Date().toISOString();

  return {
    id: `session-${Date.now()}`,
    name,
    startedAt: now,
    durationSeconds: 0,
    totalVolumeKg: 0,
    exercises: [],
    createdAt: now,
  };
}

/**
 * Finalizes an active workout session into a completed session with computed volume.
 */
export function finalizeSession(
  session: WorkoutSession,
  durationSeconds: number,
  completedAt?: string,
): WorkoutSession {
  const volume = calculateWorkoutVolume(session);

  return {
    ...session,
    completedAt: completedAt || new Date().toISOString(),
    durationSeconds,
    totalVolumeKg: Math.round(volume),
  };
}

/**
 * Appends an exercise with default sets to the session.
 */
export function addExercise(
  session: WorkoutSession,
  exercise: Exercise,
  options?: { initialSets?: number; defaultCompleted?: boolean },
): WorkoutSession {
  const exerciseIndex = session.exercises.length;
  const initialSets = options?.initialSets ?? 3;
  const defaultCompleted = options?.defaultCompleted ?? false;

  const sets: ExerciseSet[] = Array.from(
    { length: Math.max(1, initialSets) },
    (_, idx) => ({
      id: `set-${Date.now()}-${idx + 1}`,
      setNumber: idx + 1,
      setType: "regular",
      weightKg: 0,
      reps: 10,
      completed: defaultCompleted,
    }),
  );

  const newExercise: SessionExercise = {
    id: `se-${Date.now()}-${exerciseIndex}`,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    category: exercise.category,
    orderIndex: exerciseIndex,
    notes: "",
    sets,
  };

  return {
    ...session,
    exercises: [...session.exercises, newExercise],
  };
}

/**
 * Removes an exercise at the given index and reindexes remaining exercises.
 */
export function removeExercise(
  session: WorkoutSession,
  exerciseIndex: number,
): WorkoutSession {
  const exercises = session.exercises
    .filter((_, index) => index !== exerciseIndex)
    .map((exercise, index) => ({
      ...exercise,
      orderIndex: index,
    }));

  return {
    ...session,
    exercises,
  };
}

/**
 * Replaces the exercise identity and category at the given index while preserving sets.
 */
export function replaceExercise(
  session: WorkoutSession,
  exerciseIndex: number,
  newExercise: Exercise,
): WorkoutSession {
  const exercises = [...session.exercises];

  if (!exercises[exerciseIndex]) {
    return session;
  }

  exercises[exerciseIndex] = {
    ...exercises[exerciseIndex],
    exerciseId: newExercise.id,
    exerciseName: newExercise.name,
    category: newExercise.category,
  };

  return {
    ...session,
    exercises,
  };
}

/**
 * Reorders an exercise from fromIndex to toIndex.
 */
export function reorderExercises(
  session: WorkoutSession,
  fromIndex: number,
  toIndex: number,
): WorkoutSession {
  if (
    fromIndex < 0 ||
    fromIndex >= session.exercises.length ||
    toIndex < 0 ||
    toIndex >= session.exercises.length
  ) {
    return session;
  }

  const exercises = [...session.exercises];
  const [moved] = exercises.splice(fromIndex, 1);

  if (!moved) {
    return session;
  }

  exercises.splice(toIndex, 0, moved);

  return {
    ...session,
    exercises: exercises.map((exercise, index) => ({
      ...exercise,
      orderIndex: index,
    })),
  };
}

/**
 * Updates the notes for an exercise at exerciseIndex.
 */
export function updateExerciseNotes(
  session: WorkoutSession,
  exerciseIndex: number,
  notes: string,
): WorkoutSession {
  const exercises = [...session.exercises];
  const exercise = exercises[exerciseIndex];

  if (!exercise) {
    return session;
  }

  exercises[exerciseIndex] = {
    ...exercise,
    notes,
  };

  return {
    ...session,
    exercises,
  };
}

/**
 * Appends a new set to an exercise, inheriting weight/reps from the preceding set.
 */
export function addSet(
  session: WorkoutSession,
  exerciseIndex: number,
  defaults?: Partial<ExerciseSet>,
): WorkoutSession {
  const exercises = [...session.exercises];
  const exercise = exercises[exerciseIndex];

  if (!exercise) {
    return session;
  }

  const lastSet = exercise.sets[exercise.sets.length - 1];
  const nextSetNumber = exercise.sets.length + 1;

  const newSet: ExerciseSet = {
    id: `set-${Date.now()}-${nextSetNumber}`,
    setNumber: nextSetNumber,
    setType: "regular",
    weightKg: lastSet?.weightKg ?? 0,
    reps: lastSet?.reps ?? 10,
    completed: false,
    ...defaults,
  };

  exercises[exerciseIndex] = {
    ...exercise,
    sets: [...exercise.sets, newSet],
  };

  return {
    ...session,
    exercises,
  };
}

/**
 * Removes a set at setIndex and renumbers remaining sets.
 */
export function removeSet(
  session: WorkoutSession,
  exerciseIndex: number,
  setIndex: number,
): WorkoutSession {
  const exercises = [...session.exercises];
  const exercise = exercises[exerciseIndex];

  if (!exercise) {
    return session;
  }

  const updatedSets = exercise.sets
    .filter((_, index) => index !== setIndex)
    .map((set, index) => ({
      ...set,
      setNumber: index + 1,
    }));

  exercises[exerciseIndex] = {
    ...exercise,
    sets: updatedSets,
  };

  return {
    ...session,
    exercises,
  };
}

/**
 * Updates partial properties of a set at setIndex.
 */
export function updateSet(
  session: WorkoutSession,
  exerciseIndex: number,
  setIndex: number,
  updates: Partial<ExerciseSet>,
): WorkoutSession {
  const exercises = [...session.exercises];
  const exercise = exercises[exerciseIndex];

  if (!exercise || !exercise.sets[setIndex]) {
    return session;
  }

  const sets = [...exercise.sets];

  sets[setIndex] = {
    ...sets[setIndex],
    ...updates,
  };

  exercises[exerciseIndex] = {
    ...exercise,
    sets,
  };

  return {
    ...session,
    exercises,
  };
}

/**
 * Toggles the completed status of a set at setIndex.
 */
export function toggleSetCompleted(
  session: WorkoutSession,
  exerciseIndex: number,
  setIndex: number,
): WorkoutSession {
  const exercises = [...session.exercises];
  const exercise = exercises[exerciseIndex];

  if (!exercise || !exercise.sets[setIndex]) {
    return session;
  }

  const sets = [...exercise.sets];

  sets[setIndex] = {
    ...sets[setIndex],
    completed: !sets[setIndex].completed,
  };

  exercises[exerciseIndex] = {
    ...exercise,
    sets,
  };

  return {
    ...session,
    exercises,
  };
}

// -----------------------------------------------------------------------------
// Pure Routine Mutations
// -----------------------------------------------------------------------------

/**
 * Creates a RoutineExercise item from an Exercise template.
 */
export function createRoutineExercise(
  exercise: Exercise,
  orderIndex: number,
  defaults?: Partial<RoutineExercise>,
): RoutineExercise {
  return {
    id: `re-${Date.now()}-${orderIndex}`,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    category: exercise.category,
    orderIndex,
    targetSets: 3,
    targetReps: "10",
    targetWeightKg: 0,
    ...defaults,
  };
}

/**
 * Appends a new exercise to a WorkoutRoutine.
 */
export function addExerciseToRoutine(
  routine: WorkoutRoutine,
  exercise: Exercise,
  defaults?: Partial<RoutineExercise>,
): WorkoutRoutine {
  const newRe = createRoutineExercise(
    exercise,
    routine.exercises.length,
    defaults,
  );

  return {
    ...routine,
    exercises: [...routine.exercises, newRe],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Removes an exercise from a WorkoutRoutine and reindexes remaining exercises.
 */
export function removeExerciseFromRoutine(
  routine: WorkoutRoutine,
  exerciseIndex: number,
): WorkoutRoutine {
  const exercises = routine.exercises
    .filter((_, idx) => idx !== exerciseIndex)
    .map((re, idx) => ({ ...re, orderIndex: idx }));

  return {
    ...routine,
    exercises,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Updates partial properties of a routine exercise at exerciseIndex.
 */
export function updateRoutineExercise(
  routine: WorkoutRoutine,
  exerciseIndex: number,
  updates: Partial<RoutineExercise>,
): WorkoutRoutine {
  const exercises = [...routine.exercises];

  if (!exercises[exerciseIndex]) {
    return routine;
  }

  exercises[exerciseIndex] = {
    ...exercises[exerciseIndex],
    ...updates,
  };

  return {
    ...routine,
    exercises,
    updatedAt: new Date().toISOString(),
  };
}

export type SessionMetadataUpdates = {
  name?: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  notes?: string | null;
};

/**
 * Builds an ISO string from local calendar date components and time components,
 * preventing UTC shift anomalies.
 */
export function buildWorkoutStartedAt(
  dateStr: string,
  hours: number,
  minutes: number,
  seconds = 0,
): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return new Date().toISOString();
  }
  const [year, month, day] = parts;
  const localDate = new Date(
    year,
    month - 1,
    day,
    Math.min(23, Math.max(0, hours)),
    Math.min(59, Math.max(0, minutes)),
    Math.min(59, Math.max(0, seconds)),
    0,
  );
  return localDate.toISOString();
}

/**
 * Parses an ISO string into local calendar date (YYYY-MM-DD) and local time components.
 */
export function parseWorkoutStartedAt(isoStr?: string | null): {
  dateStr: string;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const d = isoStr ? new Date(isoStr) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, "0");
  const day = String(validDate.getDate()).padStart(2, "0");

  return {
    dateStr: `${year}-${month}-${day}`,
    hours: validDate.getHours(),
    minutes: validDate.getMinutes(),
    seconds: validDate.getSeconds(),
  };
}

/**
 * Pure mutation to update top-level metadata of a WorkoutSession.
 * Keeps durationSeconds as explicitly provided without overriding it.
 * Synchronizes completedAt to match startedAt + durationSeconds.
 * Recalculates totalVolumeKg dynamically.
 */
export function updateSessionMetadata(
  session: WorkoutSession,
  updates: SessionMetadataUpdates,
): WorkoutSession {
  const updated: WorkoutSession = { ...session };

  if (updates.name !== undefined) {
    updated.name = updates.name.trim();
  }
  if (updates.startedAt !== undefined) {
    updated.startedAt = updates.startedAt;
  }
  if (updates.durationSeconds !== undefined) {
    updated.durationSeconds = Math.max(0, Math.round(updates.durationSeconds));
  }
  if (updates.completedAt !== undefined) {
    updated.completedAt = updates.completedAt;
  } else if (
    updates.startedAt !== undefined ||
    updates.durationSeconds !== undefined
  ) {
    const startMs = new Date(updated.startedAt).getTime();
    if (!isNaN(startMs)) {
      const durationMs = (updated.durationSeconds || 0) * 1000;
      updated.completedAt = new Date(startMs + durationMs).toISOString();
    }
  }
  if (updates.notes !== undefined) {
    updated.notes = updates.notes ? updates.notes.trim() : undefined;
  }

  updated.totalVolumeKg = Math.round(calculateWorkoutVolume(updated));

  return updated;
}

