import { colors } from "@/styles/global";
import { MealEntry } from "@/types/nutrition";
import { formatMacroString } from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MealItemCardProps = {
  meal: MealEntry;
  onPress: (meal: MealEntry) => void;
  onDelete: (id: string) => void;
};

export default function MealItemCard({
  meal,
  onPress,
  onDelete,
}: MealItemCardProps) {
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Meal Entry",
      `Are you sure you want to remove "${meal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete(meal.id);
          },
        },
      ],
    );
  };

  const hasServingDetail =
    (meal.servings && meal.servings !== 1) || meal.servingSize;

  const servingLabel = [
    meal.servings && meal.servings !== 1 ? `${meal.servings}x` : "",
    meal.servingSize || "",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        Haptics.selectionAsync();
        onPress(meal);
      }}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {meal.name}
          </Text>
          <View style={styles.calorieBadge}>
            <Text style={styles.calorieText}>{meal.calories} kcal</Text>
          </View>
        </View>

        {hasServingDetail ? (
          <Text style={styles.servingText} numberOfLines={1}>
            {servingLabel}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <Text style={styles.macroText}>
            {formatMacroString({
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
            })}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={colors.textSecondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  content: {
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  calorieBadge: {
    backgroundColor: colors.caloriesMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  calorieText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.calories,
  },
  servingText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  macroText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
