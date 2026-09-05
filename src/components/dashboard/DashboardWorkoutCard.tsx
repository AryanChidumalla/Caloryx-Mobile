import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { WorkoutSession } from "@/types/workout";
import {
  calculateTotalExercises,
  calculateTotalSets,
  formatWorkoutTimer,
} from "@/utils/workoutCalculations";
import { isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type DashboardWorkoutCardProps = {
  date?: string;
  onEditWorkout?: (session: WorkoutSession) => void;
};

export default function DashboardWorkoutCard({
  date,
  onEditWorkout,
}: DashboardWorkoutCardProps) {
  const {
    activeWorkout,
    activeDurationSeconds,
    todayWorkout,
    getWorkoutForDate,
  } = useWorkout();

  const isTodayDate = !date || isToday(date);

  const workoutForDate = date ? getWorkoutForDate(date) : todayWorkout;

  /*
   * =========================================================
   * ACTIVE WORKOUT
   * =========================================================
   */

  if (isTodayDate && activeWorkout) {
    return (
      <View style={[styles.card, styles.activeCard]}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <View style={styles.activeIcon}>
              <Ionicons name="flash" size={17} color="#FFFFFF" />
            </View>

            <View style={styles.titleWrap}>
              <Text style={styles.activeTitle}>Workout in Progress</Text>

              <Text style={styles.activeSubtitle} numberOfLines={1}>
                {activeWorkout.name}
              </Text>
            </View>
          </View>

          <View style={styles.timerBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.timerText}>
              {formatWorkoutTimer(activeDurationSeconds)}
            </Text>
          </View>
        </View>

        <View style={styles.activeFooter}>
          <View>
            <Text style={styles.footerLabel}>Exercises</Text>

            <Text style={styles.footerValue}>
              {calculateTotalExercises(activeWorkout)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => router.navigate("/(tabs)/workout")}
            activeOpacity={0.75}
          >
            <Text style={styles.resumeText}>Resume</Text>

            <Ionicons name="arrow-forward" size={15} color="#0A0A0A" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /*
   * =========================================================
   * COMPLETED WORKOUT
   * =========================================================
   */

  if (workoutForDate) {
    const mins = Math.round((workoutForDate.durationSeconds || 0) / 60);
    const totalExercises = calculateTotalExercises(workoutForDate);
    const setsCount = calculateTotalSets(workoutForDate);

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <View style={styles.completedIcon}>
              <Ionicons name="checkmark" size={17} color={colors.protein} />
            </View>

            <View style={styles.titleWrap}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {workoutForDate.name}
              </Text>

              <Text style={styles.cardSubtitle}>Completed</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.navigate("/(tabs)/workout")}
            activeOpacity={0.7}
          >
            <Text style={styles.viewButtonText}>View</Text>

            <Ionicons
              name="chevron-forward"
              size={13}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {mins > 0 ? `${mins} min` : "<1 min"}
            </Text>

            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalExercises}</Text>

            <Text style={styles.statLabel}>Exercises</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>{setsCount}</Text>

            <Text style={styles.statLabel}>Sets</Text>
          </View>
        </View>
      </View>
    );
  }

  /*
   * =========================================================
   * NO WORKOUT
   * =========================================================
   */

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="barbell-outline" size={17} color={colors.primary} />
          </View>

          <View style={styles.titleWrap}>
            <Text style={styles.cardTitle}>Workout</Text>

            <Text style={styles.cardSubtitle}>No workout recorded</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.navigate("/(tabs)/workout")}
          activeOpacity={0.75}
        >
          <Ionicons name="play" size={11} color="#0A0A0A" />

          <Text style={styles.startButtonText}>
            {isTodayDate ? "Start" : "Log"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.navigate("/(tabs)/workout")}
          activeOpacity={0.7}
        >
          <Ionicons name="flash-outline" size={15} color={colors.primary} />

          <Text style={styles.quickActionText}>Empty workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.navigate("/(tabs)/workout")}
          activeOpacity={0.7}
        >
          <Ionicons name="layers-outline" size={15} color={colors.primary} />

          <Text style={styles.quickActionText}>Choose routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /*
   * =========================================================
   * CARD
   * =========================================================
   */

  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 18,
    marginBottom: 16,
  },

  activeCard: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },

  /*
   * =========================================================
   * HEADER
   * =========================================================
   */

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },

  titleWrap: {
    flex: 1,
    minWidth: 0,
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryMuted,
  },

  completedIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 211, 153, 0.12)",
  },

  activeIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
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

  activeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  activeSubtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },

  /*
   * =========================================================
   * ACTIVE WORKOUT
   * =========================================================
   */

  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  timerText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },

  activeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },

  footerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  footerValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },

  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
  },

  resumeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  /*
   * =========================================================
   * COMPLETED WORKOUT
   * =========================================================
   */

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },

  viewButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 3,
  },

  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.surfaceBorder,
  },

  /*
   * =========================================================
   * NO WORKOUT
   * =========================================================
   */

  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },

  startButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  quickActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },

  quickActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
});
