import ScreenHeader from "@/components/common/ScreenHeader";
import RoutineCard from "@/components/workout/routines/RoutineCard";
import { useWorkout } from "@/context/WorkoutContext";
import { colors, globalStyles } from "@/styles/global";
import { WorkoutRoutine } from "@/types/workout";
import { formatWorkoutTimer } from "@/utils/workoutCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    routines,
    activeWorkout,
    activeDurationSeconds,
    startRoutine,
    startEmptyWorkout,
    deleteRoutine,
  } = useWorkout();

  // Routine search & filters
  const [routineSearch] = useState("");
  const [routineCategory] = useState("all");

  const handleStartRoutine = (routine: WorkoutRoutine) => {
    startRoutine(routine);
    router.push("/workout/active");
  };

  const handleStartBlank = () => {
    startEmptyWorkout("Quick Workout");
    router.push("/workout/active");
  };

  // Filtered routines
  const filteredRoutines = useMemo(() => {
    return routines.filter((r) => {
      const matchSearch =
        !routineSearch.trim() ||
        r.name.toLowerCase().includes(routineSearch.toLowerCase().trim());

      let matchCat = true;
      if (routineCategory === "custom") {
        matchCat = Boolean(r.isCustom);
      } else if (routineCategory !== "all") {
        matchCat =
          r.name.toLowerCase().includes(routineCategory) ||
          r.exercises.some((e) =>
            e.category?.toLowerCase().includes(routineCategory),
          );
      }

      return matchSearch && matchCat;
    });
  }, [routines, routineSearch, routineCategory]);

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Screen Header */}
      <ScreenHeader
        title="Workout"
        subtitle="Routines, active tracking & history"
        rightAction={
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => router.push("/workout/routines/create")}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={colors.text} />
            <Text style={styles.headerActionText}>New Routine</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Empty Workout Banner */}
        {activeWorkout ? (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/workout/active");
            }}
            activeOpacity={0.8}
          >
            <View style={styles.activeBannerLeft}>
              <View style={styles.activeBannerIconWrap}>
                <Ionicons name="fitness" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.activeBannerTextWrap}>
                <View style={styles.activeStatusRow}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.activeStatusBadge}>IN PROGRESS</Text>
                </View>
                <Text style={styles.activeBannerTitle} numberOfLines={1}>
                  {activeWorkout.name}
                </Text>
                <Text style={styles.activeBannerSub}>
                  {activeWorkout.exercises.length}{" "}
                  {activeWorkout.exercises.length === 1
                    ? "exercise"
                    : "exercises"}{" "}
                  • Tap to resume
                </Text>
              </View>
            </View>
            <View style={styles.bannerTimer}>
              <Ionicons name="time-outline" size={13} color="#FFFFFF" />
              <Text style={styles.bannerTimerText}>
                {formatWorkoutTimer(activeDurationSeconds)}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.quickStartCard}
            onPress={handleStartBlank}
            activeOpacity={0.7}
          >
            <View style={styles.quickStartLeft}>
              <View style={styles.quickStartIcon}>
                <Ionicons name="flash" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.quickStartTitle}>Start Empty Workout</Text>
                <Text style={styles.quickStartSub}>
                  Log exercises freely without a routine
                </Text>
              </View>
            </View>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Routines List Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {filteredRoutines.length > 0
              ? `My Routines (${filteredRoutines.length})`
              : "Routines"}
          </Text>
        </View>

        {filteredRoutines.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="layers-outline"
              size={32}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>No routines found</Text>
          </View>
        ) : (
          filteredRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onStart={() => handleStartRoutine(routine)}
              onDelete={() => deleteRoutine(routine.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  headerActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  activeBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  activeBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activeBannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBannerTextWrap: {
    flex: 1,
  },
  activeStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
  },
  activeStatusBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#34D399",
    letterSpacing: 0.8,
  },
  activeBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  activeBannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bannerTimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerTimerText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  quickStartCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 16,
  },
  quickStartLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  quickStartIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  quickStartTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  quickStartSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.2,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});
