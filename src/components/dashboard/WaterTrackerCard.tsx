import { useHealth } from "@/context/HealthContext";
import { colors } from "@/styles/global";
import { isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WaterTrackerCardProps = {
  date?: string;
};

export default function WaterTrackerCard({ date }: WaterTrackerCardProps) {
  const { waterIntake, waterGoal, waterHistory, addWater, removeWater } =
    useHealth();

  const isTodayDate = !date || isToday(date);

  const currentIntake = date
    ? (waterHistory[date] ?? (isTodayDate ? waterIntake : 0))
    : waterIntake;

  const progressRatio = Math.min(
    1,
    waterGoal > 0 ? currentIntake / waterGoal : 0,
  );

  const progressPercent = Math.round(progressRatio * 100);

  const remainingMl = Math.max(0, waterGoal - currentIntake);

  const isGoalReached = waterGoal > 0 && currentIntake >= waterGoal;

  const formatAmount = (ml: number) => {
    if (ml >= 1000) {
      const liters = ml / 1000;
      return `${Number(liters.toFixed(2))} L`;
    }

    return `${ml} ml`;
  };

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
              name="water"
              size={17}
              color={isGoalReached ? colors.success : colors.text}
            />
          </View>

          <View style={styles.titleContent}>
            <Text style={styles.cardTitle}>Hydration</Text>

            <Text style={styles.cardSubtitle}>
              {isGoalReached ? "Daily goal achieved" : "Daily water intake"}
            </Text>
          </View>
        </View>

        {/* Percentage */}
        <View
          style={[
            styles.percentContainer,
            isGoalReached && styles.percentContainerComplete,
          ]}
        >
          {isGoalReached && (
            <Ionicons name="checkmark" size={13} color={colors.success} />
          )}

          <Text
            style={[
              styles.percentText,
              isGoalReached && styles.percentTextComplete,
            ]}
          >
            {progressPercent}%
          </Text>
        </View>
      </View>

      {/* Main Amount */}
      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <View style={styles.amountValueContainer}>
            <Text style={styles.amountValue}>
              {formatAmount(currentIntake)}
            </Text>
          </View>

          <Text style={styles.amountGoal}>/ {formatAmount(waterGoal)}</Text>
        </View>

        <Text
          style={[
            styles.remainingText,
            isGoalReached && styles.goalReachedText,
          ]}
        >
          {isGoalReached
            ? "You've reached your daily target"
            : `${formatAmount(remainingMl)} remaining`}
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: isGoalReached ? colors.success : colors.text,
            },
          ]}
        />
      </View>

      {/* Actions */}
      {/* Actions */}
      <View style={styles.actionsRow}>
        {/* Remove 100 ml */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.removeButton,
            currentIntake === 0 && styles.disabledButton,
          ]}
          onPress={() => removeWater(100, date)}
          disabled={currentIntake === 0}
          activeOpacity={0.7}
        >
          <Ionicons
            name="remove"
            size={15}
            color={
              currentIntake === 0 ? colors.textMuted : colors.textSecondary
            }
          />

          <Text
            style={[
              styles.secondaryActionText,
              currentIntake === 0 && styles.disabledText,
            ]}
          >
            100 ml
          </Text>
        </TouchableOpacity>

        {/* Add 250 ml */}
        <TouchableOpacity
          style={[styles.actionButton]}
          onPress={() => addWater(250, date)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={colors.text} />

          <Text style={styles.primaryActionText}>250 ml</Text>
        </TouchableOpacity>

        {/* Add 500 ml */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => addWater(500, date)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={15} color={colors.textSecondary} />

          <Text style={styles.primaryActionText}>500 ml</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // =========================================================
  // Card
  // =========================================================

  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 18,
    marginBottom: 16,
  },

  // =========================================================
  // Header
  // =========================================================

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },

  titleContent: {
    flex: 1,
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainerComplete: {
    backgroundColor: "rgba(52, 211, 153, 0.10)",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // =========================================================
  // Percentage
  // =========================================================

  percentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },

  percentContainerComplete: {
    backgroundColor: "rgba(52, 211, 153, 0.10)",
  },

  percentText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },

  percentTextComplete: {
    color: colors.success,
  },

  // =========================================================
  // Amount
  // =========================================================

  amountSection: {
    marginTop: 20,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  /*
   * Fixed width keeps the goal value stable when
   * the current amount changes.
   */
  amountValueContainer: {
    width: 92,
  },

  amountValue: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },

  amountGoal: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    fontVariant: ["tabular-nums"],
  },

  remainingText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 4,
  },

  goalReachedText: {
    color: colors.success,
  },

  // =========================================================
  // Progress
  // =========================================================

  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 15,
  },

  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  // =========================================================
  // Actions
  // =========================================================

  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 15,
  },

  actionButton: {
    flex: 1,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 11,
    paddingHorizontal: 8,
  },

  primaryButton: {
    flex: 1.35,
    backgroundColor: colors.surfaceLight,
    borderColor: colors.textSecondary,
  },

  removeButton: {
    flex: 0.85,
  },

  primaryActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },

  secondaryActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  disabledButton: {
    opacity: 0.4,
  },

  disabledText: {
    color: colors.textMuted,
  },
});
