import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { Exercise } from "@/types/workout";
import { formatWorkoutTimer } from "@/utils/workoutCalculations";

import ExerciseCard from "@/components/workout/exercises/ExerciseCard";

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

  const handleFinish = () => {
    Alert.alert(
      "Finish Workout",
      "Are you sure you want to finish this workout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
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
        {
          text: "Keep Workout",
          style: "cancel",
        },
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancel}
          disabled={isFinishing}
        >
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.workoutTitle}>{activeWorkout.name}</Text>

          <Text style={styles.timer}>
            {formatWorkoutTimer(activeDurationSeconds)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          disabled={isFinishing}
        >
          {isFinishing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.finishText}>Finish</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Workout Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={isActivePaused ? resumeWorkout : pauseWorkout}
        >
          <Ionicons
            name={isActivePaused ? "play" : "pause"}
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.pauseText}>
            {isActivePaused ? "Resume" : "Pause"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.exerciseCount}>
          {activeWorkout.exercises.length}{" "}
          {activeWorkout.exercises.length === 1 ? "Exercise" : "Exercises"}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeWorkout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={index}
            // key={`${exercise.exercise.id}-${index}`}
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

        {/* Add Exercise */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => {
            router.push("/workout/selector");
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={colors.primary}
          />

          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
  },

  headerButton: {
    minWidth: 70,
  },

  discardText: {
    color: "#FF6B6B",
    fontSize: 15,
    fontWeight: "600",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  workoutTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  timer: {
    color: "#A0A0A0",
    fontSize: 13,
    marginTop: 2,
  },

  finishButton: {
    minWidth: 70,
    alignItems: "flex-end",
  },

  finishText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
  },

  pauseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1C1C1C",
  },

  pauseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  exerciseCount: {
    color: "#8F8F8F",
    fontSize: 14,
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
    paddingVertical: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
  },

  addExerciseText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  bottomSpacing: {
    height: 40,
  },
});
