// Legacy compatibility proxy. Direct all new usage to '@/storage/nutritionStorage'.
import {
  addMeal as addMealStorage,
  clearAllMeals as clearAllMealsStorage,
  deleteMeal as deleteMealStorage,
  getMeals as getMealsStorage,
} from "./nutritionStorage";
import { MealEntry } from "@/types/nutrition";

export type Meal = MealEntry;

export const getMeals = getMealsStorage;
export const addMeal = addMealStorage;
export const deleteMeal = deleteMealStorage;
export const clearAllMeals = clearAllMealsStorage;
