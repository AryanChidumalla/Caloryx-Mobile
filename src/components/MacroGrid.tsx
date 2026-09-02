import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import { MealEntry } from "@/types/nutrition";
import React from "react";
import { StyleSheet, View } from "react-native";
import MacroCard from "./MacroCard";

type MacroGridProps = {
  meals?: MealEntry[];
};

export default function MacroGrid({ meals: propMeals }: MacroGridProps) {
  const { dailyTotals, goals } = useNutrition();

  return (
    <View style={styles.grid}>
      <MacroCard
        label="Calories"
        value={`${dailyTotals.calories}`}
        goal={`${goals.calories}`}
        color={colors.calories}
      />
      <MacroCard
        label="Protein"
        value={`${dailyTotals.protein}g`}
        goal={`${goals.protein}g`}
        color={colors.protein}
      />
      <MacroCard
        label="Carbs"
        value={`${dailyTotals.carbs}g`}
        goal={`${goals.carbs}g`}
        color={colors.carbs}
      />
      <MacroCard
        label="Fat"
        value={`${dailyTotals.fat}g`}
        goal={`${goals.fat}g`}
        color={colors.fat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
});
