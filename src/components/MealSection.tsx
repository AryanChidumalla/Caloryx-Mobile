import { colors } from "@/styles/global";
import { DailyTotals, MealEntry, MealType } from "@/types/nutrition";
import { formatMacroString } from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MealItemCard from "./MealItemCard";

type MealSectionProps = {
  mealType: MealType;
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  meals: MealEntry[];
  totals: DailyTotals;
  onAddMeal: (type: MealType) => void;
  onEditMeal: (meal: MealEntry) => void;
  onDeleteMeal: (id: string) => void;
};

export default function MealSection({
  mealType,
  title,
  iconName,
  meals,
  totals,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
}: MealSectionProps) {
  const hasMeals = meals.length > 0;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddMeal(mealType);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <Ionicons name={iconName} size={16} color={colors.primary} />
          </View>
          <Text style={styles.titleText}>{title}</Text>
        </View>

        <View style={styles.headerRight}>
          {hasMeals && (
            <Text style={styles.headerCalories}>{totals.calories} kcal</Text>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {hasMeals ? (
        <View style={styles.mealsContainer}>
          <View style={styles.macroSummaryRow}>
            <Text style={styles.macroSummaryText}>
              {formatMacroString(totals)}
            </Text>
          </View>

          {meals.map((meal) => (
            <MealItemCard
              key={meal.id}
              meal={meal}
              onPress={onEditMeal}
              onDelete={onDeleteMeal}
            />
          ))}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.emptyContainer}
          onPress={handleAdd}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyText}>
            No {title.toLowerCase()} logged yet
          </Text>
          <View style={styles.emptyAddPrompt}>
            <Ionicons
              name="add-circle-outline"
              size={14}
              color={colors.primary}
            />
            <Text style={styles.emptyPromptText}>Log Food</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerCalories: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.calories,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  mealsContainer: {
    marginTop: 10,
  },
  macroSummaryRow: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  macroSummaryText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  emptyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyAddPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  emptyPromptText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
});
