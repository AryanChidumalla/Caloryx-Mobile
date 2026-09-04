import { useHealth } from "@/context/HealthContext";
import { colors } from "@/styles/global";
import { formatDateForDisplay, isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type StepsTrackerCardProps = {
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
    refreshSteps,
  } = useHealth();

  const isTodayDate = !date || isToday(date);

  const stepsForDate = date
    ? activityHistory[date]?.stepCount ?? (isTodayDate ? todaySteps : 0)
    : todaySteps;

  const distMeters = date
    ? activityHistory[date]?.distanceMeters ??
      (isTodayDate ? distanceMeters : Math.round(stepsForDate * 0.762))
    : distanceMeters;

  const calsBurned = date
    ? activityHistory[date]?.caloriesBurned ??
      (isTodayDate ? caloriesBurned : Math.round(stepsForDate * 0.04))
    : caloriesBurned;

  const progressRatio = Math.min(
    1,
    stepGoal > 0 ? stepsForDate / stepGoal : 0,
  );
  const progressPercent = Math.round(progressRatio * 100);
  const kmDistance = (distMeters / 1000).toFixed(1);
  const isGoalReached = stepsForDate >= stepGoal && stepGoal > 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="footsteps" size={18} color="#A78BFA" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Daily Steps</Text>
            <Text style={styles.cardSub}>
              {isTodayDate
                ? healthStatus.isConnected
                  ? "Synced via Health Connect"
                  : Platform.OS === "android"
                    ? "Health Connect ready"
                    : "Daily step tracker"
                : `Logged on ${formatDateForDisplay(date)}`}
            </Text>
          </View>
        </View>

        {isTodayDate && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={refreshSteps}
            disabled={isConnectingHealth}
            activeOpacity={0.7}
          >
            {isConnectingHealth ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : (
              <>
                <Ionicons
                  name={healthStatus.isConnected ? "sync" : "link-outline"}
                  size={14}
                  color="#A78BFA"
                />
                <Text style={styles.syncText}>
                  {healthStatus.isConnected ? "Sync" : "Connect"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Main Steps Display */}
      <View style={styles.statsRow}>
        <View>
          <Text style={styles.stepValue}>{stepsForDate.toLocaleString()}</Text>
          <Text style={styles.stepGoalText}>
            Goal: {stepGoal.toLocaleString()} steps ({progressPercent}%)
          </Text>
        </View>

        <View style={styles.metricBadges}>
          <View style={styles.metricItem}>
            <Ionicons
              name="map-outline"
              size={13}
              color={colors.textSecondary}
            />
            <Text style={styles.metricText}>{kmDistance} km</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Ionicons
              name="flame-outline"
              size={13}
              color={colors.textSecondary}
            />
            <Text style={styles.metricText}>{calsBurned} kcal</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: isGoalReached ? colors.success : "#A78BFA",
            },
          ]}
        />
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
    backgroundColor: "rgba(167, 139, 250, 0.12)",
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
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  syncText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A78BFA",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  stepValue: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  stepGoalText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: "500",
  },
  metricBadges: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 8,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  metricDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.surfaceBorder,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});
