import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import { formatDateForDisplay } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function CopyButton() {
  const { selectedDate, dailyTotals, goals, todayMeals } = useNutrition();

  const handleCopy = async () => {
    const dateLabel = formatDateForDisplay(selectedDate);
    const summary = `Caloryx Daily Summary (${dateLabel})\n\n` +
      `Calories: ${dailyTotals.calories} / ${goals.calories} kcal\n` +
      `Protein: ${dailyTotals.protein}g / ${goals.protein}g\n` +
      `Carbs: ${dailyTotals.carbs}g / ${goals.carbs}g\n` +
      `Fat: ${dailyTotals.fat}g / ${goals.fat}g\n\n` +
      `Meals Logged: ${todayMeals.length}`;

    await Clipboard.setStringAsync(summary);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied to Clipboard", "Daily macro summary copied successfully.");
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleCopy}>
      <Ionicons name="copy-outline" size={16} color={colors.primary} />
      <Text style={styles.text}>Copy Day Summary</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginTop: 6,
    marginBottom: 16,
  },
  text: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
