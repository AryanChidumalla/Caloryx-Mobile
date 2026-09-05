import {
  ProfileHeader,
  ProfileHistory,
  ProfileOverview,
  ProfileProgress,
} from "@/components/profile";
import EditWorkoutModal from "@/components/workout/history/EditWorkoutModal";
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
import { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ProfileViewTab = "overview" | "progress" | "history";

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

  const [viewTab, setViewTab] = useState<ProfileViewTab>("overview");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [refreshing, setRefreshing] = useState(false);

  const [guestGoal, setGuestGoal] = useState<PrimaryGoal>("maintain");
  const [guestDeficit, setGuestDeficit] = useState(400);

  const [editingWorkout, setEditingWorkout] = useState<WorkoutSession | null>(
    null,
  );

  const isGuest = mode === "guest";

  useEffect(() => {
    async function loadGuestData() {
      if (!isGuest) return;

      const guestData = await getGuestProfile();

      if (guestData?.goal) {
        setGuestGoal(guestData.goal);
      }

      if (guestData?.calorieAdjustment) {
        setGuestDeficit(guestData.calorieAdjustment);
      }
    }

    loadGuestData();
  }, [isGuest]);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refreshAll(), refreshHealth(), refreshWorkouts()]);
    } finally {
      setRefreshing(false);
    }
  };

  const displayName =
    profile?.username ||
    session?.user?.email?.split("@")[0] ||
    (isGuest ? "Guest Athlete" : "Caloryx User");

  const subtitle = isGuest
    ? "Local offline tracking"
    : session?.user?.email || "Cloud Synced";

  const currentWeight = Number(profile?.weight) || 70;

  /*
   * Guest users have a locally stored primary goal.
   * Authenticated goal persistence is handled separately and
   * should be fixed in the profile/goals data layer.
   */
  const currentGoal: PrimaryGoal = isGuest
    ? guestGoal
    : (profile?.activity_level as PrimaryGoal) || "maintain";

  const deficitOrSurplus = isGuest ? guestDeficit : 400;

  const daysCount = getDaysCountForFilter(timeFilter);

  const dateList = useMemo(() => getDateRangeList(daysCount), [daysCount]);

  const nutritionData = useMemo(
    () => aggregateDailyNutrition(meals, dateList, goals.calories, timeFilter),
    [meals, dateList, goals.calories, timeFilter],
  );

  const stepsMap = useMemo(() => {
    const map: Record<string, number> = {};

    for (const date of dateList) {
      map[date] = activityHistory[date]?.stepCount ?? 0;
    }

    return map;
  }, [activityHistory, dateList]);

  const activityData = useMemo(
    () => aggregateDailyMetrics(stepsMap, dateList, stepGoal, timeFilter),
    [stepsMap, dateList, stepGoal, timeFilter],
  );

  const waterMap = useMemo(() => {
    const map: Record<string, number> = {};

    for (const date of dateList) {
      map[date] = waterHistory[date] ?? 0;
    }

    return map;
  }, [waterHistory, dateList]);

  const waterData = useMemo(
    () => aggregateDailyMetrics(waterMap, dateList, waterGoal, timeFilter),
    [waterMap, dateList, waterGoal, timeFilter],
  );

  const weightData = useMemo(
    () => aggregateWeightHistory(weightHistory, currentWeight, dateList),
    [weightHistory, currentWeight, dateList],
  );

  const recentDays = useMemo(() => getDateRangeList(14), []);

  const selectTab = (tab: ProfileViewTab) => {
    if (tab === viewTab) return;

    Haptics.selectionAsync();
    setViewTab(tab);
  };

  return (
    <View
      style={[
        globalStyles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <ProfileHeader
          displayName={displayName}
          subtitle={subtitle}
          isGuest={isGuest}
        />

        {/* Profile Section Navigation */}
        <View style={styles.viewSegment}>
          <TouchableOpacity
            style={[
              styles.viewSegmentBtn,
              viewTab === "overview" && styles.viewSegmentBtnActive,
            ]}
            onPress={() => selectTab("overview")}
            activeOpacity={0.75}
          >
            <Ionicons
              name="person-outline"
              size={15}
              color={
                viewTab === "overview"
                  ? colors.background
                  : colors.textSecondary
              }
            />

            <Text
              style={[
                styles.viewSegmentText,
                viewTab === "overview" && styles.viewSegmentTextActive,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewSegmentBtn,
              viewTab === "progress" && styles.viewSegmentBtnActive,
            ]}
            onPress={() => selectTab("progress")}
            activeOpacity={0.75}
          >
            <Ionicons
              name="analytics-outline"
              size={15}
              color={
                viewTab === "progress"
                  ? colors.background
                  : colors.textSecondary
              }
            />

            <Text
              style={[
                styles.viewSegmentText,
                viewTab === "progress" && styles.viewSegmentTextActive,
              ]}
            >
              Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewSegmentBtn,
              viewTab === "history" && styles.viewSegmentBtnActive,
            ]}
            onPress={() => selectTab("history")}
            activeOpacity={0.75}
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
              History
            </Text>
          </TouchableOpacity>
        </View>

        {viewTab === "overview" && (
          <ProfileOverview
            profile={profile}
            goals={goals}
            waterGoal={waterGoal}
            stepGoal={stepGoal}
          />
        )}

        {viewTab === "progress" && (
          <ProfileProgress
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            currentWeight={currentWeight}
            weightData={weightData}
            activityData={activityData}
            waterData={waterData}
            goals={goals}
            stepGoal={stepGoal}
            waterGoal={waterGoal}
            currentGoal={currentGoal}
            nutritionData={nutritionData}
            daysCount={daysCount}
            deficitOrSurplus={deficitOrSurplus}
          />
        )}

        {viewTab === "history" && (
          <ProfileHistory
            workoutSessions={workoutSessions}
            deleteSession={deleteSession}
            setEditingWorkout={setEditingWorkout}
            recentDays={recentDays}
            activityHistory={activityHistory}
            waterHistory={waterHistory}
            isToday={isToday}
            formatDateForDisplay={formatDateForDisplay}
            stepGoal={stepGoal}
            waterGoal={waterGoal}
          />
        )}
      </ScrollView>

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
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 3,
    marginBottom: 18,
    gap: 2,
  },

  viewSegmentBtn: {
    flex: 1,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 6,
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
});
