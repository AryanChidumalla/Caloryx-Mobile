import {
  DailyGoals,
  GuestProfile,
  MealEntry,
  MealType,
  SavedFood,
} from "@/types/nutrition";
import { formatLocalDate, getTodayDateString } from "@/utils/date";
import { sanitizeNumber } from "@/utils/nutritionCalculations";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  MEALS: "@caloryx/meals_v2",
  GOALS: "@caloryx/goals_v2",
  SAVED_FOODS: "@caloryx/saved_foods_v2",
  GUEST_PROFILE: "@caloryx/guest_profile",
  LEGACY_MEALS: "meals",
};

// Caloryx 2000 kcal default (30% P, 40% C, 30% F)
export const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 67,
};

const DEFAULT_SAVED_FOODS: SavedFood[] = [
  {
    id: "preset-1",
    name: "Oatmeal with Whey Protein",
    calories: 380,
    protein: 32,
    carbs: 48,
    fat: 6,
    servingSize: "1 bowl (80g oats + 1 scoop whey)",
    isFavorite: true,
    useCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "preset-2",
    name: "Grilled Chicken Breast",
    calories: 245,
    protein: 46,
    carbs: 0,
    fat: 5,
    servingSize: "150g cooked",
    isFavorite: true,
    useCount: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "preset-3",
    name: "Large Whole Eggs (2)",
    calories: 140,
    protein: 12,
    carbs: 1,
    fat: 10,
    servingSize: "2 large eggs (100g)",
    isFavorite: false,
    useCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "preset-4",
    name: "White Basmati Rice",
    calories: 210,
    protein: 4,
    carbs: 45,
    fat: 1,
    servingSize: "1 katori cooked (150g)",
    isFavorite: false,
    useCount: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "preset-5",
    name: "Paneer (Low Fat / Fresh)",
    calories: 265,
    protein: 18,
    carbs: 3,
    fat: 20,
    servingSize: "100g raw",
    isFavorite: false,
    useCount: 1,
    createdAt: new Date().toISOString(),
  },
];

function inferMealTypeFromDate(isoDateStr: string): MealType {
  try {
    const d = new Date(isoDateStr);
    const hour = d.getHours();
    if (hour >= 5 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 16) return "lunch";
    if (hour >= 16 && hour < 22) return "dinner";
    return "snack";
  } catch {
    return "snack";
  }
}

/**
 * Migration from v1 un-dated format to v2 date-keyed entries.
 */
async function migrateLegacyMealsIfNecessary(): Promise<MealEntry[]> {
  try {
    const rawLegacy = await AsyncStorage.getItem(STORAGE_KEYS.LEGACY_MEALS);
    if (!rawLegacy) return [];

    const parsed = JSON.parse(rawLegacy);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    const migrated: MealEntry[] = parsed.map((item, idx) => {
      const createdAt = item.createdAt || new Date().toISOString();
      const date = item.date || formatLocalDate(new Date(createdAt));

      return {
        id: item.id || `legacy-${Date.now()}-${idx}`,
        name: String(item.name || "Untitled Meal"),
        calories: sanitizeNumber(item.calories, 0, true),
        protein: sanitizeNumber(item.protein, 0),
        carbs: sanitizeNumber(item.carbs, 0),
        fat: sanitizeNumber(item.fat, 0),
        date,
        mealType: item.mealType || inferMealTypeFromDate(createdAt),
        servingSize: item.servingSize || undefined,
        servings: sanitizeNumber(item.servings, 1),
        createdAt,
        updatedAt: item.updatedAt || createdAt,
      };
    });

    await AsyncStorage.setItem(
      STORAGE_KEYS.MEALS,
      JSON.stringify(migrated),
    );
    return migrated;
  } catch (err) {
    console.error("Failed to migrate legacy meals:", err);
    return [];
  }
}

// -----------------------------------------------------------------------------
// Meals Storage Methods
// -----------------------------------------------------------------------------

export async function getMeals(): Promise<MealEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
    if (!data) {
      return await migrateLegacyMealsIfNecessary();
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((m) => ({
      ...m,
      calories: sanitizeNumber(m.calories, 0, true),
      protein: sanitizeNumber(m.protein, 0),
      carbs: sanitizeNumber(m.carbs, 0),
      fat: sanitizeNumber(m.fat, 0),
      servings: sanitizeNumber(m.servings, 1),
    }));
  } catch (err) {
    console.error("Error loading meals from AsyncStorage:", err);
    return [];
  }
}

export async function saveMeals(meals: MealEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  } catch (err) {
    console.error("Error saving meals to AsyncStorage:", err);
    throw err;
  }
}

export async function addMeal(
  meal: Omit<MealEntry, "id" | "createdAt">,
): Promise<MealEntry> {
  const currentMeals = await getMeals();
  const now = new Date().toISOString();
  const newMeal: MealEntry = {
    ...meal,
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    calories: sanitizeNumber(meal.calories, 0, true),
    protein: sanitizeNumber(meal.protein, 0),
    carbs: sanitizeNumber(meal.carbs, 0),
    fat: sanitizeNumber(meal.fat, 0),
    servings: sanitizeNumber(meal.servings, 1),
    date: meal.date || getTodayDateString(),
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newMeal, ...currentMeals];
  await saveMeals(updated);
  return newMeal;
}

export async function updateMeal(meal: MealEntry): Promise<MealEntry> {
  const currentMeals = await getMeals();
  const updatedMeal: MealEntry = {
    ...meal,
    calories: sanitizeNumber(meal.calories, 0, true),
    protein: sanitizeNumber(meal.protein, 0),
    carbs: sanitizeNumber(meal.carbs, 0),
    fat: sanitizeNumber(meal.fat, 0),
    servings: sanitizeNumber(meal.servings, 1),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = currentMeals.map((m) =>
    m.id === updatedMeal.id ? updatedMeal : m,
  );
  await saveMeals(updatedList);
  return updatedMeal;
}

export async function deleteMeal(id: string): Promise<void> {
  const currentMeals = await getMeals();
  const filtered = currentMeals.filter((m) => m.id !== id);
  await saveMeals(filtered);
}

export async function clearAllMeals(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.MEALS);
  await AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_MEALS);
}

// -----------------------------------------------------------------------------
// Daily Goals Storage Methods
// -----------------------------------------------------------------------------

export async function getGoals(): Promise<DailyGoals> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    if (!data) return DEFAULT_GOALS;
    const parsed = JSON.parse(data);
    return {
      calories: sanitizeNumber(parsed.calories, DEFAULT_GOALS.calories, true),
      protein: sanitizeNumber(parsed.protein, DEFAULT_GOALS.protein),
      carbs: sanitizeNumber(parsed.carbs, DEFAULT_GOALS.carbs),
      fat: sanitizeNumber(parsed.fat, DEFAULT_GOALS.fat),
    };
  } catch (err) {
    console.error("Error reading goals from AsyncStorage:", err);
    return DEFAULT_GOALS;
  }
}

export async function updateGoals(goals: DailyGoals): Promise<DailyGoals> {
  const sanitized: DailyGoals = {
    calories: sanitizeNumber(goals.calories, DEFAULT_GOALS.calories, true),
    protein: sanitizeNumber(goals.protein, DEFAULT_GOALS.protein),
    carbs: sanitizeNumber(goals.carbs, DEFAULT_GOALS.carbs),
    fat: sanitizeNumber(goals.fat, DEFAULT_GOALS.fat),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(sanitized));
  return sanitized;
}

// -----------------------------------------------------------------------------
// Guest Profile Storage Methods
// -----------------------------------------------------------------------------

export async function getGuestProfile(): Promise<GuestProfile | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_PROFILE);
    if (!data) return null;
    return JSON.parse(data) as GuestProfile;
  } catch (err) {
    console.error("Error reading guest profile:", err);
    return null;
  }
}

export async function saveGuestProfile(profile: GuestProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.GUEST_PROFILE,
      JSON.stringify(profile),
    );
  } catch (err) {
    console.error("Error saving guest profile:", err);
  }
}

// -----------------------------------------------------------------------------
// Saved & Favorite Foods Storage Methods
// -----------------------------------------------------------------------------

export async function getSavedFoods(): Promise<SavedFood[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_FOODS);
    if (!data) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_FOODS,
        JSON.stringify(DEFAULT_SAVED_FOODS),
      );
      return DEFAULT_SAVED_FOODS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_SAVED_FOODS;
  } catch (err) {
    console.error("Error reading saved foods:", err);
    return DEFAULT_SAVED_FOODS;
  }
}

export async function saveFoodItem(
  food: Omit<SavedFood, "id" | "useCount" | "createdAt">,
): Promise<SavedFood> {
  const savedFoods = await getSavedFoods();
  const newFood: SavedFood = {
    ...food,
    id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    calories: sanitizeNumber(food.calories, 0, true),
    protein: sanitizeNumber(food.protein, 0),
    carbs: sanitizeNumber(food.carbs, 0),
    fat: sanitizeNumber(food.fat, 0),
    useCount: 1,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };

  const updated = [newFood, ...savedFoods];
  await AsyncStorage.setItem(
    STORAGE_KEYS.SAVED_FOODS,
    JSON.stringify(updated),
  );
  return newFood;
}

export async function deleteSavedFoodItem(id: string): Promise<void> {
  const savedFoods = await getSavedFoods();
  const filtered = savedFoods.filter((f) => f.id !== id);
  await AsyncStorage.setItem(
    STORAGE_KEYS.SAVED_FOODS,
    JSON.stringify(filtered),
  );
}

export async function incrementSavedFoodUsage(id: string): Promise<void> {
  const savedFoods = await getSavedFoods();
  const updated = savedFoods.map((f) =>
    f.id === id
      ? {
          ...f,
          useCount: (f.useCount || 0) + 1,
          lastUsedAt: new Date().toISOString(),
        }
      : f,
  );
  await AsyncStorage.setItem(
    STORAGE_KEYS.SAVED_FOODS,
    JSON.stringify(updated),
  );
}
