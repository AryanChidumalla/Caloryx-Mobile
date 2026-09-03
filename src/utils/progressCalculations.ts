import {
  DailyMetricPoint,
  DailyNutritionPoint,
  ProgressTrend,
  RangeNutritionSummary,
  TimeFilter,
  WeightEntry,
} from "@/types/health";
import { MealEntry } from "@/types/nutrition";
import { getTodayDateString } from "@/utils/date";

/**
 * Returns number of days for a given TimeFilter.
 */
export function getDaysCountForFilter(filter: TimeFilter): number {
  switch (filter) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
  }
}

/**
 * Generates an array of date strings (YYYY-MM-DD) from (today - (days - 1)) up to today.
 */
export function getDateRangeList(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  return dates;
}

/**
 * Formats a YYYY-MM-DD date into a compact label based on time filter.
 */
export function formatDateLabel(dateStr: string, filter: TimeFilter): string {
  try {
    const parts = dateStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);

    if (filter === "7d") {
      return d.toLocaleDateString("en-US", { weekday: "narrow" }); // "M", "T", "W"
    } else if (filter === "30d") {
      return `${d.getMonth() + 1}/${d.getDate()}`; // "9/1"
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // "Sep 1"
    }
  } catch {
    return dateStr.slice(5);
  }
}

/**
 * Aggregates daily meal entries for a list of dates.
 */
export function aggregateDailyNutrition(
  meals: MealEntry[],
  dateList: string[],
  targetCalories: number,
  filter: TimeFilter,
): {
  points: DailyNutritionPoint[];
  summary: RangeNutritionSummary;
  trend: ProgressTrend;
} {
  // Map meals by date
  const mealsByDate: Record<string, MealEntry[]> = {};
  for (const m of meals) {
    if (!mealsByDate[m.date]) {
      mealsByDate[m.date] = [];
    }
    mealsByDate[m.date].push(m);
  }

  let totalLoggedCalories = 0;
  let totalLoggedProtein = 0;
  let totalLoggedCarbs = 0;
  let totalLoggedFat = 0;
  let daysLogged = 0;
  let daysMetGoal = 0;

  const points: DailyNutritionPoint[] = dateList.map((date) => {
    const dayMeals = mealsByDate[date] || [];
    const hasData = dayMeals.length > 0;

    let cal = 0;
    let p = 0;
    let c = 0;
    let f = 0;

    for (const m of dayMeals) {
      cal += Number(m.calories) || 0;
      p += Number(m.protein) || 0;
      c += Number(m.carbs) || 0;
      f += Number(m.fat) || 0;
    }

    if (hasData) {
      daysLogged++;
      totalLoggedCalories += cal;
      totalLoggedProtein += p;
      totalLoggedCarbs += c;
      totalLoggedFat += f;

      // Within 15% of target is considered meeting daily caloric goal
      const lower = targetCalories * 0.85;
      const upper = targetCalories * 1.15;
      if (cal >= lower && cal <= upper) {
        daysMetGoal++;
      }
    }

    const lower = targetCalories * 0.85;
    const upper = targetCalories * 1.15;
    const meetsGoal = hasData && cal >= lower && cal <= upper;

    return {
      date,
      label: formatDateLabel(date, filter),
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      targetCalories,
      hasData,
      meetsGoal,
    };
  });

  const avgCalories =
    daysLogged > 0 ? Math.round(totalLoggedCalories / daysLogged) : 0;
  const avgProtein =
    daysLogged > 0 ? Math.round(totalLoggedProtein / daysLogged) : 0;
  const avgCarbs =
    daysLogged > 0 ? Math.round(totalLoggedCarbs / daysLogged) : 0;
  const avgFat =
    daysLogged > 0 ? Math.round(totalLoggedFat / daysLogged) : 0;
  const consistencyPercent =
    daysLogged > 0 ? Math.round((daysMetGoal / daysLogged) * 100) : 0;

  // Trend detection
  let trend: ProgressTrend = "stable";
  if (daysLogged >= 3) {
    if (consistencyPercent >= 70) {
      trend = "improving";
    } else if (consistencyPercent < 40) {
      trend = "needs_attention";
    }
  }

  return {
    points,
    summary: {
      averageCalories: avgCalories,
      averageProtein: avgProtein,
      averageCarbs: avgCarbs,
      averageFat: avgFat,
      consistencyPercent,
      daysLogged,
      totalDays: dateList.length,
    },
    trend,
  };
}

/**
 * Aggregates generic daily metric data (steps, water) across dates.
 */
export function aggregateDailyMetrics(
  historyMap: Record<string, number>,
  dateList: string[],
  target: number,
  filter: TimeFilter,
): {
  points: DailyMetricPoint[];
  average: number;
  daysLogged: number;
  daysMetGoal: number;
  consistencyPercent: number;
  trend: ProgressTrend;
} {
  let totalValue = 0;
  let daysLogged = 0;
  let daysMetGoal = 0;

  const points: DailyMetricPoint[] = dateList.map((date) => {
    const val = historyMap[date] ?? 0;
    const hasData = val > 0;

    if (hasData) {
      daysLogged++;
      totalValue += val;
      if (val >= target * 0.9) {
        daysMetGoal++;
      }
    }

    return {
      date,
      label: formatDateLabel(date, filter),
      value: val,
      target,
      hasData,
      meetsGoal: hasData && val >= target * 0.9,
    };
  });

  const average = daysLogged > 0 ? Math.round(totalValue / daysLogged) : 0;
  const consistencyPercent =
    daysLogged > 0 ? Math.round((daysMetGoal / daysLogged) * 100) : 0;

  let trend: ProgressTrend = "stable";
  if (daysLogged >= 2) {
    if (consistencyPercent >= 70 || average >= target) {
      trend = "improving";
    } else if (consistencyPercent < 35) {
      trend = "needs_attention";
    }
  }

  return {
    points,
    average,
    daysLogged,
    daysMetGoal,
    consistencyPercent,
    trend,
  };
}

/**
 * Calculates weight progression across the date list.
 */
export function aggregateWeightHistory(
  weightHistory: Record<string, number>,
  currentWeight: number,
  dateList: string[],
): {
  entries: WeightEntry[];
  deltaKg: number;
  trend: ProgressTrend;
  minWeight: number;
  maxWeight: number;
} {
  const today = getTodayDateString();
  const mergedWeights = { ...weightHistory };

  // Always ensure current weight is registered for today if not already present
  if (currentWeight > 0 && !mergedWeights[today]) {
    mergedWeights[today] = currentWeight;
  }

  const entries: WeightEntry[] = [];
  for (const d of dateList) {
    if (mergedWeights[d] && mergedWeights[d] > 0) {
      entries.push({ date: d, weightKg: mergedWeights[d] });
    }
  }

  if (entries.length === 0 && currentWeight > 0) {
    entries.push({ date: today, weightKg: currentWeight });
  }

  const weights = entries.map((e) => e.weightKg);
  const minWeight = weights.length > 0 ? Math.min(...weights) : currentWeight;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : currentWeight;

  let deltaKg = 0;
  let trend: ProgressTrend = "stable";

  if (entries.length >= 2) {
    const first = entries[0].weightKg;
    const last = entries[entries.length - 1].weightKg;
    deltaKg = Math.round((last - first) * 10) / 10;

    if (Math.abs(deltaKg) < 0.2) {
      trend = "stable";
    } else {
      trend = deltaKg < 0 ? "improving" : "needs_attention";
    }
  }

  return {
    entries,
    deltaKg,
    trend,
    minWeight,
    maxWeight,
  };
}
