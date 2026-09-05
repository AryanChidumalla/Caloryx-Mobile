import type { ExerciseSet, WorkoutSession } from "@/types/workout";

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
