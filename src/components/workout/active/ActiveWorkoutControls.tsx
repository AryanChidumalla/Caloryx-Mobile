import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ActiveWorkoutControlsProps = {
  isPaused: boolean;
  exerciseCount: number;
  onResume: () => void;
  onPause: () => void;
  onOpenMuscles?: () => void;
};

export default function ActiveWorkoutControls({
  isPaused,
  exerciseCount,
  onResume,
  onPause,
  onOpenMuscles,
}: ActiveWorkoutControlsProps) {
  return (
    <View style={styles.controls}>
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={isPaused ? onResume : onPause}
      >
        <Ionicons
          name={isPaused ? "play" : "pause"}
          size={18}
          color="#FFFFFF"
        />
        <Text style={styles.pauseText}>{isPaused ? "Resume" : "Pause"}</Text>
      </TouchableOpacity>

      <View style={styles.rightActions}>
        {onOpenMuscles && (
          <TouchableOpacity
            style={styles.musclesButton}
            onPress={onOpenMuscles}
            activeOpacity={0.75}
          >
            <Ionicons name="body-outline" size={14} color={colors.primary} />
            <Text style={styles.musclesText}>Muscles</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.exerciseCount}>
          {exerciseCount} {exerciseCount === 1 ? "Exercise" : "Exercises"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
  },
  pauseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pauseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseCount: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  musclesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  musclesText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
});
