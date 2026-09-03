import EditWorkoutModal from "@/components/EditWorkoutModal";
import {
  ActivityProgressChart,
  CalorieConsistencyChart,
  GoalProgressCard,
  MacroProgressCard,
  ProfileHeader,
  ProgressSummaryCards,
  TimeFilterPills,
  UpdateGoalsButton,
  WaterProgressChart,
  WeightProgressChart,
} from "@/components/profile";
import WorkoutHistoryCard from "@/components/WorkoutHistoryCard";
import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
import { useNutrition } from "@/context/NutritionContext";
import { useWorkout } from "@/context/WorkoutContext";
import { getGuestProfile } from "@/storage/nutritionStorage";
import { colors, globalStyles } from "@/styles/global";
import { TimeFilter } from "@/types/health";
import { PrimaryGoal } from "@/types/nutrition";
import { WorkoutSession } from "@/types/workout";
import { formatDateForDisplay, isToday } from "@/utils/date";
import {
  aggregateDailyMetrics,
  aggregateDailyNutrition,
  aggregateWeightHistory,
  getDateRangeList,
  getDaysCountForFilter,
} from "@/utils/progressCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ProfileViewTab = "dashboard" | "history";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, session, mode } = useAuth();
  const { meals, goals, refreshAll } = useNutrition();
  const {
    waterGoal,
    waterHistory,
    stepGoal,
    activityHistory,
    weightHistory,
    refreshHealth,
  } = useHealth();
  const {
    sessions: workoutSessions,
    deleteSession,
    updateSession,
    refreshWorkouts,
  } = useWorkout();

  const [viewTab, setViewTab] = useState<ProfileViewTab>("dashboard");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [guestGoal, setGuestGoal] = useState<PrimaryGoal>("maintain");
  const [guestDeficit, setGuestDeficit] = useState(400);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutSession | null>(
    null,
  );

  const isGuest = mode === "guest";

  // Load guest profile goal if in guest mode
  useEffect(() => {
    async function loadGuestData() {
      if (isGuest) {
        const guestData = await getGuestProfile();
        if (guestData?.goal) setGuestGoal(guestData.goal);
        if (guestData?.calorieAdjustment) {
          setGuestDeficit(guestData.calorieAdjustment);
        }
      }
    }
    loadGuestData();
  }, [isGuest]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAll(), refreshHealth(), refreshWorkouts()]);
    setRefreshing(false);
  };

  const displayName =
    profile?.username ||
    session?.user?.email?.split("@")[0] ||
    (isGuest ? "Guest Athlete" : "Caloryx User");

  const subtitle = isGuest
    ? "Local offline tracking"
    : session?.user?.email || "Cloud Synced";

  const currentWeight = Number(profile?.weight) || 70;
  const currentGoal: PrimaryGoal = isGuest
    ? guestGoal
    : (profile?.activity_level as any) || "maintain";
  const deficitOrSurplus = isGuest ? guestDeficit : 400;

  // 1. Generate aligned date range list for dashboard charts
  const daysCount = getDaysCountForFilter(timeFilter);
  const dateList = useMemo(() => getDateRangeList(daysCount), [daysCount]);

  // 2. Nutrition calculations
  const nutritionData = useMemo(() => {
    return aggregateDailyNutrition(
      meals,
      dateList,
      goals.calories,
      timeFilter,
    );
  }, [meals, dateList, goals.calories, timeFilter]);

  // 3. Activity / Steps calculations
  const stepsMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of dateList) {
      map[d] = activityHistory[d]?.stepCount ?? 0;
    }
    return map;
  }, [activityHistory, dateList]);

  const activityData = useMemo(() => {
    return aggregateDailyMetrics(stepsMap, dateList, stepGoal, timeFilter);
  }, [stepsMap, dateList, stepGoal, timeFilter]);

  // 4. Water calculations
  const waterMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of dateList) {
      map[d] = waterHistory[d] ?? 0;
    }
    return map;
  }, [waterHistory, dateList]);

  const waterData = useMemo(() => {
    return aggregateDailyMetrics(waterMap, dateList, waterGoal, timeFilter);
  }, [waterMap, dateList, waterGoal, timeFilter]);

  // 5. Weight calculations
  const weightData = useMemo(() => {
    return aggregateWeightHistory(weightHistory, currentWeight, dateList);
  }, [weightHistory, currentWeight, dateList]);

  // 6. Recent 14-day chronological activity & water log for History view
  const recentDays = useMemo(() => getDateRangeList(14), []);

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          displayName={displayName}
          subtitle={subtitle}
          isGuest={isGuest}
        />

        {/* View Switcher: Progress Dashboard vs History */}
        <View style={styles.viewSegment}>
          <TouchableOpacity
            style={[
              styles.viewSegmentBtn,
              viewTab === "dashboard" && styles.viewSegmentBtnActive,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setViewTab("dashboard");
            }}
          >
            <Ionicons
              name="analytics-outline"
              size={15}
              color={
                viewTab === "dashboard"
                  ? colors.background
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.viewSegmentText,
                viewTab === "dashboard" && styles.viewSegmentTextActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewSegmentBtn,
              viewTab === "history" && styles.viewSegmentBtnActive,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setViewTab("history");
            }}
          >
            <Ionicons
              name="time-outline"
              size={15}
              color={
                viewTab === "history" ? colors.background : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.viewSegmentText,
                viewTab === "history" && styles.viewSegmentTextActive,
              ]}
            >
              History ({workoutSessions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 1: PROGRESS DASHBOARD */}
        {/* ------------------------------------------------------------------- */}
        {viewTab === "dashboard" && (
          <>
            {/* Time Filter Pills */}
            <TimeFilterPills selected={timeFilter} onSelect={setTimeFilter} />

            {/* Top Summary Stat Tiles */}
            <ProgressSummaryCards
              currentWeight={currentWeight}
              weightDelta={weightData.deltaKg}
              calorieTarget={goals.calories}
              proteinTarget={goals.protein}
              stepGoal={stepGoal}
              waterGoal={waterGoal}
            />

            {/* Goal Progress Section */}
            <GoalProgressCard
              goal={currentGoal}
              calorieTarget={goals.calories}
              averageCalories={nutritionData.summary.averageCalories}
              consistencyPercent={nutritionData.summary.consistencyPercent}
              daysLogged={nutritionData.summary.daysLogged}
              totalDays={daysCount}
              deficitOrSurplus={deficitOrSurplus}
            />

            {/* 1. Calorie Consistency Chart */}
            <CalorieConsistencyChart
              points={nutritionData.points}
              targetCalories={goals.calories}
              averageCalories={nutritionData.summary.averageCalories}
              trend={nutritionData.trend}
            />

            {/* 2. Macronutrient Progress */}
            <MacroProgressCard summary={nutritionData.summary} goals={goals} />

            {/* 3. Steps & Activity Chart */}
            <ActivityProgressChart
              points={activityData.points}
              stepGoal={stepGoal}
              averageSteps={activityData.average}
              trend={activityData.trend}
            />

            {/* 4. Water & Hydration Chart */}
            <WaterProgressChart
              points={waterData.points}
              waterGoal={waterGoal}
              averageWater={waterData.average}
              trend={waterData.trend}
            />

            {/* 5. Weight Progression Chart */}
            <WeightProgressChart
              entries={weightData.entries}
              currentWeight={currentWeight}
              deltaKg={weightData.deltaKg}
              trend={weightData.trend}
              minWeight={weightData.minWeight}
              maxWeight={weightData.maxWeight}
            />

            {/* Prominent Update Goals Call To Action */}
            <UpdateGoalsButton />
          </>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 2: HISTORY VIEW */}
        {/* ------------------------------------------------------------------- */}
        {viewTab === "history" && (
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
                <Ionicons
                  name="barbell-outline"
                  size={32}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyHistoryTitle}>No past workouts</Text>
                <Text style={styles.emptyHistorySub}>
                  When you complete workouts in the Workout tab, they will appear
                  here with full sets, weights, and editing options.
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
                <Text style={styles.sectionHeading}>
                  Daily Activity & Water Log
                </Text>
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
                          {daySteps > 0
                            ? `${daySteps.toLocaleString()}`
                            : "0"}{" "}
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
        )}
      </ScrollView>

      {/* Edit Workout Modal */}
      <EditWorkoutModal
        visible={!!editingWorkout}
        session={editingWorkout}
        onClose={() => setEditingWorkout(null)}
        onSave={async (updated) => {
          await updateSession(updated);
        }}
      />
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
