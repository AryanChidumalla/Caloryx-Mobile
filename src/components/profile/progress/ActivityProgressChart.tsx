import { colors } from "@/styles/global";
import { DailyMetricPoint, ProgressTrend } from "@/types/health";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ActivityProgressChartProps = {
  points: DailyMetricPoint[];
  stepGoal: number;
  averageSteps: number;
  trend: ProgressTrend;
};

export default function ActivityProgressChart({
  points,
  stepGoal,
  averageSteps,
  trend,
}: ActivityProgressChartProps) {
  const maxVal = Math.max(...points.map((p) => p.value), 0);
  const chartMax = Math.max(stepGoal * 1.2, maxVal * 1.1, 5000);
  const hasAnyData = points.some((p) => p.hasData);
  const isCompact = points.length > 14;

  const getTrendBadge = () => {
    switch (trend) {
      case "improving":
        return {
          label: "Active",
          color: colors.protein,
          icon: "trending-up" as const,
        };
      case "needs_attention":
        return {
          label: "Below Goal",
          color: colors.warning,
          icon: "trending-down" as const,
        };
      default:
        return {
          label: "Steady",
          color: colors.textSecondary,
          icon: "remove" as const,
        };
    }
  };

  const trendBadge = getTrendBadge();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Activity & Steps</Text>
          <Text style={styles.subtitle}>
            {hasAnyData
              ? `Daily steps vs. ${stepGoal.toLocaleString()} goal`
              : "No step activity recorded"}
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
          <Ionicons name="footsteps-outline" size={28} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No step records found</Text>
          <Text style={styles.emptySub}>
            Connect Health Connect on Android or track steps daily to view your
            activity history.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PERIOD AVERAGE</Text>
              <Text style={styles.statVal}>
                {averageSteps.toLocaleString()} steps
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>GOAL</Text>
              <Text style={styles.statVal}>
                {stepGoal.toLocaleString()} steps
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>GOAL RATIO</Text>
              <Text
                style={[
                  styles.statVal,
                  averageSteps >= stepGoal
                    ? { color: colors.protein }
                    : { color: colors.textSecondary },
                ]}
              >
                {stepGoal > 0 ? Math.round((averageSteps / stepGoal) * 100) : 0}%
              </Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {/* Target Line */}
            <View
              style={[
                styles.targetLine,
                {
                  bottom: `${(stepGoal / chartMax) * 100}%`,
                },
              ]}
            >
              <View style={styles.targetDashed} />
              <Text style={styles.targetText}>
                {(stepGoal / 1000).toFixed(0)}k
              </Text>
            </View>

            {/* Bars */}
            <View style={styles.barsRow}>
              {points.map((p, idx) => {
                const heightPercent =
                  p.value > 0 ? Math.min(100, (p.value / chartMax) * 100) : 2;

                const barColor = !p.hasData
                  ? colors.surfaceLight
                  : p.value >= stepGoal
                    ? "#A78BFA"
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
    height: 130,
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
});
