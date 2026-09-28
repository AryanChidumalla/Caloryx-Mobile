import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";

const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";

export default function ExerciseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { exercises } = useWorkout();

  const exercise = exercises.find((ex) => ex.id === id);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  const mediaUrl =
    (exercise.gifUrl ? `${GITHUB_BASE_URL}${exercise.gifUrl}` : null) ||
    (exercise.image ? `${GITHUB_BASE_URL}${exercise.image}` : null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Exercise</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Name */}
        <Text style={styles.exerciseName}>{exercise.name}</Text>

        {/* Target and Equipment Details */}
        <View style={styles.section}>
          <View style={styles.muscleRow}>
            <Text style={styles.muscleLabel}>Target</Text>
            <Text style={styles.muscleValue}>{exercise.target || "—"}</Text>
          </View>

          {Boolean(
            exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0,
          ) && (
            <View style={styles.muscleRow}>
              <Text style={styles.muscleLabel}>Secondary</Text>
              <Text style={styles.muscleValue}>
                {exercise.secondaryMuscles?.join(", ")}
              </Text>
            </View>
          )}

          <View style={styles.muscleRow}>
            <Text style={styles.muscleLabel}>Equipment</Text>
            <Text style={styles.muscleValue}>{exercise.equipment || "-"}</Text>
          </View>
        </View>

        {/* Video or Image */}
        {mediaUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Perform</Text>

            <Image
              source={{ uri: mediaUrl }}
              style={styles.gif}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>

          {exercise.instructionSteps?.length ? (
            exercise.instructionSteps.map((step: string, index: number) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}.</Text>
                </View>

                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.instructions}>
              {exercise.instructions || "No instructions available."}
            </Text>
          )}
        </View>

        {/* Attribution */}
        {exercise.attribution && (
          <Text style={styles.attribution}>{exercise.attribution}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  headerSpacer: {
    width: 38,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  exerciseImage: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },

  exerciseName: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.text,
    marginTop: 18,
    textTransform: "capitalize",
  },

  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },

  infoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
    marginTop: 5,
    textTransform: "capitalize",
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 12,
  },

  muscleRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 13,
    marginBottom: 8,
  },

  muscleLabel: {
    width: 90,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
  },

  muscleValue: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  gif: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },

  stepRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  stepNumber: {
    // width: 28,
    // height: 28,
    // borderRadius: 8,
    // backgroundColor: colors.primary,
    // justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  stepNumberText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },

  stepText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
  },

  instructions: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  attribution: {
    marginTop: 28,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
  },

  errorText: {
    color: colors.text,
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
  },
});
