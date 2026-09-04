import CalorieOverview from "@/components/dashboard/CalorieOverview";
import DashboardWorkoutCard from "@/components/dashboard/DashboardWorkoutCard";
import DateNavigator from "@/components/dashboard/DateNavigator";
import EditWorkoutModal from "@/components/dashboard/EditWorkoutModal";
import GoalSettingsModal from "@/components/dashboard/GoalSettingsModal";
import HomeHeader from "@/components/dashboard/HomeHeader";
import MacroProgressBars from "@/components/dashboard/MacroProgressBars";
import StepsTrackerCard from "@/components/dashboard/StepsTrackerCard";
import WaterTrackerCard from "@/components/dashboard/WaterTrackerCard";
import { useAuth } from "@/context/AuthContext";
import { useNutrition } from "@/context/NutritionContext";
import { useWorkout } from "@/context/WorkoutContext";
import { colors, globalStyles } from "@/styles/global";
import { WorkoutSession } from "@/types/workout";
import { isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { profile, user, mode } = useAuth();
  const { selectedDate, goToToday, refreshAll, isLoading } = useNutrition();
  const { updateSession, refreshWorkouts } = useWorkout();

  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [editingWorkoutSession, setEditingWorkoutSession] =
    useState<WorkoutSession | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAll(), refreshWorkouts()]);
    setRefreshing(false);
  };

  const displayName =
    profile?.username ||
    user?.email?.split("@")[0] ||
    (mode === "guest" ? "Guest" : "there");

  const isCurrentDateToday = isToday(selectedDate);

  return (
    <View
      style={[
        globalStyles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header with App Branding and Profile Avatar */}
        <HomeHeader />

        {/* Date Navigator */}
        <DateNavigator />

        {/* User Greeting & Date Bar */}
        <View style={styles.greetingBar}>
          <Text style={styles.greetingText}>Hello, {displayName}</Text>

          {!isCurrentDateToday && (
            <TouchableOpacity style={styles.jumpTodayBtn} onPress={goToToday}>
              <Ionicons name="today-outline" size={13} color={colors.primary} />
              <Text style={styles.jumpTodayText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 1. Nutrition & Calories Summary */}
        <CalorieOverview onOpenGoals={() => setGoalsModalVisible(true)} />

        {/* 2. Macro Nutrients Breakdown */}
        <MacroProgressBars />

        {/* 3. Workout Section Widget (Date Synchronized) */}
        <DashboardWorkoutCard
          date={selectedDate}
          onEditWorkout={(session) => setEditingWorkoutSession(session)}
        />

        {/* 4. Water Tracker Card (Date Synchronized) */}
        <WaterTrackerCard date={selectedDate} />

        {/* 5. Steps Tracker Card (Date Synchronized) */}
        <StepsTrackerCard date={selectedDate} />
      </ScrollView>

      {/* Goal Settings Modal */}
      <GoalSettingsModal
        visible={goalsModalVisible}
        onClose={() => setGoalsModalVisible(false)}
      />

      {/* Edit Completed Workout Modal */}
      <EditWorkoutModal
        visible={!!editingWorkoutSession}
        session={editingWorkoutSession}
        onClose={() => setEditingWorkoutSession(null)}
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
  greetingBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.3,
  },
  jumpTodayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  jumpTodayText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
