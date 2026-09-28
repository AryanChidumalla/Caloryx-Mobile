import { colors } from "@/styles/global";
import { RoutineExercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export type RoutineExerciseDraft = Omit<RoutineExercise, "id" | "routineId">;

export type RoutineExerciseItemProps = {
  exercise: RoutineExerciseDraft;
  index: number;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<RoutineExerciseDraft>) => void;
};

export default function RoutineExerciseItem({
  exercise,
  index,
  onRemove,
  onUpdate,
}: RoutineExerciseItemProps) {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exTopRow}>
        <View style={styles.exTitleContainer}>
          <Text style={styles.exNumber}>{index + 1}.</Text>
          <Text style={styles.exName}>{exercise.exerciseName}</Text>
        </View>

        <TouchableOpacity
          onPress={() => onRemove(index)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle-outline" size={20} color={colors.alert} />
        </TouchableOpacity>
      </View>

      <View style={styles.exConfigRow}>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Sets</Text>
          <TextInput
            style={styles.configInput}
            keyboardType="numeric"
            value={String(exercise.targetSets || 3)}
            onChangeText={(val) => {
              const num = parseInt(val, 10);
              onUpdate(index, {
                targetSets: isNaN(num) ? 1 : num,
              });
            }}
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Target Reps</Text>
          <TextInput
            style={styles.configInput}
            placeholder="10"
            placeholderTextColor={colors.textMuted}
            value={exercise.targetReps || "10"}
            onChangeText={(val) =>
              onUpdate(index, {
                targetReps: val,
              })
            }
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Default Wt (kg)</Text>
          <TextInput
            style={styles.configInput}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            value={
              exercise.targetWeightKg && exercise.targetWeightKg > 0
                ? String(exercise.targetWeightKg)
                : ""
            }
            onChangeText={(val) => {
              const num = parseFloat(val);
              onUpdate(index, {
                targetWeightKg: isNaN(num) ? 0 : num,
              });
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 14,
    gap: 12,
  },
  exTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  exNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  exName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  exConfigRow: {
    flexDirection: "row",
    gap: 10,
  },
  configItem: {
    flex: 1,
  },
  configLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  configInput: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
});
