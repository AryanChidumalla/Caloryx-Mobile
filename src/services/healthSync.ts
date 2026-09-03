import { supabase } from "@/lib/supabase";
import { DailyActivity } from "@/types/health";
import { getTodayDateString } from "@/utils/date";

/**
 * Fetches water intake for a given date from Supabase `water_logs`.
 */
export async function fetchUserWaterForDate(
  userId: string,
  dateStr?: string,
): Promise<number | null> {
  const date = dateStr || getTodayDateString();
  try {
    const { data, error } = await supabase
      .from("water_logs")
      .select("amount_ml")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (error) {
      console.warn("Error fetching water log from Supabase:", error);
      return null;
    }

    return data ? Number(data.amount_ml) : null;
  } catch (err) {
    console.warn("fetchUserWaterForDate error:", err);
    return null;
  }
}

/**
 * Fetches all water intake records for a user from Supabase.
 */
export async function fetchAllUserWaterLogs(
  userId: string,
): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("water_logs")
      .select("date, amount_ml")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.warn("Error fetching all water logs from Supabase:", error);
      return {};
    }

    const map: Record<string, number> = {};
    (data || []).forEach((row) => {
      if (row.date) {
        map[row.date] = Number(row.amount_ml || 0);
      }
    });
    return map;
  } catch (err) {
    console.warn("fetchAllUserWaterLogs error:", err);
    return {};
  }
}

/**
 * Upserts water intake for a user and date into Supabase `water_logs`.
 */
export async function upsertUserWater(
  userId: string,
  amountMl: number,
  dateStr?: string,
): Promise<void> {
  const date = dateStr || getTodayDateString();
  try {
    const { error } = await supabase.from("water_logs").upsert(
      {
        user_id: userId,
        date,
        amount_ml: Math.max(0, amountMl),
      },
      { onConflict: "user_id,date" },
    );

    if (error) {
      console.warn("Failed to sync water to Supabase:", error);
    }
  } catch (err) {
    console.warn("upsertUserWater error:", err);
  }
}

/**
 * Fetches daily activity / steps from Supabase `daily_activity`.
 */
export async function fetchUserDailyActivity(
  userId: string,
  dateStr?: string,
): Promise<DailyActivity | null> {
  const date = dateStr || getTodayDateString();
  try {
    const { data, error } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (error) {
      console.warn("Error fetching daily activity from Supabase:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      stepCount: Number(data.step_count || 0),
      stepGoal: Number(data.step_goal || 10000),
      distanceMeters: data.distance_meters
        ? Number(data.distance_meters)
        : undefined,
      caloriesBurned: data.calories_burned
        ? Number(data.calories_burned)
        : undefined,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.warn("fetchUserDailyActivity error:", err);
    return null;
  }
}

/**
 * Fetches all daily activities for a user from Supabase.
 */
export async function fetchAllUserDailyActivities(
  userId: string,
): Promise<Record<string, DailyActivity>> {
  try {
    const { data, error } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.warn("Error fetching all daily activities from Supabase:", error);
      return {};
    }

    const map: Record<string, DailyActivity> = {};
    (data || []).forEach((row) => {
      if (row.date) {
        map[row.date] = {
          id: row.id,
          userId: row.user_id,
          date: row.date,
          stepCount: Number(row.step_count || 0),
          stepGoal: Number(row.step_goal || 10000),
          distanceMeters: row.distance_meters
            ? Number(row.distance_meters)
            : undefined,
          caloriesBurned: row.calories_burned
            ? Number(row.calories_burned)
            : undefined,
          updatedAt: row.updated_at,
        };
      }
    });
    return map;
  } catch (err) {
    console.warn("fetchAllUserDailyActivities error:", err);
    return {};
  }
}

/**
 * Upserts daily activity / steps into Supabase `daily_activity`.
 */
export async function upsertUserDailyActivity(
  userId: string,
  activity: DailyActivity,
): Promise<void> {
  try {
    const { error } = await supabase.from("daily_activity").upsert(
      {
        user_id: userId,
        date: activity.date,
        step_count: activity.stepCount,
        step_goal: activity.stepGoal,
        distance_meters: activity.distanceMeters ?? 0,
        calories_burned: activity.caloriesBurned ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" },
    );

    if (error) {
      console.warn("Failed to sync activity to Supabase:", error);
    }
  } catch (err) {
    console.warn("upsertUserDailyActivity error:", err);
  }
}
