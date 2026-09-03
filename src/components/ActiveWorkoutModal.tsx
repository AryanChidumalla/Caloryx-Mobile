import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { Exercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ExerciseCard from "./ExerciseCard";
import ExerciseSelectorModal from "./ExerciseSelectorModal";

type ActiveWorkoutModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ActiveWorkoutModal({
  visible,
  onClose,
}: ActiveWorkoutModalProps) {
  const {
    activeWorkout,
    activeDurationSeconds,
    isActivePaused,
    pauseWorkout,
    resumeWorkout,
    cancelWorkout,
    finishWorkout,
    addExerciseToActive,
    removeExerciseFromActive,
    replaceExerciseInActive,
    reorderActiveExercises,
    updateExerciseNotes,
    addSetToExercise,
    removeSetFromExercise,
    updateSet,
    toggleSetCompleted,
  } = useWorkout();

  const [isFinishing, setIsFinishing] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  if (!activeWorkout) {
    return null;
  }

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleFinish = async () => {
    const completedCount = activeWorkout.exercises.reduce(
      (total, ex) => total + ex.sets.filter((s) => s.completed).length,
      0,
    );

    Alert.alert(
      "Finish Workout",
      `Are you ready to complete "${activeWorkout.name}"? (${completedCount} sets checked off)`,
      [
        { text: "Keep Training", style: "cancel" },
        {
          text: "Finish & Save",
          style: "default",
          onPress: async () => {
            setIsFinishing(true);
            try {
              await finishWorkout();
              onClose();
            } finally {
              setIsFinishing(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Discard Workout",
      "Are you sure you want to discard this active workout? This action cannot be undone.",
      [
        { text: "Continue Workout", style: "cancel" },
        {
          text: "Discard Workout",
          style: "destructive",
          onPress: () => {
            cancelWorkout();
            onClose();
          },
        },
      ],
    );
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (replacingIndex !== null) {
      replaceExerciseInActive(replacingIndex, exercise);
      setReplacingIndex(null);
    } else {
      addExerciseToActive(exercise);
    }
    setSelectorVisible(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.cancelText}>Discard</Text>
          </TouchableOpacity>

          <View style={styles.timerContainer}>
            <TouchableOpacity
              style={styles.pauseToggle}
              onPress={() => {
                Haptics.selectionAsync();
                if (isActivePaused) resumeWorkout();
                else pauseWorkout();
              }}
            >
              <Ionicons
                name={isActivePaused ? "play" : "pause"}
                size={14}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.timerText,
                isActivePaused && styles.timerTextPaused,
              ]}
            >
              {formatTimer(activeDurationSeconds)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.finishButton, isFinishing && styles.buttonDisabled]}
            onPress={handleFinish}
            disabled={isFinishing}
            activeOpacity={0.7}
          >
            {isFinishing ? (
              <ActivityIndicator size="small" color="#0A0A0A" />
            ) : (
              <Text style={styles.finishText}>Finish</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Workout Title & Minimize Bar */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.workoutTitle} numberOfLines={1}>
              {activeWorkout.name}
            </Text>
            <Text style={styles.exerciseCounter}>
              {activeWorkout.exercises.length}{" "}
              {activeWorkout.exercises.length === 1 ? "exercise" : "exercises"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.minimizeBtn}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Exercises Scroll List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeWorkout.exercises.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="barbell-outline"
                size={36}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No exercises in workout</Text>
              <Text style={styles.emptySub}>
                Tap below to choose exercises from the library.
              </Text>
            </View>
          ) : (
            activeWorkout.exercises.map((ex, exIdx) => (
              <ExerciseCard
                key={ex.id || `active-ex-${exIdx}`}
                exercise={ex}
                exerciseIndex={exIdx}
                totalExercises={activeWorkout.exercises.length}
                onAddSet={() => addSetToExercise(exIdx)}
                onRemoveSet={(sIdx) => removeSetFromExercise(exIdx, sIdx)}
                onUpdateSet={(sIdx, updates) => updateSet(exIdx, sIdx, updates)}
                onToggleSetCompleted={(sIdx) => toggleSetCompleted(exIdx, sIdx)}
                onRemoveExercise={() => removeExerciseFromActive(exIdx)}
                onReplaceExercise={() => {
                  setReplacingIndex(exIdx);
                  setSelectorVisible(true);
                }}
                onMoveUp={() => reorderActiveExercises(exIdx, exIdx - 1)}
                onMoveDown={() => reorderActiveExercises(exIdx, exIdx + 1)}
                onUpdateNotes={(notes) => updateExerciseNotes(exIdx, notes)}
              />
            ))
          )}

          {/* Add Exercise Action */}
          <TouchableOpacity
            style={styles.addExerciseBtn}
            onPress={() => {
              setReplacingIndex(null);
              setSelectorVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </ScrollView>

        <ExerciseSelectorModal
          visible={selectorVisible}
          onClose={() => {
            setSelectorVisible(false);
            setReplacingIndex(null);
          }}
          onSelectExercise={handleSelectExercise}
          title={replacingIndex !== null ? "Replace Exercise" : "Add Exercise"}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cancelText: {
    color: colors.alert,
    fontSize: 14,
    fontWeight: "700",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pauseToggle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  timerTextPaused: {
    color: colors.warning,
  },
  finishButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  finishText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.background,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },
  exerciseCounter: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },
  minimizeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: "dashed",
    padding: 32,
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  addExerciseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
});
