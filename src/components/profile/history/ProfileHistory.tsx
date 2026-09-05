import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WorkoutHistoryCard from "../../workout/history/WorkoutHistoryCard";

type ProfileHistoryProps = {
  workoutSessions: any[];
  deleteSession: (id: string) => void;
  setEditingWorkout: (session: any) => void;
  recentDays: string[];
  activityHistory: any;
  waterHistory: any;
  isToday: (date: string) => boolean;
  formatDateForDisplay: (date: string) => string;
  stepGoal: number;
  waterGoal: number;
};

export default function ProfileHistory({
  workoutSessions,
  deleteSession,
  setEditingWorkout,
  recentDays,
  activityHistory,
  waterHistory,
  isToday,
  formatDateForDisplay,
  stepGoal,
  waterGoal,
}: ProfileHistoryProps) {
  return (
    <View style={styles.historyContainer}>
      {/* Workouts History Header & Stats */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionHeading}>Past Workouts</Text>
          <Text style={styles.sectionSub}>
            {workoutSessions.length} total workout sessions logged
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newWorkoutChip}
          onPress={() => router.push("/(tabs)/workout")}
        >
          <Ionicons name="add" size={13} color={colors.primary} />
          <Text style={styles.newWorkoutChipText}>Log Workout</Text>
        </TouchableOpacity>
      </View>

      {workoutSessions.length === 0 ? (
        <View style={styles.emptyHistoryCard}>
          <Ionicons name="barbell-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyHistoryTitle}>No past workouts</Text>
          <Text style={styles.emptyHistorySub}>
            When you complete workouts in the Workout tab, they will appear here
            with full sets, weights, and editing options.
          </Text>
        </View>
      ) : (
        workoutSessions.map((sessionItem) => (
          <WorkoutHistoryCard
            key={sessionItem.id}
            session={sessionItem}
            onDelete={deleteSession}
            onEdit={(s) => setEditingWorkout(s)}
          />
        ))
      )}

      {/* Daily Activity & Hydration History */}
      <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
        <View>
          <Text style={styles.sectionHeading}>Daily Activity & Water Log</Text>
          <Text style={styles.sectionSub}>
            Recent 14-day steps and hydration records
          </Text>
        </View>
      </View>

      <View style={styles.activityLogCard}>
        {recentDays.map((dStr, idx) => {
          const daySteps = activityHistory[dStr]?.stepCount ?? 0;
          const dayWater = waterHistory[dStr] ?? 0;
          const isDayToday = isToday(dStr);

          const stepsReached = daySteps >= stepGoal && stepGoal > 0;
          const waterReached = dayWater >= waterGoal && waterGoal > 0;

          return (
            <View
              key={dStr}
              style={[
                styles.activityLogRow,
                idx < recentDays.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.logDateCol}>
                <Text
                  style={[
                    styles.logDateText,
                    isDayToday && styles.logDateToday,
                  ]}
                >
                  {isDayToday ? "Today" : formatDateForDisplay(dStr)}
                </Text>
              </View>

              <View style={styles.logMetricsCol}>
                {/* Steps */}
                <View style={styles.metricBadge}>
                  <Ionicons
                    name="footsteps"
                    size={12}
                    color={stepsReached ? colors.protein : "#A78BFA"}
                  />
                  <Text
                    style={[
                      styles.metricValText,
                      stepsReached && { color: colors.protein },
                    ]}
                  >
                    {daySteps > 0 ? `${daySteps.toLocaleString()}` : "0"}{" "}
                    <Text style={styles.metricUnit}>steps</Text>
                  </Text>
                </View>

                {/* Water */}
                <View style={styles.metricBadge}>
                  <Ionicons
                    name="water"
                    size={12}
                    color={waterReached ? colors.protein : "#38BDF8"}
                  />
                  <Text
                    style={[
                      styles.metricValText,
                      waterReached && { color: colors.protein },
                    ]}
                  >
                    {dayWater > 0 ? `${dayWater}` : "0"}{" "}
                    <Text style={styles.metricUnit}>ml</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  viewSegment: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  viewSegmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 11,
  },
  viewSegmentBtnActive: {
    backgroundColor: colors.primary,
  },
  viewSegmentText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  viewSegmentTextActive: {
    color: colors.background,
    fontWeight: "800",
  },
  historyContainer: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  newWorkoutChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newWorkoutChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyHistoryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  emptyHistoryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  emptyHistorySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  activityLogCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  activityLogRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  logDateCol: {
    flex: 1,
  },
  logDateText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  logDateToday: {
    color: colors.primary,
    fontWeight: "800",
  },
  logMetricsCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metricBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricValText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  metricUnit: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
