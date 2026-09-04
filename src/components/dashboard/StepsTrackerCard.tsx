import { useHealth } from "@/context/HealthContext";
import { colors } from "@/styles/global";
import { formatDateForDisplay, isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

type StepsTrackerCardProps = {
  date?: string;
};

const RING_SIZE = 190;
const RING_STROKE = 13;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function StepsTrackerCard({ date }: StepsTrackerCardProps) {
  const {
    todaySteps,
    stepGoal,
    distanceMeters,
    caloriesBurned,
    activityHistory,
    healthStatus,
    isConnectingHealth,
    refreshSteps,
  } = useHealth();

  const isTodayDate = !date || isToday(date);

  /*
   * -----------------------------------------
   * Date-specific values
   * -----------------------------------------
   */

  const stepsForDate = date
    ? (activityHistory[date]?.stepCount ?? (isTodayDate ? todaySteps : 0))
    : todaySteps;

  const distMeters = date
    ? (activityHistory[date]?.distanceMeters ??
      (isTodayDate ? distanceMeters : Math.round(stepsForDate * 0.762)))
    : distanceMeters;

  const calsBurned = date
    ? (activityHistory[date]?.caloriesBurned ??
      (isTodayDate ? caloriesBurned : Math.round(stepsForDate * 0.04)))
    : caloriesBurned;

  /*
   * -----------------------------------------
   * Progress
   * -----------------------------------------
   */

  const progressRatio = useMemo(() => {
    if (stepGoal <= 0) return 0;

    return Math.min(1, stepsForDate / stepGoal);
  }, [stepsForDate, stepGoal]);

  const progressPercent = Math.round(progressRatio * 100);

  const isGoalReached = stepGoal > 0 && stepsForDate >= stepGoal;

  /*
   * -----------------------------------------
   * Display values
   * -----------------------------------------
   */

  const kmDistance = (distMeters / 1000).toFixed(1);

  const remainingSteps = Math.max(0, stepGoal - stepsForDate);

  /*
   * -----------------------------------------
   * Activity message
   * -----------------------------------------
   */

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
        text: `${remainingSteps.toLocaleString()} steps to goal`,
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
      text: `${progressPercent}% of daily goal`,
      color: colors.textSecondary,
    };
  }, [isGoalReached, remainingSteps, stepsForDate, progressPercent]);

  /*
   * -----------------------------------------
   * Ring
   * -----------------------------------------
   */

  const ringColor = isGoalReached ? colors.success : "#A78BFA";

  const ringOffset = RING_CIRCUMFERENCE * (1 - progressRatio);

  /*
   * -----------------------------------------
   * Sync
   * -----------------------------------------
   */

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await refreshSteps();
  };

  /*
   * -----------------------------------------
   * Render
   * -----------------------------------------
   */

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Activity</Text>

          <Text style={styles.subtitle}>
            {isTodayDate
              ? healthStatus.isConnected
                ? "Synced via Health Connect"
                : Platform.OS === "android"
                  ? "Health Connect ready"
                  : "Today's movement"
              : `Activity on ${formatDateForDisplay(date)}`}
          </Text>
        </View>

        {isTodayDate && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={isConnectingHealth}
            activeOpacity={0.7}
          >
            {isConnectingHealth ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : (
              <Ionicons
                name={
                  healthStatus.isConnected ? "sync-outline" : "link-outline"
                }
                size={17}
                color="#A78BFA"
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Circular Progress */}
      <View style={styles.ringContainer}>
        <Svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        >
          <Defs>
            <LinearGradient
              id="activityGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#A78BFA" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </LinearGradient>
          </Defs>

          {/* Background Ring */}
          <Circle
            stroke={colors.surfaceLight}
            fill="none"
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            strokeWidth={RING_STROKE}
          />

          {/* Progress Ring */}
          <Circle
            stroke={isGoalReached ? colors.success : "url(#activityGradient)"}
            fill="none"
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            strokeDashoffset={ringOffset}
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>

        {/* Ring Center */}
        <View style={styles.ringCenter}>
          <Text style={styles.stepValue}>{stepsForDate.toLocaleString()}</Text>

          <Text style={styles.stepLabel}>STEPS</Text>
        </View>
      </View>

      {/* Goal */}
      <View style={styles.goalContainer}>
        <Text style={styles.goalPercent}>{progressPercent}%</Text>

        <Text style={styles.goalText}>of {stepGoal.toLocaleString()} goal</Text>
      </View>

      {/* Activity Status */}
      <View style={styles.statusRow}>
        <Ionicons
          name={activityMessage.icon}
          size={15}
          color={activityMessage.color}
        />

        <Text
          style={[
            styles.statusText,
            {
              color: activityMessage.color,
            },
          ]}
        >
          {activityMessage.text}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Supporting Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Ionicons
              name="map-outline"
              size={16}
              color={colors.textSecondary}
            />
          </View>

          <View>
            <Text style={styles.metricValue}>{kmDistance} km</Text>

            <Text style={styles.metricLabel}>Distance</Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Ionicons
              name="flame-outline"
              size={16}
              color={colors.textSecondary}
            />
          </View>

          <View>
            <Text style={styles.metricValue}>
              {calsBurned.toLocaleString()} kcal
            </Text>

            <Text style={styles.metricLabel}>Active calories</Text>
          </View>
        </View>
      </View>
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
    paddingTop: 20,
    paddingBottom: 18,
    marginBottom: 16,
  },

  /*
   * Header
   */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    marginTop: 3,
  },

  syncButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(167, 139, 250, 0.10)",
  },

  /*
   * Ring
   */

  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  stepValue: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -1,
  },

  stepLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginTop: 2,
  },

  /*
   * Goal
   */

  goalContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: 4,
  },

  goalPercent: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  goalText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
    marginLeft: 4,
  },

  /*
   * Status
   */

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  /*
   * Divider
   */

  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginTop: 18,
    marginBottom: 16,
  },

  /*
   * Metrics
   */

  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  metric: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },

  metricValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
  },

  metricLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: 2,
  },

  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.surfaceBorder,
  },
});
