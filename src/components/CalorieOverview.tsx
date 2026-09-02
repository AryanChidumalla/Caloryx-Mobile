import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type CalorieOverviewProps = {
  onOpenGoals: () => void;
};

export default function CalorieOverview({ onOpenGoals }: CalorieOverviewProps) {
  const { dailyTotals, goals, remainingMacros, percentages } = useNutrition();

  const isExceeded = remainingMacros.isCalorieExceeded;
  const progressRatio = Math.min(1, goals.calories > 0 ? dailyTotals.calories / goals.calories : 0);
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={18} color={colors.calories} />
          </View>
          <Text style={styles.cardTitle}>Daily Calories</Text>
        </View>

        <TouchableOpacity
          style={styles.goalButton}
          onPress={onOpenGoals}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="options-outline" size={16} color={colors.primary} />
          <Text style={styles.goalButtonText}>Goals</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainStatsRow}>
        <View>
          <Text style={[styles.mainValue, isExceeded && styles.exceededValue]}>
            {isExceeded ? `+${remainingMacros.calories}` : remainingMacros.calories}
          </Text>
          <Text style={[styles.mainLabel, isExceeded && styles.exceededLabel]}>
            {isExceeded ? "kcal over goal" : "kcal remaining"}
          </Text>
        </View>

        <View style={styles.secondaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Eaten</Text>
            <Text style={styles.statValue}>{dailyTotals.calories}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Target</Text>
            <Text style={styles.statValue}>{goals.calories}</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: isExceeded ? colors.alert : colors.calories,
            },
          ]}
        />
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          {percentages.calories}% of daily goal
        </Text>
        {isExceeded && (
          <View style={styles.exceededBadge}>
            <Ionicons name="warning-outline" size={12} color={colors.alert} />
            <Text style={styles.exceededBadgeText}>Target Exceeded</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 18,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.caloriesMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  goalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  mainStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  mainValue: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 40,
  },
  mainLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: 2,
  },
  exceededValue: {
    color: colors.alert,
  },
  exceededLabel: {
    color: colors.alert,
  },
  secondaryStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.surfaceBorder,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  exceededBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.alertBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  exceededBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.alert,
  },
});
