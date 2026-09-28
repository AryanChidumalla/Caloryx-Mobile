import { colors } from "@/styles/global";
import { DailyGoals, DailyTotals } from "@/types/nutrition";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CalorieProgressRing from "./CalorieProgressRing";
import MacroProgressItem from "./MacroProgressItem";

export type SummarySectionProps = {
  isCurrentDateToday?: boolean;
  dailyTotals: DailyTotals;
  goals: DailyGoals;
};

export default function SummarySection({
  dailyTotals,
  goals,
}: SummarySectionProps) {
  const calories = Math.max(dailyTotals?.calories ?? 0, 0);
  const calorieGoal = Math.max(goals?.calories ?? 0, 1);
  const caloriePercentage = Math.round((calories / calorieGoal) * 100);
  const isCalorieOver = calories > calorieGoal;
  const ringColor = isCalorieOver ? colors.alert : colors.accent;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Daily nutrition</Text>
            <Text style={styles.subtitle}>{"Today's progress"}</Text>
          </View>

          <View
            style={[
              styles.percentageBadge,
              {
                backgroundColor: isCalorieOver
                  ? colors.overWarningMuted
                  : colors.accentMuted,
              },
            ]}
          >
            <Text
              style={[
                styles.percentageBadgeText,
                {
                  color: ringColor,
                },
              ]}
            >
              {caloriePercentage}%
            </Text>
          </View>
        </View>

        {/* Calorie Ring */}
        <CalorieProgressRing calories={calories} calorieGoal={calorieGoal} />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Macronutrients */}
        <View style={styles.macroSection}>
          <MacroProgressItem
            label="Protein"
            consumed={dailyTotals?.protein ?? 0}
            goal={goals?.protein ?? 0}
            color={colors.protein}
          />

          <View style={styles.macroDivider} />

          <MacroProgressItem
            label="Carbs"
            consumed={dailyTotals?.carbs ?? 0}
            goal={goals?.carbs ?? 0}
            color={colors.carbs}
          />

          <View style={styles.macroDivider} />

          <MacroProgressItem
            label="Fat"
            consumed={dailyTotals?.fat ?? 0}
            goal={goals?.fat ?? 0}
            color={colors.fat}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 20,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
  },
  percentageBadge: {
    minWidth: 46,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  percentageBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 18,
  },
  macroSection: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  macroDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 4,
  },
});
