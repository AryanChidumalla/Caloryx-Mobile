import { colors } from "@/styles/global";
import { DailyNutritionPoint, ProgressTrend } from "@/types/health";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type CalorieConsistencyChartProps = {
  points: DailyNutritionPoint[];
  targetCalories: number;
  averageCalories: number;
  trend: ProgressTrend;
};

export default function CalorieConsistencyChart({
  points,
  targetCalories,
  averageCalories,
  trend,
}: CalorieConsistencyChartProps) {
  const maxCaloriesInPoints = Math.max(...points.map((p) => p.calories), 0);
  const chartMax = Math.max(targetCalories * 1.25, maxCaloriesInPoints * 1.1, 1500);

  const hasAnyData = points.some((p) => p.hasData);

  const getTrendBadge = () => {
    switch (trend) {
      case "improving":
        return {
          label: "Consistent",
          color: colors.protein,
          icon: "trending-up" as const,
        };
      case "needs_attention":
        return {
          label: "Inconsistent",
          color: colors.warning,
          icon: "trending-down" as const,
        };
      default:
        return {
          label: "Stable",
          color: colors.textSecondary,
          icon: "remove" as const,
        };
    }
  };

  const trendBadge = getTrendBadge();

  // If longer range like 30d or 90d, we sample or display thin bars
  const isCompact = points.length > 14;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Calorie Consistency</Text>
          <Text style={styles.subtitle}>
            {hasAnyData
              ? `Daily intake vs. ${targetCalories} kcal target`
              : "No meals logged in this period"}
          </Text>
        </View>

        {hasAnyData && (
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: `${trendBadge.color}18` },
            ]}
          >
            <Ionicons name={trendBadge.icon} size={13} color={trendBadge.color} />
            <Text style={[styles.trendText, { color: trendBadge.color }]}>
              {trendBadge.label}
            </Text>
          </View>
        )}
      </View>

      {!hasAnyData ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={28} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No nutrition data recorded</Text>
          <Text style={styles.emptySub}>
            Log your breakfast, lunch, or dinner in the Nutrition tab to see your
            daily caloric consistency.
          </Text>
        </View>
      ) : (
        <>
          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PERIOD AVERAGE</Text>
              <Text style={styles.statVal}>{averageCalories} kcal</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TARGET</Text>
              <Text style={styles.statVal}>{targetCalories} kcal</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>VARIANCE</Text>
              <Text
                style={[
                  styles.statVal,
                  averageCalories > targetCalories
                    ? { color: colors.warning }
                    : { color: colors.protein },
                ]}
              >
                {averageCalories > 0
                  ? `${averageCalories - targetCalories > 0 ? "+" : ""}${averageCalories - targetCalories} kcal`
                  : "—"}
              </Text>
            </View>
          </View>

          {/* Chart View */}
          <View style={styles.chartContainer}>
            {/* Target Reference Line */}
            <View
              style={[
                styles.targetLine,
                {
                  bottom: `${(targetCalories / chartMax) * 100}%`,
                },
              ]}
            >
              <View style={styles.targetDashed} />
              <Text style={styles.targetText}>{targetCalories}</Text>
            </View>

            {/* Bars */}
            <View style={styles.barsRow}>
              {points.map((p, idx) => {
                const heightPercent =
                  p.calories > 0
                    ? Math.min(100, (p.calories / chartMax) * 100)
                    : 2;

                const barColor = !p.hasData
                  ? colors.surfaceLight
                  : p.meetsGoal
                    ? colors.protein
                    : p.calories > targetCalories
                      ? colors.warning
                      : colors.primary;

                return (
                  <View
                    key={`${p.date}-${idx}`}
                    style={[styles.barCol, { flex: 1 }]}
                  >
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                    {!isCompact ? (
                      <Text
                        style={[
                          styles.dayLabel,
                          p.hasData && styles.dayLabelActive,
                        ]}
                        numberOfLines={1}
                      >
                        {p.label}
                      </Text>
                    ) : idx % 5 === 0 ? (
                      <Text style={styles.dayLabelCompact} numberOfLines={1}>
                        {p.label}
                      </Text>
                    ) : (
                      <View style={{ height: 14 }} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: colors.protein },
                ]}
              />
              <Text style={styles.legendText}>On Target (±15%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: colors.warning },
                ]}
              />
              <Text style={styles.legendText}>Above Target</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: colors.primary },
                ]}
              />
              <Text style={styles.legendText}>Below Target</Text>
            </View>
          </View>
        </>
      )}
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
    alignItems: "flex-start",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceLight,
    padding: 10,
    borderRadius: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  chartContainer: {
    height: 140,
    position: "relative",
    justifyContent: "flex-end",
    paddingTop: 10,
    paddingBottom: 4,
  },
  targetLine: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  targetDashed: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderStyle: "dashed",
  },
  targetText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    marginLeft: 4,
  },
  barsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  barCol: {
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barFill: {
    width: "80%",
    borderRadius: 3,
    minHeight: 3,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 6,
  },
  dayLabelActive: {
    color: colors.textSecondary,
    fontWeight: "700",
  },
  dayLabelCompact: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 6,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
