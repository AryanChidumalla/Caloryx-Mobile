export type WaterLog = {
  id?: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  goalMl: number;
  updatedAt?: string;
};

export type SleepQuality = "optimal" | "good" | "fair" | "short";

export type SleepLog = {
  id?: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  goalMinutes: number;
  quality?: SleepQuality;
  notes?: string;
  source?: "manual" | "health_connect" | "apple_health";
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

export type StepTrackingSource =
  | "health_connect"
  | "pedometer"
  | "manual"
  | "none";

export type HealthConnectStatus = {
  source: StepTrackingSource;
  isAvailable: boolean;
  isConnected: boolean;
  hasPermission: boolean;
  isDenied?: boolean;
  lastCheckedAt: string;
  error?: string | null;
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
