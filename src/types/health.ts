export type WaterLog = {
  id?: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  goalMl: number;
  updatedAt?: string;
};

export type DailyActivity = {
  id?: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  stepCount: number;
  stepGoal: number;
  distanceMeters?: number;
  caloriesBurned?: number;
  updatedAt?: string;
};

export type HealthConnectStatus = {
  isAvailable: boolean;
  isConnected: boolean;
  hasPermission: boolean;
  lastCheckedAt: string;
};

export type TimeFilter = "7d" | "30d" | "90d";

export type WeightEntry = {
  date: string; // YYYY-MM-DD
  weightKg: number;
};

export type ProgressTrend = "improving" | "stable" | "needs_attention";

export type DailyNutritionPoint = {
  date: string;
  label: string; // e.g. "Mon" or "Sep 1"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories: number;
  hasData: boolean;
  meetsGoal: boolean;
};

export type DailyMetricPoint = {
  date: string;
  label: string;
  value: number;
  target: number;
  hasData: boolean;
  meetsGoal: boolean;
};

export type RangeNutritionSummary = {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  consistencyPercent: number;
  daysLogged: number;
  totalDays: number;
};
