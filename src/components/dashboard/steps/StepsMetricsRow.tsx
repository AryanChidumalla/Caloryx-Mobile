import { colors } from "@/styles/global";
import { formatDistanceKm } from "@/utils/healthCalculations";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type StepsMetricsRowProps = {
  distanceMeters: number;
  caloriesBurned: number;
  stepGoal: number;
};

export default function StepsMetricsRow({
  distanceMeters,
  caloriesBurned,
  stepGoal,
}: StepsMetricsRowProps) {
  return (
    <View style={styles.metricsRow}>
      {/* Distance */}
      <View style={styles.metricItem}>
        <View style={styles.metricIconBox}>
          <Ionicons name="navigate-outline" size={14} color="#818CF8" />
        </View>
        <Text style={styles.metricValue}>{formatDistanceKm(distanceMeters)}</Text>
        <Text style={styles.metricLabel}>Distance</Text>
      </View>

      <View style={styles.metricDivider} />

      {/* Calories */}
      <View style={styles.metricItem}>
        <View style={styles.metricIconBox}>
          <Ionicons name="flame-outline" size={14} color={colors.calories} />
        </View>
        <Text style={styles.metricValue}>{caloriesBurned}</Text>
        <Text style={styles.metricLabel}>Active kcal</Text>
      </View>

      <View style={styles.metricDivider} />

      {/* Goal */}
      <View style={styles.metricItem}>
        <View style={styles.metricIconBox}>
          <Ionicons name="flag-outline" size={14} color={colors.success} />
        </View>
        <Text style={styles.metricValue}>{stepGoal.toLocaleString()}</Text>
        <Text style={styles.metricLabel}>Daily Goal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  metricIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.surfaceBorder,
  },
});
