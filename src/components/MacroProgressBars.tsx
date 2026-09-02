import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MacroItemProps = {
  label: string;
  consumed: number;
  goal: number;
  remaining: number;
  isExceeded: boolean;
  percentage: number;
  color: string;
  mutedColor: string;
};

function MacroItem({
  label,
  consumed,
  goal,
  remaining,
  isExceeded,
  percentage,
  color,
  mutedColor,
}: MacroItemProps) {
  const progressPercent = Math.min(100, Math.max(0, percentage));

  return (
    <View style={styles.macroCard}>
      <View style={styles.macroHeader}>
        <View style={styles.labelContainer}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
          <Text style={styles.macroName}>{label}</Text>
        </View>
        <Text style={[styles.percentText, { color }]}>{percentage}%</Text>
      </View>

      {/* Bar */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: isExceeded ? colors.alert : color,
            },
          ]}
        />
      </View>

      <View style={styles.macroFooter}>
        <Text style={styles.consumedText}>
          <Text style={styles.boldText}>{consumed}g</Text> / {goal}g
        </Text>
        <Text
          style={[
            styles.remainingText,
            isExceeded && { color: colors.alert },
          ]}
        >
          {isExceeded ? `+${remaining}g over` : `${remaining}g left`}
        </Text>
      </View>
    </View>
  );
}

export default function MacroProgressBars() {
  const { dailyTotals, goals, remainingMacros, percentages } = useNutrition();

  return (
    <View style={styles.container}>
      <MacroItem
        label="Protein"
        consumed={dailyTotals.protein}
        goal={goals.protein}
        remaining={remainingMacros.protein}
        isExceeded={remainingMacros.isProteinExceeded}
        percentage={percentages.protein}
        color={colors.protein}
        mutedColor={colors.proteinMuted}
      />
      <MacroItem
        label="Carbs"
        consumed={dailyTotals.carbs}
        goal={goals.carbs}
        remaining={remainingMacros.carbs}
        isExceeded={remainingMacros.isCarbsExceeded}
        percentage={percentages.carbs}
        color={colors.carbs}
        mutedColor={colors.carbsMuted}
      />
      <MacroItem
        label="Fat"
        consumed={dailyTotals.fat}
        goal={goals.fat}
        remaining={remainingMacros.fat}
        isExceeded={remainingMacros.isFatExceeded}
        percentage={percentages.fat}
        color={colors.fat}
        mutedColor={colors.fatMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  macroCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  percentText: {
    fontSize: 12,
    fontWeight: "700",
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  macroFooter: {
    gap: 2,
  },
  consumedText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  boldText: {
    fontWeight: "700",
    color: colors.text,
  },
  remainingText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
