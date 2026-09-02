import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import { formatDateForDisplay } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Share, StyleSheet, TouchableOpacity } from "react-native";

export default function ShareButton() {
  const { selectedDate, dailyTotals, goals, todayMeals } = useNutrition();

  const handleShare = async () => {
    const dateLabel = formatDateForDisplay(selectedDate);
    const summary = `Caloryx Nutrition Summary (${dateLabel})\n\n` +
      `Calories: ${dailyTotals.calories} / ${goals.calories} kcal\n` +
      `Protein: ${dailyTotals.protein}g / ${goals.protein}g\n` +
      `Carbs: ${dailyTotals.carbs}g / ${goals.carbs}g\n` +
      `Fat: ${dailyTotals.fat}g / ${goals.fat}g\n\n` +
      `Meals Logged: ${todayMeals.length}`;

    await Share.share({
      message: summary,
    });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleShare}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="share-outline" size={20} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
});
