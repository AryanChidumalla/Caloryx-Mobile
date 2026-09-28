import { DailyActivity, SleepLog } from "@/types/health";
import { getTodayDateString } from "@/utils/date";
import {
  getJsonStorageItem,
  setJsonStorageItem,
} from "./asyncStorageUtils";

export const HEALTH_STORAGE_KEYS = {
  WATER_LOGS: "@caloryx/water_logs_v1",
  WATER_GOAL: "@caloryx/water_goal_v1",
  STEP_GOAL: "@caloryx/step_goal_v1",
  ACTIVITY_LOGS: "@caloryx/activity_logs_v1",
  WEIGHT_LOGS: "@caloryx/weight_logs_v1",
  SLEEP_LOGS: "@caloryx/sleep_logs_v1",
  SLEEP_GOAL: "@caloryx/sleep_goal_v1",
};

export const DEFAULT_WATER_GOAL_ML = 2500;
export const DEFAULT_STEP_GOAL = 10000;
export const DEFAULT_SLEEP_GOAL_MINUTES = 480; // 8 hours

function getScopedKey(baseKey: string, userId?: string | null): string {
  const scope = userId && userId.trim() ? userId.trim() : "guest";
  return `${baseKey}:${scope}`;
}

// -----------------------------------------------------------------------------
// Water Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredWaterGoal(
  userId?: string | null,
): Promise<number> {
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.WATER_GOAL, userId);
  const val = await getJsonStorageItem<number | null>(scopedKey, null);
  if (val !== null) return val;

  return getJsonStorageItem<number>(
    HEALTH_STORAGE_KEYS.WATER_GOAL,
    DEFAULT_WATER_GOAL_ML,
  );
}

export async function setStoredWaterGoal(
  goalMl: number,
  userId?: string | null,
): Promise<void> {
  const safeGoal = Math.max(500, goalMl);
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.WATER_GOAL, userId);
  await setJsonStorageItem(scopedKey, safeGoal);
}

export async function getAllStoredWaterLogs(
  userId?: string | null,
): Promise<Record<string, number>> {
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.WATER_LOGS, userId);
  const data = await getJsonStorageItem<Record<string, number> | null>(
    scopedKey,
    null,
  );
  if (data !== null) return data;

  return getJsonStorageItem<Record<string, number>>(
    HEALTH_STORAGE_KEYS.WATER_LOGS,
    {},
  );
}

export async function getStoredWaterForDate(
  dateStr?: string,
  userId?: string | null,
): Promise<number> {
  const date = dateStr || getTodayDateString();
  const logs = await getAllStoredWaterLogs(userId);
  return Number(logs[date] || 0);
}

export async function setStoredWaterForDate(
  amountMl: number,
  dateStr?: string,
  userId?: string | null,
): Promise<number> {
  const date = dateStr || getTodayDateString();
  const safeAmount = Math.max(0, amountMl);
  const logs = await getAllStoredWaterLogs(userId);
  logs[date] = safeAmount;
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.WATER_LOGS, userId);
  await setJsonStorageItem(scopedKey, logs);
  return safeAmount;
}

// -----------------------------------------------------------------------------
// Steps & Activity Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredStepGoal(
  userId?: string | null,
): Promise<number> {
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.STEP_GOAL, userId);
  const val = await getJsonStorageItem<number | null>(scopedKey, null);
  if (val !== null) return val;

  return getJsonStorageItem<number>(
    HEALTH_STORAGE_KEYS.STEP_GOAL,
    DEFAULT_STEP_GOAL,
  );
}

export async function setStoredStepGoal(
  goal: number,
  userId?: string | null,
): Promise<void> {
  const safeGoal = Math.max(1000, goal);
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.STEP_GOAL, userId);
  await setJsonStorageItem(scopedKey, safeGoal);
}

export async function getAllStoredActivityLogs(
  userId?: string | null,
): Promise<Record<string, DailyActivity>> {
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.ACTIVITY_LOGS, userId);
  const data = await getJsonStorageItem<Record<string, DailyActivity> | null>(
    scopedKey,
    null,
  );
  if (data !== null) return data;

  return getJsonStorageItem<Record<string, DailyActivity>>(
    HEALTH_STORAGE_KEYS.ACTIVITY_LOGS,
    {},
  );
}

export async function getStoredActivityForDate(
  dateStr?: string,
  userId?: string | null,
): Promise<DailyActivity | null> {
  const date = dateStr || getTodayDateString();
  const logs = await getAllStoredActivityLogs(userId);
  return logs[date] || null;
}

export async function setStoredActivityForDate(
  activity: DailyActivity,
  userId?: string | null,
): Promise<void> {
  const logs = await getAllStoredActivityLogs(userId);
  logs[activity.date] = activity;
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.ACTIVITY_LOGS, userId);
  await setJsonStorageItem(scopedKey, logs);
}

// -----------------------------------------------------------------------------
// Weight Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredWeightLogs(
  userId?: string | null,
): Promise<Record<string, number>> {
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.WEIGHT_LOGS, userId);
  const data = await getJsonStorageItem<Record<string, number> | null>(
    scopedKey,
    null,
  );
  if (data !== null) return data;

  return getJsonStorageItem<Record<string, number>>(
    HEALTH_STORAGE_KEYS.WEIGHT_LOGS,
    {},
  );
}

export async function recordStoredWeight(
  weightKg: number,
  dateStr?: string,
  userId?: string | null,
): Promise<void> {
  const date = dateStr || getTodayDateString();
  const safeWeight = Math.max(20, Math.min(300, weightKg));
  const logs = await getStoredWeightLogs(userId);
  logs[date] = safeWeight;
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.WEIGHT_LOGS, userId);
  await setJsonStorageItem(scopedKey, logs);
}

// -----------------------------------------------------------------------------
// Sleep Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredSleepGoal(
  userId?: string | null,
): Promise<number> {
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.SLEEP_GOAL, userId);
  const val = await getJsonStorageItem<number | null>(scopedKey, null);
  if (val !== null) return val;

  return getJsonStorageItem<number>(
    HEALTH_STORAGE_KEYS.SLEEP_GOAL,
    DEFAULT_SLEEP_GOAL_MINUTES,
  );
}

export async function setStoredSleepGoal(
  goalMinutes: number,
  userId?: string | null,
): Promise<void> {
  const safeGoal = Math.max(180, Math.min(840, goalMinutes));
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.SLEEP_GOAL, userId);
  await setJsonStorageItem(scopedKey, safeGoal);
}

export async function getAllStoredSleepLogs(
  userId?: string | null,
): Promise<Record<string, SleepLog>> {
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.SLEEP_LOGS, userId);
  const data = await getJsonStorageItem<Record<string, SleepLog> | null>(
    scopedKey,
    null,
  );
  if (data !== null) return data;

  return getJsonStorageItem<Record<string, SleepLog>>(
    HEALTH_STORAGE_KEYS.SLEEP_LOGS,
    {},
  );
}

export async function getStoredSleepForDate(
  dateStr: string,
  userId?: string | null,
): Promise<SleepLog | null> {
  const all = await getAllStoredSleepLogs(userId);
  return all[dateStr] || null;
}

export async function setStoredSleepForDate(
  log: SleepLog,
  userId?: string | null,
): Promise<void> {
  const all = await getAllStoredSleepLogs(userId);
  all[log.date] = log;
  const scopedKey = getScopedKey(HEALTH_STORAGE_KEYS.SLEEP_LOGS, userId);
  await setJsonStorageItem(scopedKey, all);
}

// -----------------------------------------------------------------------------
// Guest Health Data Migration
// -----------------------------------------------------------------------------

export async function migrateGuestHealthData(userId: string): Promise<void> {
  if (!userId || userId === "guest") return;

  try {
    // 1. Water Goal
    const guestWaterGoal = await getStoredWaterGoal("guest");
    const userWaterGoal = await getJsonStorageItem<number | null>(
      getScopedKey(HEALTH_STORAGE_KEYS.WATER_GOAL, userId),
      null,
    );
    if (userWaterGoal === null && guestWaterGoal !== DEFAULT_WATER_GOAL_ML) {
      await setStoredWaterGoal(guestWaterGoal, userId);
    }

    // 1b. Sleep Goal
    const guestSleepGoal = await getStoredSleepGoal("guest");
    const userSleepGoal = await getJsonStorageItem<number | null>(
      getScopedKey(HEALTH_STORAGE_KEYS.SLEEP_GOAL, userId),
      null,
    );
    if (userSleepGoal === null && guestSleepGoal !== DEFAULT_SLEEP_GOAL_MINUTES) {
      await setStoredSleepGoal(guestSleepGoal, userId);
    }

    // 2. Step Goal
    const guestStepGoal = await getStoredStepGoal("guest");
    const userStepGoal = await getJsonStorageItem<number | null>(
      getScopedKey(HEALTH_STORAGE_KEYS.STEP_GOAL, userId),
      null,
    );
    if (userStepGoal === null && guestStepGoal !== DEFAULT_STEP_GOAL) {
      await setStoredStepGoal(guestStepGoal, userId);
    }

    // 3. Water Logs
    const guestWaterLogs = await getAllStoredWaterLogs("guest");
    if (Object.keys(guestWaterLogs).length > 0) {
      const userWaterLogs = await getJsonStorageItem<Record<string, number> | null>(
        getScopedKey(HEALTH_STORAGE_KEYS.WATER_LOGS, userId),
        null,
      );
      if (!userWaterLogs || Object.keys(userWaterLogs).length === 0) {
        await setJsonStorageItem(
          getScopedKey(HEALTH_STORAGE_KEYS.WATER_LOGS, userId),
          guestWaterLogs,
        );
      }
    }

    // 4. Weight Logs
    const guestWeightLogs = await getStoredWeightLogs("guest");
    if (Object.keys(guestWeightLogs).length > 0) {
      const userWeightLogs = await getJsonStorageItem<Record<string, number> | null>(
        getScopedKey(HEALTH_STORAGE_KEYS.WEIGHT_LOGS, userId),
        null,
      );
      if (!userWeightLogs || Object.keys(userWeightLogs).length === 0) {
        await setJsonStorageItem(
          getScopedKey(HEALTH_STORAGE_KEYS.WEIGHT_LOGS, userId),
          guestWeightLogs,
        );
      }
    }
  } catch (err) {
    console.warn("migrateGuestHealthData warning:", err);
  }
}
