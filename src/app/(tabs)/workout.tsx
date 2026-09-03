import ActiveWorkoutModal from "@/components/ActiveWorkoutModal";
import CreateRoutineModal from "@/components/CreateRoutineModal";
import EditWorkoutModal from "@/components/EditWorkoutModal";
import RoutineCard from "@/components/RoutineCard";
import WorkoutHistoryCard from "@/components/profile/history/WorkoutHistoryCard";
import { useWorkout } from "@/context/WorkoutContext";
import { colors, globalStyles } from "@/styles/global";
import { WorkoutRoutine, WorkoutSession } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ActiveTab = "routines" | "history" | "exercises";

const ROUTINE_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "push", label: "Push" },
  { key: "pull", label: "Pull" },
  { key: "legs", label: "Legs" },
  { key: "full_body", label: "Full Body" },
  { key: "custom", label: "Custom" },
];

const EXERCISE_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "chest", label: "Chest" },
  { key: "back", label: "Back" },
  { key: "legs", label: "Legs" },
  { key: "shoulders", label: "Shoulders" },
  { key: "arms", label: "Arms" },
  { key: "core", label: "Core" },
  { key: "cardio", label: "Cardio" },
];

const EQUIPMENT_FILTERS = [
  { key: "all", label: "All Equip" },
  { key: "barbell", label: "Barbell" },
  { key: "dumbbell", label: "Dumbbell" },
  { key: "cable", label: "Cable" },
  { key: "machine", label: "Machine" },
  { key: "bodyweight", label: "Bodyweight" },
];

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    routines,
    sessions,
    exercises,
    activeWorkout,
    activeDurationSeconds,
    startRoutine,
    startEmptyWorkout,
    deleteRoutine,
    deleteSession,
    updateSession,
  } = useWorkout();

  const [activeTab, setActiveTab] = useState<ActiveTab>("routines");
  const [activeModalVisible, setActiveModalVisible] = useState(false);
  const [createRoutineVisible, setCreateRoutineVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(
    null,
  );

  // Routine search & filters
  const [routineSearch, setRoutineSearch] = useState("");
  const [routineCategory, setRoutineCategory] = useState("all");

  // Exercise search & filters
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseCategory, setExerciseCategory] = useState("all");
  const [exerciseEquipment, setExerciseEquipment] = useState("all");

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleStartRoutine = (routine: WorkoutRoutine) => {
    startRoutine(routine);
    setActiveModalVisible(true);
  };

  const handleStartBlank = () => {
    startEmptyWorkout("Quick Workout");
    setActiveModalVisible(true);
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

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch =
        !exerciseSearch.trim() ||
        ex.name.toLowerCase().includes(exerciseSearch.toLowerCase().trim());

      const matchCat =
        exerciseCategory === "all" ||
        ex.category?.toLowerCase() === exerciseCategory;

      const matchEquip =
        exerciseEquipment === "all" ||
        ex.equipment?.toLowerCase() === exerciseEquipment;

      return matchSearch && matchCat && matchEquip;
    });
  }, [exercises, exerciseSearch, exerciseCategory, exerciseEquipment]);

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Active Workout Floating Bar */}
      {activeWorkout && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.activeBannerLeft}>
            <View style={styles.pulseDot} />
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
              {formatTimer(activeDurationSeconds)}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={globalStyles.title}>Workout</Text>
          <Text style={styles.headerSub}>
            Routines, active tracking & history
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newRoutineBtn}
          onPress={() => setCreateRoutineVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color="#0A0A0A" />
          <Text style={styles.newRoutineText}>New Routine</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Segment Selector */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === "routines" && styles.segmentBtnActive,
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab("routines");
          }}
        >
          <Ionicons
            name="layers-outline"
            size={14}
            color={
              activeTab === "routines"
                ? colors.background
                : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.segmentText,
              activeTab === "routines" && styles.segmentTextActive,
            ]}
          >
            Routines
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === "history" && styles.segmentBtnActive,
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab("history");
          }}
        >
          <Ionicons
            name="time-outline"
            size={14}
            color={
              activeTab === "history" ? colors.background : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.segmentText,
              activeTab === "history" && styles.segmentTextActive,
            ]}
          >
            History ({sessions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === "exercises" && styles.segmentBtnActive,
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab("exercises");
          }}
        >
          <Ionicons
            name="barbell-outline"
            size={14}
            color={
              activeTab === "exercises"
                ? colors.background
                : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.segmentText,
              activeTab === "exercises" && styles.segmentTextActive,
            ]}
          >
            Exercises
          </Text>
        </TouchableOpacity>
      </View>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: ROUTINES */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "routines" && (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Empty Workout Banner */}
          <TouchableOpacity
            style={styles.quickStartCard}
            onPress={handleStartBlank}
            activeOpacity={0.7}
          >
            <View style={styles.quickStartLeft}>
              <View style={styles.quickStartIcon}>
                <Ionicons name="flash" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.quickStartTitle}>Start Empty Workout</Text>
                <Text style={styles.quickStartSub}>
                  Log exercises and sets on the fly
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          {/* Search Routines Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search routines..."
              placeholderTextColor={colors.textMuted}
              value={routineSearch}
              onChangeText={setRoutineSearch}
            />
            {routineSearch.length > 0 && (
              <TouchableOpacity onPress={() => setRoutineSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Routine Categories Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {ROUTINE_CATEGORIES.map((cat) => {
              const active = routineCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setRoutineCategory(cat.key);
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Routines List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              My Routines ({filteredRoutines.length})
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
              <Text style={styles.emptySub}>
                Try adjusting your search or create a new custom routine.
              </Text>
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
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: HISTORY */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "history" && (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {sessions.length === 0 ? (
            <View style={styles.emptyHistoryBox}>
              <Ionicons
                name="time-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No past workouts yet</Text>
              <Text style={styles.emptySub}>
                Start a routine or empty workout above. Finished sessions will
                be logged here.
              </Text>
              <TouchableOpacity
                style={styles.startFirstBtn}
                onPress={() => {
                  setActiveTab("routines");
                  handleStartBlank();
                }}
              >
                <Text style={styles.startFirstBtnText}>
                  Start First Workout
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* History Stats Summary */}
              <View style={styles.historyStatsCard}>
                <View style={styles.historyStatCol}>
                  <Text style={styles.historyStatVal}>{sessions.length}</Text>
                  <Text style={styles.historyStatLabel}>WORKOUTS</Text>
                </View>
                <View style={styles.historyStatDivider} />
                <View style={styles.historyStatCol}>
                  <Text style={styles.historyStatVal}>
                    {Math.round(
                      sessions.reduce(
                        (sum, s) => sum + (s.durationSeconds || 0) / 60,
                        0,
                      ),
                    )}
                  </Text>
                  <Text style={styles.historyStatLabel}>MINUTES</Text>
                </View>
                <View style={styles.historyStatDivider} />
                <View style={styles.historyStatCol}>
                  <Text style={styles.historyStatVal}>
                    {Math.round(
                      sessions.reduce(
                        (sum, s) => sum + (s.totalVolumeKg || 0),
                        0,
                      ) / 1000,
                    )}
                    k
                  </Text>
                  <Text style={styles.historyStatLabel}>VOLUME (KG)</Text>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Completed Sessions</Text>
              </View>

              {sessions.map((session) => (
                <WorkoutHistoryCard
                  key={session.id}
                  session={session}
                  onDelete={deleteSession}
                  onEdit={(s) => setEditingSession(s)}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: EXERCISES */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "exercises" && (
        <View style={styles.flexOne}>
          {/* Exercise Search Input */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercise library..."
              placeholderTextColor={colors.textMuted}
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
            />
            {exerciseSearch.length > 0 && (
              <TouchableOpacity onPress={() => setExerciseSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Muscle Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {EXERCISE_CATEGORIES.map((cat) => {
              const active = exerciseCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setExerciseCategory(cat.key);
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Equipment Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.filterChipsRow,
              { marginTop: 4, marginBottom: 8 },
            ]}
          >
            {EQUIPMENT_FILTERS.map((eq) => {
              const active = exerciseEquipment === eq.key;
              return (
                <TouchableOpacity
                  key={eq.key}
                  style={[
                    styles.filterEquipChip,
                    active && styles.filterEquipChipActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setExerciseEquipment(eq.key);
                  }}
                >
                  <Text
                    style={[
                      styles.filterEquipText,
                      active && styles.filterEquipTextActive,
                    ]}
                  >
                    {eq.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Exercise List */}
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.exerciseListContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exCard}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push({
                    pathname: "/exercise/[id]",
                    params: { id: item.id },
                  });
                }}
                activeOpacity={0.7}
              >
                {item.image ? (
                  <Image
                    source={{
                      uri: `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${item.image}`,
                    }}
                    style={styles.exThumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.exThumbPlaceholder}>
                    <Ionicons
                      name="barbell-outline"
                      size={20}
                      color={colors.textMuted}
                    />
                  </View>
                )}

                <View style={styles.exCardContent}>
                  <Text style={styles.exCardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.exCardMeta}>
                    <Text style={styles.exCategory}>{item.category}</Text>
                    {item.equipment && (
                      <>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.exEquipment}>{item.equipment}</Text>
                      </>
                    )}
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Ionicons
                  name="barbell-outline"
                  size={32}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No exercises found</Text>
                <Text style={styles.emptySub}>
                  Try clearing your search or filters.
                </Text>
              </View>
            }
          />
        </View>
      )}

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
  flexOne: {
    flex: 1,
  },
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
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  newRoutineText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A0A0A",
  },
  activeBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  activeBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0A0A0A",
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0A0A0A",
  },
  activeBannerSub: {
    fontSize: 11,
    color: "rgba(10, 10, 10, 0.7)",
    fontWeight: "600",
  },
  bannerTimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bannerTimerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.background,
    fontWeight: "800",
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
    borderRadius: 16,
    padding: 14,
  },
  quickStartLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickStartIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  quickStartTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  quickStartSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  filterChipsRow: {
    paddingHorizontal: 16,
    gap: 6,
    marginTop: 8,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.background,
    fontWeight: "800",
  },
  filterEquipChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  filterEquipChipActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  filterEquipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  filterEquipTextActive: {
    color: colors.text,
    fontWeight: "700",
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 30,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  emptyHistoryBox: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 36,
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  startFirstBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  startFirstBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0A0A0A",
  },
  historyStatsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  historyStatCol: {
    alignItems: "center",
    flex: 1,
  },
  historyStatVal: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  historyStatLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  historyStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.surfaceBorder,
  },
  exerciseListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  exCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 10,
    gap: 12,
  },
  exThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  exThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  exCardContent: {
    flex: 1,
  },
  exCardName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  exCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  exCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },
  metaDot: {
    fontSize: 10,
    color: colors.textMuted,
  },
  exEquipment: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "capitalize",
  },
});
