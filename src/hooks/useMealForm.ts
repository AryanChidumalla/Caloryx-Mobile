import { useNutrition } from "@/context/NutritionContext";
import { SupabaseFood } from "@/services/foodService";
import { MealEntry, MealType, SavedFood } from "@/types/nutrition";
import {
  estimateCaloriesFromMacros,
  sanitizeNumber,
  scaleFoodNutrients,
} from "@/utils/nutritionCalculations";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export function useMealForm() {
  const {
    selectedDate,
    preselectedMealType,
    editingMeal,
    setEditingMeal,
    addMealEntry,
    updateMealEntry,
    deleteMealEntry,
    saveCustomFood,
  } = useNutrition();

  const [mealType, setMealType] = useState<MealType>(
    preselectedMealType || "breakfast",
  );
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servings, setServings] = useState("1");
  const [foodId, setFoodId] = useState<number | null>(null);
  const [saveToFavorites, setSaveToFavorites] = useState(false);
  const [selectedFood, setSelectedFood] = useState<SupabaseFood | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setSelectedFood(null);
    setFoodId(null);
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setServingSize("");
    setServings("1");
    setSaveToFavorites(false);
    setEditingMeal(null);
  }, [setEditingMeal]);

  const populateForm = useCallback(() => {
    if (!editingMeal) {
      setMealType(preselectedMealType || "breakfast");
      return;
    }

    setName(editingMeal.name);
    setCalories(String(editingMeal.calories));
    setProtein(editingMeal.protein > 0 ? String(editingMeal.protein) : "");
    setCarbs(editingMeal.carbs > 0 ? String(editingMeal.carbs) : "");
    setFat(editingMeal.fat > 0 ? String(editingMeal.fat) : "");
    setServingSize(editingMeal.servingSize || "");
    setServings(String(editingMeal.servings || 1));
    setMealType(editingMeal.mealType);
    setFoodId(editingMeal.foodId ?? null);
    setSelectedFood(null);
  }, [editingMeal, preselectedMealType]);

  const handleSelectSupabaseFood = useCallback((food: SupabaseFood) => {
    Haptics.selectionAsync();

    setSelectedFood(food);
    setFoodId(food.id);
    setName(food.name);

    setCalories(String(Math.round(food.calories_per_serving ?? 0)));
    setProtein(String(Math.round((food.protein_per_serving ?? 0) * 10) / 10));
    setCarbs(String(Math.round((food.carbs_per_serving ?? 0) * 10) / 10));
    setFat(String(Math.round((food.fat_per_serving ?? 0) * 10) / 10));

    setServingSize(
      food.default_serving_unit ||
        (food.default_serving_weight_g
          ? `${food.default_serving_weight_g}g`
          : "1 serving"),
    );
    setServings("1");
  }, []);

  const handleSelectSavedFood = useCallback((food: SavedFood) => {
    Haptics.selectionAsync();

    setSelectedFood(null);
    setFoodId(null);
    setName(food.name);
    setCalories(String(food.calories));
    setProtein(food.protein > 0 ? String(food.protein) : "");
    setCarbs(food.carbs > 0 ? String(food.carbs) : "");
    setFat(food.fat > 0 ? String(food.fat) : "");
    setServingSize(food.servingSize || "");
    setServings("1");
  }, []);

  const handleCreateCustomFood = useCallback((foodName: string) => {
    setName(foodName);
    setSelectedFood(null);
    setFoodId(null);
  }, []);

  const handleServingsChange = useCallback(
    (value: string) => {
      setServings(value);

      if (!selectedFood) {
        return;
      }

      const amount = Number(value);
      if (!Number.isFinite(amount) || amount <= 0) {
        return;
      }

      const baseNutrients = {
        calories: selectedFood.calories_per_serving ?? 0,
        protein: selectedFood.protein_per_serving ?? 0,
        carbs: selectedFood.carbs_per_serving ?? 0,
        fat: selectedFood.fat_per_serving ?? 0,
      };

      const scaled = scaleFoodNutrients(baseNutrients, amount);
      setCalories(String(scaled.calories));
      setProtein(String(scaled.protein));
      setCarbs(String(scaled.carbs));
      setFat(String(scaled.fat));
    },
    [selectedFood],
  );

  const handleEstimateCalories = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const estimated = estimateCaloriesFromMacros(
      sanitizeNumber(protein, 0),
      sanitizeNumber(carbs, 0),
      sanitizeNumber(fat, 0),
    );

    if (estimated > 0) {
      setCalories(String(estimated));
      return;
    }

    Alert.alert(
      "Notice",
      "Enter protein, carbs, or fat values first to calculate calories.",
    );
  }, [protein, carbs, fat]);

  const handleSubmit = useCallback(
    async (onSuccess?: () => void) => {
      if (isSubmitting) return;

      const trimmedName = name.trim();
      if (!trimmedName) {
        Alert.alert("Missing Name", "Please enter a food or meal name.");
        return;
      }

      if (!calories.trim() || isNaN(Number(calories))) {
        Alert.alert("Missing Calories", "Please enter a valid calorie amount.");
        return;
      }

      const safeCalories = sanitizeNumber(calories, 0, true);
      const safeProtein = sanitizeNumber(protein, 0);
      const safeCarbs = sanitizeNumber(carbs, 0);
      const safeFat = sanitizeNumber(fat, 0);
      const safeServings = sanitizeNumber(servings, 1);

      setIsSubmitting(true);
      try {
        if (editingMeal) {
          await updateMealEntry({
            ...editingMeal,
            name: trimmedName,
            calories: safeCalories,
            protein: safeProtein,
            carbs: safeCarbs,
            fat: safeFat,
            servingSize: servingSize.trim() || undefined,
            servings: safeServings,
            mealType,
            foodId,
          });

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          resetForm();
          onSuccess?.();
          return;
        }

        await addMealEntry({
          name: trimmedName,
          calories: safeCalories,
          protein: safeProtein,
          carbs: safeCarbs,
          fat: safeFat,
          servingSize: servingSize.trim() || undefined,
          servings: safeServings,
          mealType,
          foodId,
          date: selectedDate,
        });

        if (saveToFavorites) {
          await saveCustomFood({
            name: trimmedName,
            calories: safeCalories,
            protein: safeProtein,
            carbs: safeCarbs,
            fat: safeFat,
            servingSize: servingSize.trim() || undefined,
            isFavorite: true,
          });
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        resetForm();
        onSuccess?.();
      } catch (error) {
        console.error("Failed to save meal:", error);
        Alert.alert(
          "Unable to Save",
          "Something went wrong while saving this meal.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      name,
      calories,
      protein,
      carbs,
      fat,
      servings,
      editingMeal,
      updateMealEntry,
      servingSize,
      mealType,
      foodId,
      resetForm,
      addMealEntry,
      selectedDate,
      saveToFavorites,
      saveCustomFood,
    ],
  );

  const handleDelete = useCallback(
    (onSuccess?: () => void) => {
      if (!editingMeal) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Alert.alert(
        "Delete Meal Entry",
        `Are you sure you want to delete "${editingMeal.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteMealEntry(editingMeal.id);
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
                resetForm();
                onSuccess?.();
              } catch (error) {
                console.error("Failed to delete meal:", error);
                Alert.alert(
                  "Unable to Delete",
                  "Something went wrong while deleting this meal.",
                );
              }
            },
          },
        ],
      );
    },
    [editingMeal, deleteMealEntry, resetForm],
  );

  return {
    editingMeal: !!editingMeal,
    editingMealEntry: editingMeal as MealEntry | null,
    mealType,
    setMealType,
    name,
    setName,
    servings,
    onServingsChange: handleServingsChange,
    servingSize,
    setServingSize,
    calories,
    setCalories,
    protein,
    setProtein,
    carbs,
    setCarbs,
    fat,
    setFat,
    saveToFavorites,
    setSaveToFavorites,
    isSubmitting,
    onEstimateCalories: handleEstimateCalories,
    onSelectSupabaseFood: handleSelectSupabaseFood,
    onSelectSavedFood: handleSelectSavedFood,
    onCreateCustomFood: handleCreateCustomFood,
    populateForm,
    resetForm,
    onSubmit: handleSubmit,
    onDelete: handleDelete,
  };
}
