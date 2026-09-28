import ExerciseSelector from "@/components/workout/exercises/ExerciseSelector";
import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { Exercise } from "@/types/workout";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExerciseSelectorScreen() {
  const router = useRouter();

  const { target, replacingIndex } = useLocalSearchParams<{
    target?: "active" | "routine" | "edit";
    replacingIndex?: string;
  }>();

  const {
    addExerciseToActive,
    replaceExerciseInActive,
    setSelectedRoutineExercise,
    setSelectedExerciseForEdit,
  } = useWorkout();

  const handleSelectExercise = (exercise: Exercise) => {
    if (target === "routine") {
      setSelectedRoutineExercise(exercise);
    } else if (target === "edit") {
      setSelectedExerciseForEdit({
        exercise,
        replacingIndex:
          replacingIndex !== undefined && replacingIndex !== ""
            ? Number(replacingIndex)
            : null,
      });
    } else {
      // Default: active workout
      if (replacingIndex !== undefined && replacingIndex !== "") {
        replaceExerciseInActive(Number(replacingIndex), exercise);
      } else {
        addExerciseToActive(exercise);
      }
    }

    router.back();
  };

  const title =
    replacingIndex !== undefined && replacingIndex !== ""
      ? "Replace Exercise"
      : "Select Exercise";

  return (
    <SafeAreaView style={styles.container}>
      <ExerciseSelector
        title={title}
        onSelectExercise={handleSelectExercise}
        onClose={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
