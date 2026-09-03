import { useHealth } from "@/context/HealthContext";
import { colors } from "@/styles/global";
import { isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GLASS_SIZE_ML = 250;

type WaterTrackerCardProps = {
  date?: string;
};

export default function WaterTrackerCard({ date }: WaterTrackerCardProps) {
  const { waterIntake, waterGoal, waterHistory, addWater, removeWater } =
    useHealth();

  const isTodayDate = !date || isToday(date);
  const currentIntake = date
    ? waterHistory[date] ?? (isTodayDate ? waterIntake : 0)
    : waterIntake;

  const progressRatio = Math.min(
    1,
    waterGoal > 0 ? currentIntake / waterGoal : 0,
  );

  const progressPercent = Math.round(progressRatio * 100);
  const remainingMl = Math.max(0, waterGoal - currentIntake);
  const isGoalReached = currentIntake >= waterGoal && waterGoal > 0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={18} color="#38BDF8" />
          </View>

          <View>
            <Text style={styles.cardTitle}>Water Intake</Text>
            <Text style={styles.cardSub}>
              {isGoalReached
                ? "Daily goal achieved!"
                : `${remainingMl} ml left to reach goal`}
            </Text>
          </View>
        </View>

        {/* Intake */}
        <View style={styles.intakeBadge}>
          <Text style={styles.intakeValue}>{currentIntake}</Text>
          <Text style={styles.goalText}>/ {waterGoal} ml</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: isGoalReached ? colors.success : "#38BDF8",
            },
          ]}
        />
      </View>

      {/* Quick Increment Controls */}
      <View style={styles.controlsRow}>
        {/* +1 Glass */}
        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => addWater(GLASS_SIZE_ML, date)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={14} color="#FFFFFF" />
          <Text style={styles.actionText}>+250 ml</Text>
        </TouchableOpacity>

        {/* +2 Glasses */}
        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => addWater(GLASS_SIZE_ML * 2, date)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={14} color="#FFFFFF" />
          <Text style={styles.actionText}>+500 ml</Text>
        </TouchableOpacity>

        {/* -1 Glass */}
        <TouchableOpacity
          style={[
            styles.undoButton,
            currentIntake === 0 && styles.buttonDisabled,
          ]}
          onPress={() => removeWater(GLASS_SIZE_ML, date)}
          disabled={currentIntake === 0}
          activeOpacity={0.7}
        >
          <Ionicons
            name="remove"
            size={14}
            color={currentIntake === 0 ? colors.textMuted : colors.textSecondary}
          />
          <Text
            style={[
              styles.undoText,
              currentIntake === 0 && {
                color: colors.textMuted,
              },
            ]}
          >
            -250 ml
          </Text>
        </TouchableOpacity>
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
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  intakeBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  intakeValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  goalText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 9,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  undoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  undoText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
