export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MacroNutrients = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealEntry = MacroNutrients & {
  id: string; // uuid
  name: string; // dish_name
  date: string; // ISO format "YYYY-MM-DD" in local time
  mealType: MealType;
  foodId?: number | null; // food_id (foreign key to Supabase foods.id)
  servingSize?: string; // unit name / label
  servings?: number; // quantity / serving count
  createdAt: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
};

export type DailyGoals = MacroNutrients;

export type SavedFood = MacroNutrients & {
  id: string;
  name: string;
  servingSize?: string;
  isFavorite?: boolean;
  useCount: number;
  lastUsedAt?: string;
  createdAt: string;
};

export type DailyTotals = MacroNutrients;

export type RemainingMacros = MacroNutrients & {
  isCalorieExceeded: boolean;
  isProteinExceeded: boolean;
  isCarbsExceeded: boolean;
  isFatExceeded: boolean;
};

export type MacroPercentages = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealCategoryData = {
  meals: MealEntry[];
  totals: DailyTotals;
};

export type MealCategoryBreakdown = {
  breakfast: MealCategoryData;
  lunch: MealCategoryData;
  dinner: MealCategoryData;
  snack: MealCategoryData;
};

// -----------------------------------------------------------------------------
// User Profile & Body Stats Types (Matches Supabase `profiles` table)
// -----------------------------------------------------------------------------

export type Sex = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "heavy";

export type PrimaryGoal = "lose_fat" | "maintain" | "build_muscle";

export type UserProfile = {
  id: string; // uuid (matches auth.users.id)
  username?: string | null;
  sex?: Sex | null;
  age?: number | null;
  height?: number | null; // in cm
  weight?: number | null; // in kg
  activity_level?: ActivityLevel | string | null;
  target_calorie?: number | null;
  created_at?: string;
  primary_goal?: PrimaryGoal;
};

export type GuestProfile = Omit<UserProfile, "id" | "created_at"> & {
  goal?: PrimaryGoal;
  calorieAdjustment?: number;
};
