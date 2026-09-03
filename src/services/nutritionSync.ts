import { supabase } from "@/lib/supabase";
import { MealEntry, MealType, UserProfile } from "@/types/nutrition";
import { formatLocalDate, getTodayDateString } from "@/utils/date";
import { generateUUID, sanitizeNumber } from "@/utils/nutritionCalculations";

export type SupabaseFoodLogRow = {
  id: string;
  user_id: string;
  food_id: number | null;
  meal_type: string;
  dish_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  quantity: number;
  unit: string | null;
  logged_at: string;
  created_at: string;
};

/**
 * Maps a Supabase `food_logs` row to the mobile `MealEntry` type.
 */
export function mapFoodLogRowToMealEntry(row: SupabaseFoodLogRow): MealEntry {
  const createdAt = row.created_at || new Date().toISOString();
  let date = getTodayDateString();

  if (row.logged_at) {
    if (row.logged_at.includes("T")) {
      date = formatLocalDate(new Date(row.logged_at));
    } else {
      date = row.logged_at.substring(0, 10);
    }
  }

  return {
    id: row.id,
    name: row.dish_name || "Untitled Meal",
    calories: sanitizeNumber(row.calories, 0, true),
    protein: sanitizeNumber(row.protein, 0),
    carbs: sanitizeNumber(row.carbs, 0),
    fat: sanitizeNumber(row.fats, 0),
    mealType: (row.meal_type as MealType) || "snack",
    date,
    foodId: row.food_id ?? null,
    servings: sanitizeNumber(row.quantity, 1),
    servingSize: row.unit || undefined,
    createdAt,
    updatedAt: createdAt,
  };
}

/**
 * Fetches all food logs for an authenticated user from Supabase.
 */
export async function fetchUserFoodLogs(userId: string): Promise<MealEntry[]> {
  try {
    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user food logs from Supabase:", error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((row) =>
      mapFoodLogRowToMealEntry(row as SupabaseFoodLogRow),
    );
  } catch (err) {
    console.error("fetchUserFoodLogs error:", err);
    throw err;
  }
}

/**
 * Inserts a new food log into Supabase `food_logs`.
 */
export async function insertFoodLog(
  userId: string,
  meal: Omit<MealEntry, "id" | "createdAt">,
): Promise<MealEntry> {
  const id = generateUUID();
  const now = new Date().toISOString();
  const date = meal.date || getTodayDateString();

  const insertPayload = {
    id,
    user_id: userId,
    food_id: meal.foodId ?? null,
    meal_type: meal.mealType || "snack",
    dish_name: meal.name.trim() || "Untitled Meal",
    calories: sanitizeNumber(meal.calories, 0, true),
    protein: sanitizeNumber(meal.protein, 0),
    carbs: sanitizeNumber(meal.carbs, 0),
    fats: sanitizeNumber(meal.fat, 0), // maps 'fat' to 'fats' column
    quantity: sanitizeNumber(meal.servings, 1),
    unit: meal.servingSize?.trim() || null,
    logged_at: date,
    created_at: now,
  };

  const { data, error } = await supabase
    .from("food_logs")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("Error inserting food log into Supabase:", error);
    throw error;
  }

  return mapFoodLogRowToMealEntry(data as SupabaseFoodLogRow);
}

/**
 * Updates an existing food log in Supabase `food_logs`.
 */
export async function updateFoodLog(
  userId: string,
  meal: MealEntry,
): Promise<MealEntry> {
  const updatePayload = {
    food_id: meal.foodId ?? null,
    meal_type: meal.mealType,
    dish_name: meal.name.trim(),
    calories: sanitizeNumber(meal.calories, 0, true),
    protein: sanitizeNumber(meal.protein, 0),
    carbs: sanitizeNumber(meal.carbs, 0),
    fats: sanitizeNumber(meal.fat, 0),
    quantity: sanitizeNumber(meal.servings, 1),
    unit: meal.servingSize?.trim() || null,
    logged_at: meal.date,
  };

  const { data, error } = await supabase
    .from("food_logs")
    .update(updatePayload)
    .eq("id", meal.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating food log in Supabase:", error);
    throw error;
  }

  return mapFoodLogRowToMealEntry(data as SupabaseFoodLogRow);
}

/**
 * Deletes a food log from Supabase `food_logs`.
 */
export async function deleteFoodLog(
  userId: string,
  mealId: string,
): Promise<void> {
  const { error } = await supabase
    .from("food_logs")
    .delete()
    .eq("id", mealId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting food log from Supabase:", error);
    throw error;
  }
}

/**
 * Clears all food logs for the user from Supabase.
 */
export async function clearAllUserFoodLogs(userId: string): Promise<void> {
  const { error } = await supabase
    .from("food_logs")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error clearing food logs from Supabase:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Profiles Table Service
// -----------------------------------------------------------------------------

/**
 * Fetches the user's profile from the Supabase `profiles` table.
 */
export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile from Supabase:", error);
      return null;
    }

    return data as UserProfile | null;
  } catch (err) {
    console.error("fetchUserProfile error:", err);
    return null;
  }
}

/**
 * Upserts a profile into the Supabase `profiles` table.
 */
export async function upsertUserProfile(
  profile: Partial<UserProfile> & { id: string },
): Promise<UserProfile> {
  const payload = {
    id: profile.id,
    username: profile.username ?? null,
    sex: profile.sex ?? null,
    age: profile.age != null ? Math.round(Number(profile.age)) : null,
    height: profile.height != null ? Number(profile.height) : null,
    weight: profile.weight != null ? Number(profile.weight) : null,
    activity_level: profile.activity_level ?? null,
    primary_goal: profile.primary_goal ?? null,
    target_calorie:
      profile.target_calorie != null
        ? Math.round(Number(profile.target_calorie))
        : null,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Error upserting profile in Supabase:", error);
    throw error;
  }

  return data as UserProfile;
}

// -----------------------------------------------------------------------------
// Guest-to-Account Migration
// -----------------------------------------------------------------------------

/**
 * Migrates local guest meals stored in AsyncStorage to Supabase `food_logs`.
 */
export async function migrateGuestMealsToSupabase(
  userId: string,
  guestMeals: MealEntry[],
): Promise<number> {
  if (!guestMeals || guestMeals.length === 0) {
    return 0;
  }

  const rows = guestMeals.map((meal) => {
    // Validate or generate UUID
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        meal.id,
      );
    const id = isUUID ? meal.id : generateUUID();

    return {
      id,
      user_id: userId,
      food_id: meal.foodId ?? null,
      meal_type: meal.mealType || "snack",
      dish_name: meal.name || "Untitled Meal",
      calories: sanitizeNumber(meal.calories, 0, true),
      protein: sanitizeNumber(meal.protein, 0),
      carbs: sanitizeNumber(meal.carbs, 0),
      fats: sanitizeNumber(meal.fat, 0),
      quantity: sanitizeNumber(meal.servings, 1),
      unit: meal.servingSize || null,
      logged_at: meal.date || getTodayDateString(),
      created_at: meal.createdAt || new Date().toISOString(),
    };
  });

  const { error } = await supabase.from("food_logs").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    console.error("Error migrating guest meals to Supabase:", error);
    throw error;
  }

  return rows.length;
}
