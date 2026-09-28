import StepsMetricsRow from "@/components/dashboard/steps/StepsMetricsRow";
import StepsProgressRing from "@/components/dashboard/steps/StepsProgressRing";
import { useHealth } from "@/context/HealthContext";
import { colors } from "@/styles/global";
import { formatDateForDisplay, isToday } from "@/utils/date";
import {
  calculateStepProgress,
  estimateCaloriesBurned,
  estimateDistanceMeters,
} from "@/utils/healthCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type StepsTrackerCardProps = {
  date?: string;
};

export default function StepsTrackerCard({ date }: StepsTrackerCardProps) {
  const {
    todaySteps,
    stepGoal,
    distanceMeters,
    caloriesBurned,
    activityHistory,
    healthStatus,
    isConnectingHealth,
    connectHealthConnect,
    refreshSteps,
  } = useHealth();

  const isTodayDate = !date || isToday(date);

  // Date-specific values (source of truth from activityHistory or today's active values)
  const stepsForDate = date
    ? (activityHistory[date]?.stepCount ?? (isTodayDate ? todaySteps : 0))
    : todaySteps;

  const distMeters = date
    ? (activityHistory[date]?.distanceMeters ??
      (isTodayDate ? distanceMeters : estimateDistanceMeters(stepsForDate)))
    : distanceMeters;

  const calsBurned = date
    ? (activityHistory[date]?.caloriesBurned ??
      (isTodayDate ? caloriesBurned : estimateCaloriesBurned(stepsForDate)))
    : caloriesBurned;

  const { progressRatio, progressPercent, remainingSteps, isGoalReached } =
    useMemo(
      () => calculateStepProgress(stepsForDate, stepGoal),
      [stepsForDate, stepGoal],
    );

  const activityMessage = useMemo(() => {
    if (isGoalReached) {
      return {
        icon: "checkmark-circle" as const,
        text: "Daily goal reached!",
        color: colors.success,
      };
    }

    if (remainingSteps <= 2000 && remainingSteps > 0) {
      return {
        icon: "arrow-up-circle" as const,
        text: `${remainingSteps.toLocaleString()} to goal`,
        color: "#A78BFA",
      };
    }

    if (stepsForDate === 0) {
      return {
        icon: "walk-outline" as const,
        text: "Let's get moving!",
        color: colors.textSecondary,
      };
    }

    return {
      icon: "trending-up-outline" as const,
      text: `${progressPercent}% of goal`,
      color: colors.textSecondary,
    };
  }, [isGoalReached, remainingSteps, stepsForDate, progressPercent]);

  const handleAction = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!healthStatus.isConnected) {
      await connectHealthConnect();
    } else {
      await refreshSteps();
    }
  };

  const getSubtitle = () => {
    if (!isTodayDate) {
      return `Activity on ${formatDateForDisplay(date)}`;
    }
    if (healthStatus.isConnected) {
      return healthStatus.source === "health_connect"
        ? "Synced via Health Connect"
        : "Tracking via Pedometer";
    }
    if (healthStatus.isDenied) {
      return "Step permissions denied • Tap to retry";
    }
    if (!healthStatus.isAvailable) {
      return "Step tracking unavailable on device";
    }
    return "Tap to connect step tracking";
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Daily Activity</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {getSubtitle()}
          </Text>
        </View>

        {isTodayDate && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              !healthStatus.isConnected && styles.connectButton,
            ]}
            onPress={handleAction}
            disabled={isConnectingHealth || !healthStatus.isAvailable}
            activeOpacity={0.7}
          >
            {isConnectingHealth ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : !healthStatus.isConnected ? (
              <View style={styles.connectButtonContent}>
                <Ionicons name="link-outline" size={14} color="#A78BFA" />
                <Text style={styles.connectButtonText}>Connect</Text>
              </View>
            ) : (
              <Ionicons name="sync-outline" size={17} color="#A78BFA" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Circular Progress Ring */}
      <StepsProgressRing
        steps={stepsForDate}
        progressRatio={progressRatio}
        activityMessage={activityMessage}
      />

      {/* Goal Summary Line */}
      <View style={styles.goalRow}>
        <Text style={styles.goalPercentText}>{progressPercent}%</Text>
        <Text style={styles.goalTargetText}>
          of {stepGoal.toLocaleString()} daily target
        </Text>
      </View>

      {/* Metrics 3-column row */}
      <StepsMetricsRow
        distanceMeters={distMeters}
        caloriesBurned={calsBurned}
        stepGoal={stepGoal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(167, 139, 250, 0.10)",
  },
  connectButton: {
    width: "auto",
    paddingHorizontal: 10,
  },
  connectButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  connectButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A78BFA",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: -4,
    marginBottom: 12,
  },
  goalPercentText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#A78BFA",
  },
  goalTargetText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
});
