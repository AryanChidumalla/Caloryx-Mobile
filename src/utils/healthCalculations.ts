/**
 * Health and daily metric calculations and formatting utilities.
 */

/**
 * Estimates distance in meters based on step count.
 * Average human stride length is approximately 0.762 meters (~2.5 feet).
 */
export function estimateDistanceMeters(steps: number): number {
  const safeSteps = Math.max(0, steps);
  return Math.round(safeSteps * 0.762);
}

/**
 * Estimates active calories burned based on step count.
 * Average energetic cost of walking is approximately 0.04 kcal per step (~40 kcal per 1,000 steps).
 */
export function estimateCaloriesBurned(steps: number): number {
  const safeSteps = Math.max(0, steps);
  return Math.round(safeSteps * 0.04);
}

/**
 * Formats distance in meters into a readable kilometers string (e.g. "3.2 km").
 */
export function formatDistanceKm(meters: number): string {
  const safeMeters = Math.max(0, meters);
  const km = safeMeters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Formats water amount in milliliters into a clean display string (e.g. "250 ml" or "1.5 L").
 */
export function formatWaterAmount(ml: number): string {
  const safeMl = Math.max(0, ml);
  if (safeMl >= 1000) {
    const liters = safeMl / 1000;
    return `${Number(liters.toFixed(2))} L`;
  }
  return `${safeMl} ml`;
}

/**
 * Calculates step progress ratio, percentage, remaining steps, and goal status.
 */
export function calculateStepProgress(
  steps: number,
  goal: number,
): {
  progressRatio: number;
  progressPercent: number;
  remainingSteps: number;
  isGoalReached: boolean;
} {
  const safeSteps = Math.max(0, steps);
  const safeGoal = Math.max(1, goal);
  const progressRatio = Math.min(1, safeSteps / safeGoal);
  const progressPercent = Math.round((safeSteps / safeGoal) * 100);
  const remainingSteps = Math.max(0, safeGoal - safeSteps);
  const isGoalReached = safeSteps >= safeGoal;

  return {
    progressRatio,
    progressPercent,
    remainingSteps,
    isGoalReached,
  };
}

/**
 * Calculates water hydration progress ratio, percentage, remaining ml, and goal status.
 */
export function calculateWaterProgress(
  intakeMl: number,
  goalMl: number,
): {
  progressRatio: number;
  progressPercent: number;
  remainingMl: number;
  isGoalReached: boolean;
} {
  const safeIntake = Math.max(0, intakeMl);
  const safeGoal = Math.max(1, goalMl);
  const progressRatio = Math.min(1, safeIntake / safeGoal);
  const progressPercent = Math.round((safeIntake / safeGoal) * 100);
  const remainingMl = Math.max(0, safeGoal - safeIntake);
  const isGoalReached = safeIntake >= safeGoal;

  return {
    progressRatio,
    progressPercent,
    remainingMl,
    isGoalReached,
  };
}

/**
 * Formats duration in minutes into a readable hours and minutes string (e.g. "7h 30m" or "45m").
 */
export function formatSleepDuration(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Calculates sleep progress ratio, percentage, remaining minutes, and goal status.
 */
export function calculateSleepProgress(
  durationMinutes: number,
  goalMinutes: number,
): {
  progressRatio: number;
  progressPercent: number;
  remainingMinutes: number;
  isGoalReached: boolean;
} {
  const safeDuration = Math.max(0, durationMinutes);
  const safeGoal = Math.max(1, goalMinutes);
  const progressRatio = Math.min(1, safeDuration / safeGoal);
  const progressPercent = Math.round((safeDuration / safeGoal) * 100);
  const remainingMinutes = Math.max(0, safeGoal - safeDuration);
  const isGoalReached = safeDuration >= safeGoal;

  return {
    progressRatio,
    progressPercent,
    remainingMinutes,
    isGoalReached,
  };
}

/**
 * Determines sleep quality assessment based on duration vs target.
 */
export function getSleepQualityLabel(
  durationMinutes: number,
  goalMinutes: number,
): {
  quality: "optimal" | "good" | "fair" | "short";
  label: string;
  color: string;
} {
  if (durationMinutes === 0) {
    return { quality: "short", label: "No log", color: "#555555" };
  }
  const ratio = durationMinutes / Math.max(1, goalMinutes);
  if (ratio >= 0.95 && ratio <= 1.2) {
    return { quality: "optimal", label: "Optimal", color: "#34D399" };
  }
  if (ratio >= 0.85) {
    return { quality: "good", label: "Good", color: "#60A5FA" };
  }
  if (ratio >= 0.7) {
    return { quality: "fair", label: "Fair", color: "#FBBF24" };
  }
  return { quality: "short", label: "Short", color: "#F87171" };
}
