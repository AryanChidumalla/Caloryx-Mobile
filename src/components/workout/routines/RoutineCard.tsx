import { colors } from "@/styles/global";
import { WorkoutRoutine } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RoutineCardProps = {
  routine: WorkoutRoutine;
  onStart: () => void;
  onDelete?: () => void;
};

export default function RoutineCard({
  routine,
  onStart,
  onDelete,
}: RoutineCardProps) {
  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  const handleOptions = () => {
    if (!onDelete) return;
    Alert.alert("Routine Options", `Manage "${routine.name}"`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Routine",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  const previewExercises = routine.exercises
    .slice(0, 3)
    .map((e) => e.exerciseName)
    .join(" • ");

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.routineName}>{routine.name}</Text>
          {routine.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {routine.description}
            </Text>
          ) : null}
        </View>

        {routine.isCustom && onDelete && (
          <TouchableOpacity
            style={styles.optionsBtn}
            onPress={handleOptions}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Exercises preview */}
      <View style={styles.previewContainer}>
        <Ionicons name="barbell-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.previewText} numberOfLines={1}>
          {previewExercises || "No exercises added yet"}
          {routine.exercises.length > 3 ? "..." : ""}
        </Text>
      </View>

      {/* Footer / Start button */}
      <View style={styles.footer}>
        <View style={styles.statsBadge}>
          <Text style={styles.statsText}>
            {routine.exercises.length}{" "}
            {routine.exercises.length === 1 ? "exercise" : "exercises"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          activeOpacity={0.7}
        >
          <Ionicons name="play" size={14} color="#0A0A0A" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  routineName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  optionsBtn: {
    padding: 4,
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 14,
  },
  previewText: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statsText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.background,
  },
});
