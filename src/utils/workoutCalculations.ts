import type {
  Exercise,
  ExerciseSet,
  MuscleDistribution,
  SessionExercise,
  WorkoutSession,
} from "@/types/workout";

/**
 * Calculates volume (weight * reps) for an individual set.
 * Only completed sets with positive weight and reps contribute to volume.
 */
export function calculateSetVolume(
  set: ExerciseSet | null | undefined,
): number {
  if (!set || !set.completed || (set.weightKg || 0) <= 0 || (set.reps || 0) <= 0) {
    return 0;
  }

  return (set.weightKg || 0) * (set.reps || 0);
}

/**
 * Calculates total volume across an array of sets.
 */
export function calculateExerciseVolume(
  sets: ExerciseSet[] | null | undefined,
): number {
  if (!Array.isArray(sets)) {
    return 0;
  }

  return sets.reduce((total, set) => total + calculateSetVolume(set), 0);
}

/**
 * Calculates total volume across an entire workout session.
 */
export function calculateWorkoutVolume(
  session: WorkoutSession | null | undefined,
): number {
  if (!session || !Array.isArray(session.exercises)) {
    return 0;
  }

  return session.exercises.reduce(
    (total, exercise) =>
      total +
      (Array.isArray(exercise?.sets)
        ? calculateExerciseVolume(exercise.sets)
        : 0),
    0,
  );
}

/**
 * Counts total exercises in a session.
 */
export function calculateTotalExercises(
  session: WorkoutSession | null | undefined,
): number {
  if (!session || !Array.isArray(session.exercises)) {
    return 0;
  }

  return session.exercises.length;
}

/**
 * Counts total sets across all exercises in a session.
 */
export function calculateTotalSets(
  session: WorkoutSession | null | undefined,
): number {
  if (!session || !Array.isArray(session.exercises)) {
    return 0;
  }

  return session.exercises.reduce(
    (total, exercise) =>
      total + (Array.isArray(exercise?.sets) ? exercise.sets.length : 0),
    0,
  );
}

/**
 * Counts completed sets across all exercises in a session.
 */
export function calculateCompletedSets(
  session: WorkoutSession | null | undefined,
): number {
  if (!session || !Array.isArray(session.exercises)) {
    return 0;
  }

  return session.exercises.reduce(
    (total, exercise) =>
      total +
      (Array.isArray(exercise?.sets)
        ? exercise.sets.filter((s) => Boolean(s?.completed)).length
        : 0),
    0,
  );
}

/**
 * Formats a duration in seconds into MM:SS or H:MM:SS.
 */
export function formatWorkoutTimer(
  seconds: number,
  options?: { alwaysIncludeHours?: boolean },
): string {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hrs > 0 || options?.alwaysIncludeHours) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Finds the most recent completed performance of a specific exercise across past sessions.
 */
export function getPreviousExercisePerformance(
  exerciseIdOrName: string,
  sessions: WorkoutSession[] | null | undefined,
  currentSessionId?: string,
): { session: WorkoutSession; exercise: SessionExercise } | null {
  if (!exerciseIdOrName || !Array.isArray(sessions) || sessions.length === 0) {
    return null;
  }

  const query = exerciseIdOrName.trim().toLowerCase();

  // Sort sessions newest to oldest
  const sortedSessions = [...sessions]
    .filter((s) => s.id !== currentSessionId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  for (const session of sortedSessions) {
    if (!Array.isArray(session.exercises)) continue;

    const matchedExercise = session.exercises.find((ex) => {
      if (ex.exerciseId && ex.exerciseId === exerciseIdOrName) return true;
      return ex.exerciseName.trim().toLowerCase() === query;
    });

    if (matchedExercise && matchedExercise.sets && matchedExercise.sets.length > 0) {
      return { session, exercise: matchedExercise };
    }
  }

  return null;
}

/**
 * Formats previous set performance into a compact string like "20 kg × 8" or "30s".
 */
export function formatPreviousPerformance(
  set?: ExerciseSet | null,
  isTimed?: boolean,
): string | null {
  if (!set) return null;

  if (isTimed && (set.durationSeconds || 0) > 0) {
    if ((set.weightKg || 0) > 0) {
      return `${set.weightKg} kg • ${set.durationSeconds}s`;
    }
    return `${set.durationSeconds}s`;
  }

  const hasWeight = (set.weightKg || 0) > 0;
  const hasReps = (set.reps || 0) > 0;

  if (hasWeight && hasReps) {
    return `${set.weightKg} kg × ${set.reps}`;
  }
  if (hasReps) {
    return `${set.reps} reps`;
  }
  if (hasWeight) {
    return `${set.weightKg} kg`;
  }

  return null;
}

/**
 * Calculates muscle group distribution from an array of exercises and dataset metadata.
 */
export function calculateMuscleDistribution(
  exercisesList: { exerciseId?: string; exerciseName: string; setsCount?: number }[],
  allExercises: Exercise[] | null | undefined,
): MuscleDistribution[] {
  if (!Array.isArray(exercisesList) || exercisesList.length === 0) {
    return [];
  }

  const muscleMap = new Map<string, { count: number; exercises: Set<string> }>();

  for (const item of exercisesList) {
    const meta = allExercises?.find(
      (e) =>
        (item.exerciseId && e.id === item.exerciseId) ||
        e.name.toLowerCase() === item.exerciseName.toLowerCase(),
    );

    // Target muscle or category
    const primaryMuscle =
      meta?.target || meta?.muscleGroup || meta?.category || "Other";
    const muscleKey =
      primaryMuscle.charAt(0).toUpperCase() + primaryMuscle.slice(1).toLowerCase();

    const weight = item.setsCount && item.setsCount > 0 ? item.setsCount : 1;

    const current = muscleMap.get(muscleKey) || {
      count: 0,
      exercises: new Set<string>(),
    };
    current.count += weight;
    current.exercises.add(item.exerciseName);
    muscleMap.set(muscleKey, current);

    // Add secondary muscles with 0.5 weight if available
    if (Array.isArray(meta?.secondaryMuscles)) {
      for (const sec of meta.secondaryMuscles) {
        const secKey = sec.charAt(0).toUpperCase() + sec.slice(1).toLowerCase();
        const secCurrent = muscleMap.get(secKey) || {
          count: 0,
          exercises: new Set<string>(),
        };
        secCurrent.count += weight * 0.5;
        secCurrent.exercises.add(item.exerciseName);
        muscleMap.set(secKey, secCurrent);
      }
    }
  }

  let totalWeight = 0;
  muscleMap.forEach((v) => {
    totalWeight += v.count;
  });

  if (totalWeight === 0) return [];

  const results: MuscleDistribution[] = [];
  muscleMap.forEach((v, k) => {
    results.push({
      muscle: k,
      count: Math.round(v.count * 10) / 10,
      percentage: Math.round((v.count / totalWeight) * 100),
      exercises: Array.from(v.exercises),
    });
  });

  return results.sort((a, b) => b.count - a.count);
}
