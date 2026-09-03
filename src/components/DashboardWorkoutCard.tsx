import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { WorkoutSession } from "@/types/workout";
import { formatDateForDisplay, isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // State 1: Active Workout in Progress (only on today)
  if (isTodayDate && activeWorkout) {
    return (
      <View style={[styles.card, styles.activeBorder]}>
        <View style={styles.topRow}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconCircle, styles.activeIconCircle]}>
              <Ionicons name="flash" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.activeTitle}>Workout In Progress</Text>
              <Text style={styles.activeSub}>{activeWorkout.name}</Text>
            </View>
          </View>

          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={13} color="#FFFFFF" />
            <Text style={styles.timerText}>
              {formatTimer(activeDurationSeconds)}
            </Text>
          </View>
        </View>

        <View style={styles.activeExercisesRow}>
          <Text style={styles.activeExercisesText}>
            {activeWorkout.exercises.length}{" "}
            {activeWorkout.exercises.length === 1 ? "exercise" : "exercises"} added
          </Text>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => router.navigate("/(tabs)/workout")}
            activeOpacity={0.7}
          >
            <Text style={styles.resumeButtonText}>Resume Workout</Text>
            <Ionicons name="arrow-forward" size={14} color="#0A0A0A" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // State 2: Completed Workout for Date
  if (workoutForDate) {
    const mins = Math.round((workoutForDate.durationSeconds || 0) / 60);
    const setsCount = workoutForDate.exercises.reduce(
      (total, ex) => total + (ex.sets?.length || 0),
      0,
    );

    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconCircle, styles.completedIconCircle]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.protein} />
            </View>
            <View style={styles.titleWrap}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {workoutForDate.name}
              </Text>
              <Text style={styles.cardSub}>
                {isTodayDate
                  ? "Completed today"
                  : `Completed on ${formatDateForDisplay(date)}`}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            {onEditWorkout && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEditWorkout(workoutForDate)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="create-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.viewHistoryButton}
              onPress={() => router.navigate("/(tabs)/workout")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewHistoryText}>View</Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statVal}>
              {mins > 0 ? `${mins} min` : "<1 min"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Exercises</Text>
            <Text style={styles.statVal}>{workoutForDate.exercises.length}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Sets</Text>
            <Text style={styles.statVal}>{setsCount}</Text>
          </View>
          {workoutForDate.totalVolumeKg > 0 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Volume</Text>
                <Text style={styles.statVal}>
                  {workoutForDate.totalVolumeKg.toLocaleString()} kg
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // State 3: No Workout on Date
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="barbell-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.cardTitle}>
              {isTodayDate ? "Today's Workout" : "Workout"}
            </Text>
            <Text style={styles.cardSub}>
              {isTodayDate
                ? "No workout recorded today"
                : `No workout recorded on ${formatDateForDisplay(date)}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.navigate("/(tabs)/workout")}
          activeOpacity={0.7}
        >
          <Ionicons name="play" size={12} color="#0A0A0A" />
          <Text style={styles.startButtonText}>
            {isTodayDate ? "Start" : "Log"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickStartRow}>
        <TouchableOpacity
          style={styles.quickStartChip}
          onPress={() => router.navigate("/(tabs)/workout")}
          activeOpacity={0.7}
        >
          <Ionicons name="flash-outline" size={14} color={colors.primary} />
          <Text style={styles.quickStartText}>Start an Empty Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickStartChip}
          onPress={() => router.navigate("/(tabs)/workout")}
          activeOpacity={0.7}
        >
          <Ionicons name="layers-outline" size={14} color={colors.primary} />
          <Text style={styles.quickStartText}>Choose from Routines</Text>
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
  activeBorder: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  titleWrap: {
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconCircle: {
    backgroundColor: colors.primary,
  },
  completedIconCircle: {
    backgroundColor: "rgba(52, 211, 153, 0.12)",
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
  activeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  activeSub: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  activeExercisesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  activeExercisesText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  resumeButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A0A0A",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  viewHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewHistoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.surfaceBorder,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A0A0A",
  },
  quickStartRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  quickStartChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickStartText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});
