import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { Exercise, RoutineExercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ExerciseSelectorModal from "./ExerciseSelectorModal";

type CreateRoutineModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function CreateRoutineModal({
  visible,
  onClose,
}: CreateRoutineModalProps) {
  const { createRoutine } = useWorkout();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState<
    Omit<RoutineExercise, "id" | "routineId">[]
  >([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleAddExercise = (selected: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: selected.id,
        exerciseName: selected.name,
        category: selected.category,
        orderIndex: prev.length,
        targetSets: 3,
        targetReps: "10",
        targetWeightKg: 0,
      },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((ex, idx) => ({ ...ex, orderIndex: idx })),
    );
  };

  const handleUpdateExercise = (
    index: number,
    updates: Partial<Omit<RoutineExercise, "id" | "routineId">>,
  ) => {
    setExercises((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], ...updates };
      }
      return copy;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Routine Name", "Please enter a name for your routine.");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert(
        "Add Exercises",
        "Please add at least one exercise to your routine.",
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const routineExercises: RoutineExercise[] = exercises.map((ex, idx) => ({
      ...ex,
      id: `re-${Date.now()}-${idx}`,
      orderIndex: idx,
    }));

    await createRoutine({
      name: name.trim(),
      description: description.trim() || undefined,
      exercises: routineExercises,
    });

    // Reset & close
    setName("");
    setDescription("");
    setExercises([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Routine</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Routine Info */}
          <View style={styles.section}>
            <Text style={styles.label}>ROUTINE NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Upper Body Power"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Focus on chest & heavy compound rows"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Exercises */}
          <View style={styles.exercisesSection}>
            <View style={styles.exercisesHeader}>
              <Text style={styles.label}>EXERCISES ({exercises.length})</Text>
              <TouchableOpacity
                style={styles.addExerciseBtn}
                onPress={() => setIsSelectorOpen(true)}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>

            {exercises.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="barbell-outline"
                  size={32}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No exercises added yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add exercises from the library and configure default sets & reps.
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => setIsSelectorOpen(true)}
                >
                  <Text style={styles.emptyAddBtnText}>Select Exercises</Text>
                </TouchableOpacity>
              </View>
            ) : (
              exercises.map((ex, idx) => (
                <View key={`${ex.exerciseName}-${idx}`} style={styles.exerciseCard}>
                  <View style={styles.exTopRow}>
                    <View style={styles.exTitleContainer}>
                      <Text style={styles.exNumber}>{idx + 1}.</Text>
                      <Text style={styles.exName}>{ex.exerciseName}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveExercise(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color={colors.alert}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.exConfigRow}>
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>Sets</Text>
                      <TextInput
                        style={styles.configInput}
                        keyboardType="numeric"
                        value={String(ex.targetSets || 3)}
                        onChangeText={(val) => {
                          const num = parseInt(val);
                          handleUpdateExercise(idx, {
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
                        value={ex.targetReps || "10"}
                        onChangeText={(val) =>
                          handleUpdateExercise(idx, { targetReps: val })
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
                          ex.targetWeightKg && ex.targetWeightKg > 0
                            ? String(ex.targetWeightKg)
                            : ""
                        }
                        onChangeText={(val) => {
                          const num = parseFloat(val);
                          handleUpdateExercise(idx, {
                            targetWeightKg: isNaN(num) ? 0 : num,
                          });
                        }}
                      />
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <ExerciseSelectorModal
          visible={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          onSelectExercise={handleAddExercise}
          title="Add to Routine"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  saveText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  exercisesSection: {
    gap: 10,
    marginTop: 6,
  },
  exercisesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addExerciseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addExerciseText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyAddBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
  },
  emptyAddBtnText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "800",
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
    gap: 10,
  },
  exTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  exNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  exName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  exConfigRow: {
    flexDirection: "row",
    gap: 10,
  },
  configItem: {
    flex: 1,
    gap: 4,
  },
  configLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
  },
  configInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
