import { colors } from "@/styles/global";
import { PrimaryGoal } from "@/types/nutrition";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type GoalProgressCardProps = {
  goal: PrimaryGoal;
  calorieTarget: number;
  averageCalories: number;
  consistencyPercent: number;
  daysLogged: number;
  totalDays: number;
  deficitOrSurplus: number;
};

export default function GoalProgressCard({
  goal,
  calorieTarget,
  averageCalories,
  consistencyPercent,
  daysLogged,
  totalDays,
  deficitOrSurplus,
}: GoalProgressCardProps) {
  const getGoalInfo = () => {
    switch (goal) {
      case "lose_fat":
        return {
          title: "Fat Loss Goal",
          desc: `Targeting a ${deficitOrSurplus} kcal deficit below maintenance to foster gradual fat loss.`,
          icon: "flame" as const,
          color: colors.protein,
        };
      case "build_muscle":
        return {
          title: "Muscle Building Goal",
          desc: `Targeting a ${deficitOrSurplus} kcal surplus above maintenance to support hypertrophy and strength.`,
          icon: "barbell" as const,
          color: "#A78BFA",
        };
      default:
        return {
          title: "Weight Maintenance Goal",
          desc: "Targeting exact daily energy balance to sustain current body mass.",
          icon: "shield-checkmark" as const,
          color: colors.primary,
        };
    }
  };

  const goalInfo = getGoalInfo();

  const getStatusText = () => {
    if (daysLogged === 0) return "No days logged yet in this period";
    if (consistencyPercent >= 70) return "Excellent adherence to target";
    if (consistencyPercent >= 40) return "Moderate adherence — keep it up";
    return "Adherence has room for improvement";
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${goalInfo.color}1A` },
            ]}
          >
            <Ionicons name={goalInfo.icon} size={18} color={goalInfo.color} />
          </View>
          <View>
            <Text style={styles.title}>{goalInfo.title}</Text>
            <Text style={styles.statusSub}>{getStatusText()}</Text>
          </View>
        </View>

        <View style={styles.consistencyPill}>
          <Text style={styles.consistencyVal}>{consistencyPercent}%</Text>
          <Text style={styles.consistencyLabel}>Consistency</Text>
        </View>
      </View>

      <Text style={styles.goalDescription}>{goalInfo.desc}</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, consistencyPercent)}%`,
                backgroundColor:
                  consistencyPercent >= 60 ? colors.protein : colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Metric Breakdown Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>DAYS LOGGED</Text>
          <Text style={styles.metricVal}>
            {daysLogged}{" "}
            <Text style={styles.metricSub}>/ {totalDays} days</Text>
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>AVG INTAKE</Text>
          <Text style={styles.metricVal}>
            {averageCalories > 0 ? `${averageCalories}` : "—"}{" "}
            <Text style={styles.metricSub}>kcal</Text>
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>TARGET</Text>
          <Text style={styles.metricVal}>
            {calorieTarget} <Text style={styles.metricSub}>kcal</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  statusSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  consistencyPill: {
    alignItems: "flex-end",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  consistencyVal: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
  },
  consistencyLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  goalDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  progressContainer: {
    gap: 6,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metricCol: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.surfaceBorder,
  },
});
