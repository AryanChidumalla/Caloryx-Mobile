import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";

export default function RoutineDetailsScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const { routines, startRoutine } = useWorkout();

  const routine = routines.find((item) => item.id === id);

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Routine</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.notFound}>
          <Ionicons name="barbell-outline" size={40} color={colors.textMuted} />

          <Text style={styles.notFoundTitle}>Routine not found</Text>

          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleStart = () => {
    startRoutine(routine);
    router.push("/workout/active");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Routine
        </Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            // We'll connect this later.
          }}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Routine Header */}
        <View style={styles.routineHeader}>
          <Text style={styles.routineName}>{routine.name}</Text>

          {routine.description ? (
            <Text style={styles.description}>{routine.description}</Text>
          ) : null}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons
                name="barbell-outline"
                size={15}
                color={colors.textSecondary}
              />

              <Text style={styles.metaText}>
                {routine.exercises.length}{" "}
                {routine.exercises.length === 1 ? "exercise" : "exercises"}
              </Text>
            </View>

            {routine.isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>Custom</Text>
              </View>
            )}
          </View>
        </View>

        {/* Exercise List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          {routine.exercises
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    {exercise.exerciseName}
                  </Text>

                  {exercise.category ? (
                    <Text style={styles.category}>{exercise.category}</Text>
                  ) : null}

                  <View style={styles.targetRow}>
                    <View style={styles.targetItem}>
                      <Text style={styles.targetLabel}>Sets</Text>

                      <Text style={styles.targetValue}>
                        {exercise.targetSets}
                      </Text>
                    </View>

                    <View style={styles.targetItem}>
                      <Text style={styles.targetLabel}>Reps</Text>

                      <Text style={styles.targetValue}>
                        {exercise.targetReps}
                      </Text>
                    </View>

                    {exercise.targetWeightKg !== undefined && (
                      <View style={styles.targetItem}>
                        <Text style={styles.targetLabel}>Weight</Text>

                        <Text style={styles.targetValue}>
                          {exercise.targetWeightKg} kg
                        </Text>
                      </View>
                    )}

                    {exercise.targetDurationSeconds !== undefined && (
                      <View style={styles.targetItem}>
                        <Text style={styles.targetLabel}>Duration</Text>

                        <Text style={styles.targetValue}>
                          {exercise.targetDurationSeconds}s
                        </Text>
                      </View>
                    )}
                  </View>

                  {exercise.notes ? (
                    <Text style={styles.notes}>{exercise.notes}</Text>
                  ) : null}
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Start Workout */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={18} color={colors.text} />

          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },

  headerSpacer: {
    width: 40,
  },

  editButton: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  routineHeader: {
    marginBottom: 28,
  },

  routineName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
  },

  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  customBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
  },

  customBadgeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },

  section: {
    gap: 10,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },

  exerciseCard: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },

  exerciseNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  exerciseNumberText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  category: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
    textTransform: "capitalize",
  },

  targetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
  },

  targetItem: {
    gap: 2,
  },

  targetLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },

  targetValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },

  notes: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },

  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.background,
  },

  startButton: {
    height: 48,
    borderRadius: 9,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  startButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  notFoundTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "700",
  },

  backHomeButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },

  backHomeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
