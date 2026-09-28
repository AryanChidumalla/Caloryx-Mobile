import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import DashboardWorkoutCard from "@/components/dashboard/DashboardWorkoutCard";
import DateNavigator from "@/components/dashboard/DateNavigator";
import NutritionOverview from "@/components/dashboard/NutritionOverview";
import SleepTrackerCard from "@/components/dashboard/SleepTrackerCard";
import StepsTrackerCard from "@/components/dashboard/StepsTrackerCard";
import WaterTrackerCard from "@/components/dashboard/WaterTrackerCard";
import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
import { useNutrition } from "@/context/NutritionContext";
import { useWorkout } from "@/context/WorkoutContext";
import { colors, globalStyles } from "@/styles/global";
import { useRouter } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, user, mode } = useAuth();
  const { selectedDate, goToToday, refreshAll, isLoading } = useNutrition();
  const { refreshWorkouts } = useWorkout();
  const { refreshHealth } = useHealth();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAll(), refreshWorkouts(), refreshHealth()]);
    setRefreshing(false);
  };

  const displayName =
    profile?.username ||
    user?.email?.split("@")[0] ||
    (mode === "guest" ? "Guest" : "there");

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
        <DashboardGreeting
          displayName={displayName}
          selectedDate={selectedDate}
          goToToday={goToToday}
        />

        <DateNavigator />

        {/* Primary dashboard metric */}
        <StepsTrackerCard date={selectedDate} />

        {/* Secondary health metric */}
        <NutritionOverview />

        {/* Activity details */}
        <DashboardWorkoutCard
          date={selectedDate}
          onEditWorkout={(session) =>
            router.push({
              pathname: "/workout/edit/[id]",
              params: { id: session.id },
            })
          }
        />

        {/* Hydration */}
        <WaterTrackerCard date={selectedDate} />

        {/* Sleep & Recovery */}
        <SleepTrackerCard date={selectedDate} />
      </ScrollView>
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
