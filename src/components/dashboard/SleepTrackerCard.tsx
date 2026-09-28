import { useHealth } from "@/context/HealthContext";
import { colors, typography } from "@/styles/global";
import { isToday } from "@/utils/date";
import {
  calculateSleepProgress,
  formatSleepDuration,
  getSleepQualityLabel,
} from "@/utils/healthCalculations";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SleepLogModal from "./SleepLogModal";

export type SleepTrackerCardProps = {
  date?: string;
};

export default function SleepTrackerCard({ date }: SleepTrackerCardProps) {
  const {
    todaySleepMinutes,
    sleepGoalMinutes,
    sleepHistory,
    recordSleep,
  } = useHealth();

  const [modalVisible, setModalVisible] = useState(false);

  const isTodayDate = !date || isToday(date);
  const activeDate = date || new Date().toISOString().split("T")[0];

  const logForDate = sleepHistory[activeDate];
  const currentMinutes = logForDate
    ? logForDate.durationMinutes
    : isTodayDate
      ? todaySleepMinutes
      : 0;

  const currentGoal = logForDate?.goalMinutes || sleepGoalMinutes;
  const quality = logForDate?.quality;

  const { progressPercent, isGoalReached } = calculateSleepProgress(
    currentMinutes,
    currentGoal,
  );

  const qualityInfo = quality
    ? getSleepQualityLabel(currentMinutes, currentGoal)
    : null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.iconContainer,
              isGoalReached && styles.iconContainerComplete,
            ]}
          >
            <Ionicons
              name="moon"
              size={16}
              color={isGoalReached ? colors.sleep : colors.textSecondary}
            />
          </View>
          <View>
            <Text style={styles.cardTitle}>Sleep & Rest</Text>
            <Text style={styles.cardSubtitle}>
              {currentMinutes > 0 ? "Logged rest" : "No sleep recorded"}
            </Text>
          </View>
        </View>

        {qualityInfo && (
          <View
            style={[
              styles.qualityBadge,
              { backgroundColor: `${qualityInfo.color}1A` },
            ]}
          >
            <Text style={[styles.qualityText, { color: qualityInfo.color }]}>
              {qualityInfo.label}
            </Text>
          </View>
        )}
      </View>

      {/* Main duration & target */}
      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.eyebrow}>DURATION</Text>
          <View style={styles.durationRow}>
            <Text style={styles.durationValue}>
              {currentMinutes > 0 ? formatSleepDuration(currentMinutes) : "—"}
            </Text>
          </View>
        </View>

        <View style={styles.targetCol}>
          <Text style={styles.eyebrow}>TARGET</Text>
          <Text style={styles.targetValue}>
            {formatSleepDuration(currentGoal)}
          </Text>
        </View>
      </View>

      {/* Horizontal Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(100, progressPercent)}%`,
              backgroundColor: isGoalReached ? colors.protein : colors.sleep,
            },
          ]}
        />
      </View>

      {/* Action Row */}
      <View style={styles.footerRow}>
        <Text style={styles.progressLabel}>
          {progressPercent > 0
            ? `${progressPercent}% of sleep goal`
            : "Track your sleep to measure recovery"}
        </Text>

        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Log sleep"
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentMinutes > 0 ? "create-outline" : "add"}
            size={14}
            color={colors.text}
          />
          <Text style={styles.logBtnText}>
            {currentMinutes > 0 ? "Edit" : "Log Sleep"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <SleepLogModal
        visible={modalVisible}
        initialMinutes={currentMinutes || 480}
        initialQuality={quality || "good"}
        goalMinutes={currentGoal}
        onSave={async (mins, q, notes) => {
          await recordSleep(mins, q, activeDate, notes);
        }}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerComplete: {
    backgroundColor: colors.sleepMuted,
    borderColor: colors.sleep,
  },
  cardTitle: {
    ...typography.h3,
  },
  cardSubtitle: {
    ...typography.caption,
    marginTop: 1,
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  eyebrow: {
    ...typography.eyebrow,
    marginBottom: 2,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  durationValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  targetCol: {
    alignItems: "flex-end",
  },
  targetValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceBorder,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
});
