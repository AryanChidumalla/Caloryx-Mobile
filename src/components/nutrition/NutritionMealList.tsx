import MealSection from "@/components/nutrition/MealSection";
import { MealCategoryBreakdown, MealEntry, MealType } from "@/types/nutrition";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

export type NutritionMealListProps = {
  mealBreakdown: MealCategoryBreakdown;
  onAddMeal: (type: MealType) => void;
  onEditMeal: (meal: MealEntry) => void;
  onDeleteMeal: (id: string) => void;
};

const SECTIONS_CONFIG: {
  type: MealType;
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    type: "breakfast",
    title: "Breakfast",
    iconName: "sunny-outline",
  },
  {
    type: "lunch",
    title: "Lunch",
    iconName: "restaurant-outline",
  },
  {
    type: "dinner",
    title: "Dinner",
    iconName: "moon-outline",
  },
  {
    type: "snack",
    title: "Snacks",
    iconName: "nutrition-outline",
  },
];

export default function NutritionMealList({
  mealBreakdown,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
}: NutritionMealListProps) {
  return (
    <View style={styles.container}>
      {SECTIONS_CONFIG.map((config) => {
        const categoryData = mealBreakdown[config.type];

        return (
          <MealSection
            key={config.type}
            mealType={config.type}
            title={config.title}
            iconName={config.iconName}
            meals={categoryData.meals}
            totals={categoryData.totals}
            onAddMeal={onAddMeal}
            onEditMeal={onEditMeal}
            onDeleteMeal={onDeleteMeal}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
});
