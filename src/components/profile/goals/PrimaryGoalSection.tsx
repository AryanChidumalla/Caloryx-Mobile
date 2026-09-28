import { colors } from "@/styles/global";
import { PrimaryGoal } from "@/types/nutrition";
import { GOAL_OPTIONS } from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PrimaryGoalSectionProps = {
  goal: PrimaryGoal;
  onGoalChange: (goal: PrimaryGoal) => void;
  calorieAdjustment: number;
  onCalorieAdjustmentChange: (delta: number) => void;
  onSetCalorieAdjustment: (val: number) => void;
};

export default function PrimaryGoalSection({
  goal,
  onGoalChange,
  calorieAdjustment,
  onCalorieAdjustmentChange,
  onSetCalorieAdjustment,
}: PrimaryGoalSectionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Primary Goal</Text>
          <Text style={styles.cardSubtitle}>
            Your main direction determines your calorie target
          </Text>
        </View>

        <View style={styles.sectionIcon}>
          <Ionicons name="flag-outline" size={17} color={colors.primary} />
        </View>
      </View>

      <View style={styles.goalRow}>
        {GOAL_OPTIONS.map((item) => {
          const isSelected = goal === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[styles.goalCard, isSelected && styles.goalCardActive]}
              onPress={() => {
                Haptics.selectionAsync();
                onGoalChange(item.value);
              }}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.goalIndicator,
                  isSelected && styles.goalIndicatorActive,
                ]}
              >
                <Ionicons
                  name={
                    item.value === "lose_fat"
                      ? "trending-down-outline"
                      : item.value === "build_muscle"
                        ? "barbell-outline"
                        : "remove-outline"
                  }
                  size={17}
                  color={isSelected ? colors.background : colors.textSecondary}
                />
              </View>

              <Text
                style={[styles.goalTitle, isSelected && styles.goalTitleActive]}
              >
                {item.label}
              </Text>

              <Text style={styles.goalDesc}>{item.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {(goal === "lose_fat" || goal === "build_muscle") && (
        <View style={styles.adjustmentContainer}>
          <View style={styles.adjustmentHeader}>
            <View>
              <Text style={styles.adjustmentLabel}>
                {goal === "lose_fat"
                  ? "Daily Calorie Deficit"
                  : "Daily Calorie Surplus"}
              </Text>
              <Text style={styles.adjustmentHint}>
                Applied to your estimated TDEE
              </Text>
            </View>

            <Text style={styles.adjustmentValue}>
              {goal === "lose_fat"
                ? `-${calorieAdjustment}`
                : `+${calorieAdjustment}`}{" "}
              kcal
            </Text>
          </View>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[
                styles.stepBtn,
                calorieAdjustment <= 150 && styles.stepBtnDisabled,
              ]}
              onPress={() => onCalorieAdjustmentChange(-50)}
              disabled={calorieAdjustment <= 150}
              activeOpacity={0.75}
            >
              <Text style={styles.stepBtnText}>− 50</Text>
            </TouchableOpacity>

            <View style={styles.presetChips}>
              {[300, 400, 500].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.presetChip,
                    calorieAdjustment === value && styles.presetChipActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSetCalorieAdjustment(value);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      calorieAdjustment === value && styles.presetChipTextActive,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.stepBtn,
                calorieAdjustment >= 800 && styles.stepBtnDisabled,
              ]}
              onPress={() => onCalorieAdjustmentChange(50)}
              disabled={calorieAdjustment >= 800}
              activeOpacity={0.75}
            >
              <Text style={styles.stepBtnText}>+ 50</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  goalRow: {
    flexDirection: "row",
    gap: 8,
  },
  goalCard: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  goalCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  goalIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  goalIndicatorActive: {
    backgroundColor: colors.primary,
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 2,
  },
  goalTitleActive: {
    color: colors.primary,
    fontWeight: "800",
  },
  goalDesc: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
  },
  adjustmentContainer: {
    marginTop: 16,
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  adjustmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  adjustmentLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  adjustmentHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  adjustmentValue: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.primary,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  stepBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  stepBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
  },
  presetChips: {
    flexDirection: "row",
    gap: 6,
  },
  presetChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  presetChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: colors.primary,
    fontWeight: "800",
  },
});
