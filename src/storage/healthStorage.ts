import { DailyActivity } from "@/types/health";
import { getTodayDateString } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const HEALTH_STORAGE_KEYS = {
  WATER_LOGS: "@caloryx/water_logs_v1",
  WATER_GOAL: "@caloryx/water_goal_v1",
  STEP_GOAL: "@caloryx/step_goal_v1",
  ACTIVITY_LOGS: "@caloryx/activity_logs_v1",
  WEIGHT_LOGS: "@caloryx/weight_logs_v1",
};

export const DEFAULT_WATER_GOAL_ML = 2500;
export const DEFAULT_STEP_GOAL = 10000;

// -----------------------------------------------------------------------------
// Water Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredWaterGoal(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.WATER_GOAL);
    return raw ? Number(raw) : DEFAULT_WATER_GOAL_ML;
  } catch {
    return DEFAULT_WATER_GOAL_ML;
  }
}

export async function setStoredWaterGoal(goalMl: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      HEALTH_STORAGE_KEYS.WATER_GOAL,
      String(Math.max(500, goalMl)),
    );
  } catch (err) {
    console.warn("Failed to set water goal:", err);
  }
}

export async function getStoredWaterForDate(dateStr?: string): Promise<number> {
  const date = dateStr || getTodayDateString();
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.WATER_LOGS);
    if (!raw) return 0;
    const map = JSON.parse(raw);
    return Number(map[date] || 0);
  } catch {
    return 0;
  }
}

export async function getAllStoredWaterLogs(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.WATER_LOGS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function setStoredWaterForDate(
  amountMl: number,
  dateStr?: string,
): Promise<number> {
  const date = dateStr || getTodayDateString();
  const safeAmount = Math.max(0, amountMl);
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.WATER_LOGS);
    const map = raw ? JSON.parse(raw) : {};
    map[date] = safeAmount;
    await AsyncStorage.setItem(
      HEALTH_STORAGE_KEYS.WATER_LOGS,
      JSON.stringify(map),
    );
    return safeAmount;
  } catch (err) {
    console.warn("Failed to save water log:", err);
    return safeAmount;
  }
}

// -----------------------------------------------------------------------------
// Steps & Activity Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredStepGoal(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.STEP_GOAL);
    return raw ? Number(raw) : DEFAULT_STEP_GOAL;
  } catch {
    return DEFAULT_STEP_GOAL;
  }
}

export async function setStoredStepGoal(goal: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      HEALTH_STORAGE_KEYS.STEP_GOAL,
      String(Math.max(1000, goal)),
    );
  } catch (err) {
    console.warn("Failed to set step goal:", err);
  }
}

export async function getStoredActivityForDate(
  dateStr?: string,
): Promise<DailyActivity | null> {
  const date = dateStr || getTodayDateString();
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.ACTIVITY_LOGS);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[date] || null;
  } catch {
    return null;
  }
}

export async function getAllStoredActivityLogs(): Promise<
  Record<string, DailyActivity>
> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.ACTIVITY_LOGS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function setStoredActivityForDate(
  activity: DailyActivity,
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.ACTIVITY_LOGS);
    const map = raw ? JSON.parse(raw) : {};
    map[activity.date] = activity;
    await AsyncStorage.setItem(
      HEALTH_STORAGE_KEYS.ACTIVITY_LOGS,
      JSON.stringify(map),
    );
  } catch (err) {
    console.warn("Failed to save activity log:", err);
  }
}

// -----------------------------------------------------------------------------
// Weight Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredWeightLogs(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.WEIGHT_LOGS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function recordStoredWeight(
  weightKg: number,
  dateStr?: string,
): Promise<void> {
  const date = dateStr || getTodayDateString();
  const safeWeight = Math.max(20, Math.min(300, weightKg));
  try {
    const raw = await AsyncStorage.getItem(HEALTH_STORAGE_KEYS.WEIGHT_LOGS);
    const map = raw ? JSON.parse(raw) : {};
    map[date] = safeWeight;
    await AsyncStorage.setItem(
      HEALTH_STORAGE_KEYS.WEIGHT_LOGS,
      JSON.stringify(map),
    );
  } catch (err) {
    console.warn("Failed to record weight log:", err);
  }
}
