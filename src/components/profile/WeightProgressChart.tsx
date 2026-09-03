import { colors } from "@/styles/global";
import { ProgressTrend, WeightEntry } from "@/types/health";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WeightProgressChartProps = {
  entries: WeightEntry[];
  currentWeight: number;
  deltaKg: number;
  trend: ProgressTrend;
  minWeight: number;
  maxWeight: number;
};

export default function WeightProgressChart({
  entries,
  currentWeight,
  deltaKg,
  trend,
  minWeight,
  maxWeight,
}: WeightProgressChartProps) {
  const hasMultiple = entries.length >= 2;

  const getTrendBadge = () => {
    if (!hasMultiple) {
      return {
        label: "Baseline",
        color: colors.primary,
        icon: "information-circle-outline" as const,
      };
    }
    if (deltaKg < 0) {
      return {
        label: `${deltaKg} kg`,
        color: colors.protein,
        icon: "trending-down" as const,
      };
    }
    if (deltaKg > 0) {
      return {
        label: `+${deltaKg} kg`,
        color: "#A78BFA",
        icon: "trending-up" as const,
      };
    }
    return {
      label: "Stable",
      color: colors.textSecondary,
      icon: "remove" as const,
    };
  };

  const badge = getTrendBadge();
  const rangeSpan = Math.max(2, maxWeight - minWeight);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weight Progression</Text>
          <Text style={styles.subtitle}>
            {hasMultiple
              ? `${entries.length} weigh-ins recorded in period`
              : "Current body weight baseline"}
          </Text>
        </View>

        <View
          style={[styles.trendBadge, { backgroundColor: `${badge.color}18` }]}
        >
          <Ionicons name={badge.icon} size={13} color={badge.color} />
          <Text style={[styles.trendText, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {!hasMultiple ? (
        <View style={styles.singleEntryCard}>
          <View style={styles.weightCircle}>
            <Text style={styles.circleVal}>{currentWeight}</Text>
            <Text style={styles.circleUnit}>kg</Text>
          </View>
          <View style={styles.singleEntryTextWrap}>
            <Text style={styles.singleEntryTitle}>Single entry recorded</Text>
            <Text style={styles.singleEntrySub}>
              Update your weight in Goals periodically to generate a multi-week
              trend line.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logWeightBtn}
            onPress={() => router.push("/profile/goals")}
          >
            <Ionicons name="add" size={14} color="#0A0A0A" />
            <Text style={styles.logWeightText}>Update</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Summary Row */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>START</Text>
              <Text style={styles.statVal}>{entries[0].weightKg} kg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CURRENT</Text>
              <Text style={styles.statVal}>{currentWeight} kg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>NET CHANGE</Text>
              <Text
                style={[
                  styles.statVal,
                  deltaKg < 0 && { color: colors.protein },
                  deltaKg > 0 && { color: "#A78BFA" },
                ]}
              >
                {deltaKg > 0 ? `+${deltaKg}` : `${deltaKg}`} kg
              </Text>
            </View>
          </View>

          {/* Visual Progression Bars */}
          <View style={styles.chartContainer}>
            <View style={styles.chartTrack}>
              {entries.map((entry, idx) => {
                const ratio = (entry.weightKg - minWeight) / rangeSpan;
                const heightPct = Math.max(15, Math.min(100, 20 + ratio * 80));

                return (
                  <View key={`${entry.date}-${idx}`} style={styles.pointCol}>
                    <Text style={styles.pointWeight}>{entry.weightKg}</Text>
                    <View style={styles.barWrap}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPct}%`,
                            backgroundColor:
                              idx === entries.length - 1
                                ? colors.protein
                                : colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.pointDate} numberOfLines={1}>
                      {entry.date.slice(5)}
                    </Text>
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
  singleEntryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  weightCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  circleVal: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
  circleUnit: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  singleEntryTextWrap: {
    flex: 1,
  },
  singleEntryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  singleEntrySub: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  logWeightBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  logWeightText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.background,
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
    paddingTop: 10,
    paddingBottom: 4,
  },
  chartTrack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 8,
  },
  pointCol: {
    alignItems: "center",
    flex: 1,
    height: "100%",
  },
  pointWeight: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  barWrap: {
    flex: 1,
    width: 14,
    justifyContent: "flex-end",
    backgroundColor: colors.surfaceLight,
    borderRadius: 7,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 7,
  },
  pointDate: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 6,
  },
});
