import { useAuth } from "@/context/AuthContext";
import {
  clearAllUserFoodLogs,
  deleteFoodLog,
  fetchUserFoodLogs,
  insertFoodLog,
  updateFoodLog,
} from "@/services/nutritionSync";
import {
  DEFAULT_GOALS,
  addMeal as addMealStorage,
  clearAllMeals as clearAllMealsStorage,
  deleteMeal as deleteMealStorage,
  deleteSavedFoodItem,
  getGoals as getGoalsStorage,
  getMeals as getMealsStorage,
  getSavedFoods as getSavedFoodsStorage,
  incrementSavedFoodUsage,
  saveFoodItem,
  updateGoals as updateGoalsStorage,
  updateMeal as updateMealStorage,
} from "@/storage/nutritionStorage";
import {
  DailyGoals,
  DailyTotals,
  MacroPercentages,
  MealCategoryBreakdown,
  MealEntry,
  MealType,
  RemainingMacros,
  SavedFood,
} from "@/types/nutrition";
import { addDays, getTodayDateString } from "@/utils/date";
import {
  calculateDailyTotals,
  calculateMacroTargetsFromCalories,
  calculatePercentages,
  calculateRemaining,
  groupMealsByCategory,
  sanitizeNumber,
} from "@/utils/nutritionCalculations";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type NutritionContextType = {
  // Date State & Navigation
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;

  // Data
  meals: MealEntry[];
  todayMeals: MealEntry[];
  goals: DailyGoals;
  savedFoods: SavedFood[];
  isLoading: boolean;

  // Calculations for Selected Date
  dailyTotals: DailyTotals;
  remainingMacros: RemainingMacros;
  percentages: MacroPercentages;
  mealBreakdown: MealCategoryBreakdown;

  // Actions
  addMealEntry: (
    meal: Omit<MealEntry, "id" | "createdAt">,
  ) => Promise<MealEntry>;
  updateMealEntry: (meal: MealEntry) => Promise<MealEntry>;
  deleteMealEntry: (id: string) => Promise<void>;
  clearAllMealsData: () => Promise<void>;
  updateDailyGoals: (newGoals: DailyGoals) => Promise<void>;
  saveCustomFood: (
    food: Omit<SavedFood, "id" | "useCount" | "createdAt">,
  ) => Promise<SavedFood>;
  deleteCustomFood: (id: string) => Promise<void>;
  logFoodFromSaved: (
    savedFood: SavedFood,
    mealType?: MealType,
    servings?: number,
  ) => Promise<MealEntry>;
  refreshAll: () => Promise<void>;

  // UI Flow State (for editing / prefilling)
  editingMeal: MealEntry | null;
  setEditingMeal: (meal: MealEntry | null) => void;
  preselectedMealType: MealType;
  setPreselectedMealType: (type: MealType) => void;
};

const NutritionContext = createContext<NutritionContextType | undefined>(
  undefined,
);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const { session, mode, profile } = useAuth();
  const userId = session?.user?.id ?? null;

  const [selectedDate, setSelectedDate] =
    useState<string>(getTodayDateString());
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [goals, setGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form editing helper state
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);
  const [preselectedMealType, setPreselectedMealType] =
    useState<MealType>("breakfast");

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      if (mode === "authenticated" && userId) {
        // Authenticated user: Load from Supabase
        const [fetchedLogs, fetchedSaved] = await Promise.all([
          fetchUserFoodLogs(userId).catch(() => getMealsStorage()),
          getSavedFoodsStorage(),
        ]);

        setMeals(fetchedLogs);
        setSavedFoods(fetchedSaved);

        // Derive goals from Supabase profile target_calorie if present
        if (profile?.target_calorie && Number(profile.target_calorie) > 0) {
          const derivedGoals = calculateMacroTargetsFromCalories(
            Number(profile.target_calorie),
          );
          setGoals(derivedGoals);
          await updateGoalsStorage(derivedGoals);
        } else {
          const localGoals = await getGoalsStorage();
          setGoals(localGoals);
        }
      } else {
        // Guest user: Load from AsyncStorage
        const [fetchedMeals, fetchedGoals, fetchedSaved] = await Promise.all([
          getMealsStorage(),
          getGoalsStorage(),
          getSavedFoodsStorage(),
        ]);
        setMeals(fetchedMeals);
        setGoals(fetchedGoals);
        setSavedFoods(fetchedSaved);
      }
    } catch (err) {
      console.error("Error refreshing nutrition context:", err);
    } finally {
      setIsLoading(false);
    }
  }, [mode, userId, profile]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Date Navigation
  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDateString());
  }, []);

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((curr) => addDays(curr, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((curr) => addDays(curr, 1));
  }, []);

  // Filter meals for the selected date
  const todayMeals = useMemo(() => {
    return meals.filter((meal) => meal.date === selectedDate);
  }, [meals, selectedDate]);

  // Memoized Daily Totals & Calculations
  const dailyTotals = useMemo(() => {
    return calculateDailyTotals(todayMeals);
  }, [todayMeals]);

  const remainingMacros = useMemo(() => {
    return calculateRemaining(dailyTotals, goals);
  }, [dailyTotals, goals]);

  const percentages = useMemo(() => {
    return calculatePercentages(dailyTotals, goals);
  }, [dailyTotals, goals]);

  const mealBreakdown = useMemo(() => {
    return groupMealsByCategory(todayMeals);
  }, [todayMeals]);

  // Meal Actions
  const addMealEntry = useCallback(
    async (
      mealData: Omit<MealEntry, "id" | "createdAt">,
    ): Promise<MealEntry> => {
      const targetDate = mealData.date || selectedDate;
      let newMeal: MealEntry;

      if (mode === "authenticated" && userId) {
        newMeal = await insertFoodLog(userId, {
          ...mealData,
          date: targetDate,
        });
      } else {
        newMeal = await addMealStorage({
          ...mealData,
          date: targetDate,
        });
      }

      setMeals((prev) => [newMeal, ...prev]);
      return newMeal;
    },
    [mode, userId, selectedDate],
  );

  const updateMealEntry = useCallback(
    async (mealData: MealEntry): Promise<MealEntry> => {
      let updated: MealEntry;

      if (mode === "authenticated" && userId) {
        updated = await updateFoodLog(userId, mealData);
      } else {
        updated = await updateMealStorage(mealData);
      }

      setMeals((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      if (editingMeal?.id === updated.id) {
        setEditingMeal(null);
      }
      return updated;
    },
    [mode, userId, editingMeal],
  );

  const deleteMealEntry = useCallback(
    async (id: string): Promise<void> => {
      if (mode === "authenticated" && userId) {
        await deleteFoodLog(userId, id);
      } else {
        await deleteMealStorage(id);
      }

      setMeals((prev) => prev.filter((m) => m.id !== id));
      if (editingMeal?.id === id) {
        setEditingMeal(null);
      }
    },
    [mode, userId, editingMeal],
  );

  const clearAllMealsData = useCallback(async (): Promise<void> => {
    if (mode === "authenticated" && userId) {
      await clearAllUserFoodLogs(userId);
    } else {
      await clearAllMealsStorage();
    }
    setMeals([]);
    setEditingMeal(null);
  }, [mode, userId]);

  // Goal Actions
  const updateDailyGoals = useCallback(
    async (newGoals: DailyGoals): Promise<void> => {
      const saved = await updateGoalsStorage(newGoals);
      setGoals(saved);

      // if (mode === "authenticated" && userId) {
      //   try {
      //     await upsertUserProfile({
      //       id: userId,
      //       target_calorie: saved.calories,
      //     });
      //   } catch (err) {
      //     console.warn("Failed to sync target_calorie to Supabase profile:", err);
      //   }
      // }
    },
    [mode, userId],
  );

  // Saved Foods Actions
  const saveCustomFood = useCallback(
    async (
      foodData: Omit<SavedFood, "id" | "useCount" | "createdAt">,
    ): Promise<SavedFood> => {
      const newFood = await saveFoodItem(foodData);
      setSavedFoods((prev) => [newFood, ...prev]);
      return newFood;
    },
    [],
  );

  const deleteCustomFood = useCallback(async (id: string): Promise<void> => {
    await deleteSavedFoodItem(id);
    setSavedFoods((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const logFoodFromSaved = useCallback(
    async (
      savedFood: SavedFood,
      mealType: MealType = preselectedMealType,
      servings = 1,
    ): Promise<MealEntry> => {
      const safeServings = sanitizeNumber(servings, 1);
      const mealPayload = {
        name: savedFood.name,
        calories: Math.round(savedFood.calories * safeServings),
        protein: Math.round(savedFood.protein * safeServings * 10) / 10,
        carbs: Math.round(savedFood.carbs * safeServings * 10) / 10,
        fat: Math.round(savedFood.fat * safeServings * 10) / 10,
        servingSize: savedFood.servingSize,
        servings: safeServings,
        mealType,
        date: selectedDate,
      };

      let newMeal: MealEntry;
      if (mode === "authenticated" && userId) {
        newMeal = await insertFoodLog(userId, mealPayload);
      } else {
        newMeal = await addMealStorage(mealPayload);
      }

      setMeals((prev) => [newMeal, ...prev]);
      await incrementSavedFoodUsage(savedFood.id);
      setSavedFoods((prev) =>
        prev.map((f) =>
          f.id === savedFood.id
            ? {
                ...f,
                useCount: (f.useCount || 0) + 1,
                lastUsedAt: new Date().toISOString(),
              }
            : f,
        ),
      );
      return newMeal;
    },
    [mode, userId, preselectedMealType, selectedDate],
  );

  const contextValue = useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
      goToToday,
      goToPreviousDay,
      goToNextDay,
      meals,
      todayMeals,
      goals,
      savedFoods,
      isLoading,
      dailyTotals,
      remainingMacros,
      percentages,
      mealBreakdown,
      addMealEntry,
      updateMealEntry,
      deleteMealEntry,
      clearAllMealsData,
      updateDailyGoals,
      saveCustomFood,
      deleteCustomFood,
      logFoodFromSaved,
      refreshAll,
      editingMeal,
      setEditingMeal,
      preselectedMealType,
      setPreselectedMealType,
    }),
    [
      selectedDate,
      goToToday,
      goToPreviousDay,
      goToNextDay,
      meals,
      todayMeals,
      goals,
      savedFoods,
      isLoading,
      dailyTotals,
      remainingMacros,
      percentages,
      mealBreakdown,
      addMealEntry,
      updateMealEntry,
      deleteMealEntry,
      clearAllMealsData,
      updateDailyGoals,
      saveCustomFood,
      deleteCustomFood,
      logFoodFromSaved,
      refreshAll,
      editingMeal,
      preselectedMealType,
    ],
  );

  return (
    <NutritionContext.Provider value={contextValue}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition(): NutritionContextType {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error("useNutrition must be used within a NutritionProvider");
  }
  return context;
}
