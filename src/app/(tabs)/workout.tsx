import ActiveWorkoutModal from "@/components/workout/active/ActiveWorkoutModal";
import EditWorkoutModal from "@/components/workout/history/EditWorkoutModal";
import CreateRoutineModal from "@/components/workout/routines/CreateRoutineModal";
import RoutineCard from "@/components/workout/routines/RoutineCard";
import { useWorkout } from "@/context/WorkoutContext";
import { colors, globalStyles } from "@/styles/global";
import { WorkoutRoutine, WorkoutSession } from "@/types/workout";
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

type ActiveTab = "routines" | "history" | "exercises";

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
    updateSession,
  } = useWorkout();

  const [activeModalVisible, setActiveModalVisible] = useState(false);
  const [createRoutineVisible, setCreateRoutineVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(
    null,
  );

  // Routine search & filters
  const [routineSearch] = useState("");
  const [routineCategory] = useState("all");

  // const handleStartRoutine = (routine: WorkoutRoutine) => {
  //   startRoutine(routine);
  //   setActiveModalVisible(true);
  // };
  const handleStartRoutine = (routine: WorkoutRoutine) => {
    startRoutine(routine);
    router.push("/workout/active");
  };

  // const handleStartBlank = () => {
  //   startEmptyWorkout("Quick Workout");
  //   setActiveModalVisible(true);
  // };

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
      <View style={styles.header}>
        <View>
          <Text style={globalStyles.title}>Workout</Text>
          <Text style={styles.headerSub}>
            Routines, active tracking & history
          </Text>
        </View>
      </View>

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
            // onPress={() => {
            //   Haptics.selectionAsync();
            //   setActiveModalVisible(true);
            // }}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/workout/active");
            }}
            activeOpacity={0.8}
          >
            <View style={styles.activeBannerLeft}>
              <View>
                <Text style={styles.activeBannerTitle} numberOfLines={1}>
                  {activeWorkout.name}
                </Text>
                <Text style={styles.activeBannerSub}>
                  {activeWorkout.exercises.length} exercises • Tap to open
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
              <View>
                <Text style={styles.quickStartTitle}>Start Empty Workout</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.text} />
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

        <TouchableOpacity
          style={styles.newRoutineBtn}
          // onPress={() => setCreateRoutineVisible(true)}
          onPress={() => router.push("/workout/routines/create")}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={colors.text} />
          <Text style={styles.newRoutineText}>New Routine</Text>
        </TouchableOpacity>

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

      {/* Modals */}
      <ActiveWorkoutModal
        visible={activeModalVisible}
        onClose={() => setActiveModalVisible(false)}
      />

      <CreateRoutineModal
        visible={createRoutineVisible}
        onClose={() => setCreateRoutineVisible(false)}
      />

      <EditWorkoutModal
        visible={!!editingSession}
        session={editingSession}
        onClose={() => setEditingSession(null)}
        onSave={async (updated) => {
          await updateSession(updated);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 14,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  newRoutineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 8,
  },
  newRoutineText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  activeBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  activeBannerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  activeBannerSub: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
  },
  bannerTimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bannerTimerText: {
    fontSize: 12,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  quickStartCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 14,
  },
  quickStartLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickStartTitle: {
    fontSize: 16,
    color: colors.text,
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
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
