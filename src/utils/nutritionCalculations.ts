import {
  ActivityLevel,
  DailyGoals,
  DailyTotals,
  MacroNutrients,
  MacroPercentages,
  MealCategoryBreakdown,
  MealEntry,
  MealType,
  PrimaryGoal,
  RemainingMacros,
  Sex,
} from "@/types/nutrition";

/**
 * Generates a valid RFC4122 v4 UUID string for food log IDs.
 */
export function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Safely sanitizes numeric inputs, preventing NaN, Infinity, and negative numbers.
 */
export function sanitizeNumber(
  value: unknown,
  fallback = 0,
  isInteger = false,
): number {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return fallback;
  }
  const positive = Math.max(0, parsed);
  return isInteger ? Math.round(positive) : Math.round(positive * 10) / 10;
}

/**
 * Estimates calories based on macronutrient weights:
 * Calories = (Protein * 4) + (Carbs * 4) + (Fat * 9)
 */
export function estimateCaloriesFromMacros(
  protein: number,
  carbs: number,
  fat: number,
): number {
  const p = sanitizeNumber(protein);
  const c = sanitizeNumber(carbs);
  const f = sanitizeNumber(fat);
  return Math.round(p * 4 + c * 4 + f * 9);
}

/**
 * Calculates sum of nutrients across a list of meals.
 */
export function calculateDailyTotals(meals: MealEntry[]): DailyTotals {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + sanitizeNumber(meal.calories, 0, true),
      protein:
        Math.round((acc.protein + sanitizeNumber(meal.protein)) * 10) / 10,
      carbs: Math.round((acc.carbs + sanitizeNumber(meal.carbs)) * 10) / 10,
      fat: Math.round((acc.fat + sanitizeNumber(meal.fat)) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/**
 * Calculates remaining calories and macros, plus flags indicating whether targets are exceeded.
 */
export function calculateRemaining(
  totals: DailyTotals,
  goals: DailyGoals,
): RemainingMacros {
  const safeCalories = sanitizeNumber(goals.calories, 2000, true);
  const safeProtein = sanitizeNumber(goals.protein, 150);
  const safeCarbs = sanitizeNumber(goals.carbs, 200);
  const safeFat = sanitizeNumber(goals.fat, 67);

  const calorieDiff = safeCalories - totals.calories;
  const proteinDiff = safeProtein - totals.protein;
  const carbsDiff = safeCarbs - totals.carbs;
  const fatDiff = safeFat - totals.fat;

  return {
    calories: Math.abs(calorieDiff),
    protein: Math.round(Math.abs(proteinDiff) * 10) / 10,
    carbs: Math.round(Math.abs(carbsDiff) * 10) / 10,
    fat: Math.round(Math.abs(fatDiff) * 10) / 10,
    isCalorieExceeded: totals.calories > safeCalories,
    isProteinExceeded: totals.protein > safeProtein,
    isCarbsExceeded: totals.carbs > safeCarbs,
    isFatExceeded: totals.fat > safeFat,
  };
}

/**
 * Calculates completion percentage for each macro without risking NaN or Infinity.
 */
export function calculatePercentages(
  totals: DailyTotals,
  goals: DailyGoals,
): MacroPercentages {
  const safeCalGoal = sanitizeNumber(goals.calories, 2000, true);
  const safeProGoal = sanitizeNumber(goals.protein, 150);
  const safeCarbGoal = sanitizeNumber(goals.carbs, 200);
  const safeFatGoal = sanitizeNumber(goals.fat, 67);

  return {
    calories:
      safeCalGoal > 0 ? Math.round((totals.calories / safeCalGoal) * 100) : 0,
    protein:
      safeProGoal > 0 ? Math.round((totals.protein / safeProGoal) * 100) : 0,
    carbs:
      safeCarbGoal > 0 ? Math.round((totals.carbs / safeCarbGoal) * 100) : 0,
    fat: safeFatGoal > 0 ? Math.round((totals.fat / safeFatGoal) * 100) : 0,
  };
}

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

/**
 * Groups a day's meals into categories (Breakfast, Lunch, Dinner, Snack) with subtotals.
 */
export function groupMealsByCategory(
  meals: MealEntry[],
): MealCategoryBreakdown {
  const result: MealCategoryBreakdown = {
    breakfast: {
      meals: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    },
    lunch: { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
    dinner: {
      meals: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    },
    snack: { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  };

  for (const meal of meals) {
    const type: MealType = MEAL_TYPES.includes(meal.mealType)
      ? meal.mealType
      : "snack";
    result[type].meals.push(meal);
  }

  for (const type of MEAL_TYPES) {
    result[type].totals = calculateDailyTotals(result[type].meals);
  }

  return result;
}

export function formatMacroString(
  macros: Pick<MacroNutrients, "protein" | "carbs" | "fat">,
): string {
  const p = sanitizeNumber(macros.protein);
  const c = sanitizeNumber(macros.carbs);
  const f = sanitizeNumber(macros.fat);
  return `${p}g P  •  ${c}g C  •  ${f}g F`;
}

// -----------------------------------------------------------------------------
// Calorie & Macro Target Calculations (Mifflin-St Jeor & Caloryx Web Model)
// -----------------------------------------------------------------------------

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula:
 * Male:   BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) + 5
 * Female: BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: Sex = "male",
): number {
  const w = sanitizeNumber(weightKg);
  const h = sanitizeNumber(heightCm);
  const a = sanitizeNumber(ageYears);

  if (w <= 0 || h <= 0 || a <= 0) {
    return 1600;
  }

  if (sex === "female") {
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }
  return Math.round(10 * w + 6.25 * h - 5 * a + 5);
}

/**
 * Activity level multipliers:
 * Sedentary:      1.2
 * Lightly Active: 1.375
 * Moderate:       1.55
 * Very Active:    1.725
 */
export function getActivityMultiplier(level?: ActivityLevel | string | null): number {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
    case "lightly_active":
      return 1.375;
    case "moderate":
    case "moderately_active":
      return 1.55;
    case "heavy":
    case "very_active":
    case "very_heavy":
      return 1.725;
    default:
      return 1.375;
  }
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE):
 * TDEE = BMR × activity multiplier
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel | string = "moderate",
): number {
  return Math.round(bmr * getActivityMultiplier(activityLevel));
}

/**
 * Calculates Daily Target Calories based on Primary Goal & Calorie Adjustment:
 * Lose Fat:        max(1200, TDEE - calorieAdjustment)
 * Maintain Weight: TDEE
 * Build Muscle:    TDEE + calorieAdjustment
 * Default calorie adjustment: 400 kcal/day (Range: 150-800)
 */
export function calculateTargetCalories(
  tdee: number,
  goal: PrimaryGoal = "maintain",
  calorieAdjustment = 400,
): number {
  const adj = sanitizeNumber(calorieAdjustment, 400);

  switch (goal) {
    case "lose_fat":
      return Math.max(1200, Math.round(tdee - adj));
    case "build_muscle":
      return Math.round(tdee + adj);
    case "maintain":
    default:
      return Math.round(tdee);
  }
}

/**
 * Calculates recommended macronutrient distribution using Caloryx Web Macro Split:
 * Protein:       30% of target calories / 4
 * Carbohydrates: 40% of target calories / 4
 * Fat:           30% of target calories / 9
 */
export function calculateMacroTargetsFromCalories(
  targetCalories: number,
): DailyGoals {
  const calories = Math.max(1000, Math.round(targetCalories));

  // Protein: 30% of target calories / 4
  const protein = Math.round((calories * 0.3) / 4);
  // Carbohydrates: 40% of target calories / 4
  const carbs = Math.round((calories * 0.4) / 4);
  // Fat: 30% of target calories / 9
  const fat = Math.round((calories * 0.3) / 9);

  return {
    calories,
    protein,
    carbs,
    fat,
  };
}
