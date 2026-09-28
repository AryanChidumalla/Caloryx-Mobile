import ActiveWorkoutControls from "@/components/workout/active/ActiveWorkoutControls";
import ActiveWorkoutHeader from "@/components/workout/active/ActiveWorkoutHeader";
import ExerciseCard from "@/components/workout/exercises/ExerciseCard";
import MuscleDistributionModal from "@/components/workout/exercises/MuscleDistributionModal";
import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ActiveWorkoutScreen() {
  const router = useRouter();

  const {
    activeWorkout,
    activeDurationSeconds,
    isActivePaused,
    pauseWorkout,
    resumeWorkout,
    cancelWorkout,
    finishWorkout,
    removeExerciseFromActive,
    reorderActiveExercises,
    updateExerciseNotes,
    addSetToExercise,
    removeSetFromExercise,
    updateSet,
    toggleSetCompleted,
    updateActiveWorkoutName,
  } = useWorkout();

  const [isFinishing, setIsFinishing] = useState(false);
  const [musclesModalVisible, setMusclesModalVisible] = useState(false);

  if (!activeWorkout) {
    return null;
  }

  const handleFinish = () => {
    Alert.alert(
      "Finish Workout",
      "Are you sure you want to finish this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          onPress: async () => {
            try {
              setIsFinishing(true);
              await finishWorkout();
              router.back();
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
      "Are you sure you want to discard this workout?",
      [
        { text: "Keep Workout", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: async () => {
            await cancelWorkout();
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ActiveWorkoutHeader
        workoutName={activeWorkout.name}
        durationSeconds={activeDurationSeconds}
        isFinishing={isFinishing}
        onUpdateWorkoutName={updateActiveWorkoutName}
        onFinish={handleFinish}
        onCancel={handleCancel}
      />

      <ActiveWorkoutControls
        isPaused={isActivePaused}
        exerciseCount={activeWorkout.exercises.length}
        onResume={resumeWorkout}
        onPause={pauseWorkout}
        onOpenMuscles={() => setMusclesModalVisible(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeWorkout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={index}
            exercise={exercise}
            exerciseIndex={index}
            totalExercises={activeWorkout.exercises.length}
            onAddSet={() => addSetToExercise(index)}
            onRemoveSet={(setIndex) => removeSetFromExercise(index, setIndex)}
            onUpdateSet={(setIndex, updatedSet) =>
              updateSet(index, setIndex, updatedSet)
            }
            onToggleSetCompleted={(setIndex) =>
              toggleSetCompleted(index, setIndex)
            }
            onRemoveExercise={() => removeExerciseFromActive(index)}
            onReplaceExercise={() => {
              router.push({
                pathname: "/workout/selector",
                params: {
                  target: "active",
                  replacingIndex: index.toString(),
                },
              });
            }}
            onMoveUp={() => {
              if (index > 0) {
                reorderActiveExercises(index, index - 1);
              }
            }}
            onMoveDown={() => {
              if (index < activeWorkout.exercises.length - 1) {
                reorderActiveExercises(index, index + 1);
              }
            }}
            onUpdateNotes={(notes) => updateExerciseNotes(index, notes)}
          />
        ))}

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => {
            router.push({
              pathname: "/workout/selector",
              params: { target: "active" },
            });
          }}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.text} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <MuscleDistributionModal
        visible={musclesModalVisible}
        onClose={() => setMusclesModalVisible(false)}
        title={activeWorkout.name}
        exercisesList={activeWorkout.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          exerciseName: e.exerciseName,
          setsCount: e.sets.length,
        }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  addExerciseText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSpacing: {
    height: 40,
  },
});
