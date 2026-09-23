import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { ExerciseSet, SessionExercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SetRow from "./SetRow";

const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";

type ExerciseCardProps = {
  exercise: SessionExercise;
  exerciseIndex: number;
  totalExercises: number;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, updates: Partial<ExerciseSet>) => void;
  onToggleSetCompleted: (setIndex: number) => void;
  onRemoveExercise: () => void;
  onReplaceExercise: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onUpdateNotes: (notes: string) => void;
};

export default function ExerciseCard({
  exercise,
  exerciseIndex,
  totalExercises,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSetCompleted,
  onRemoveExercise,
  onReplaceExercise,
  onMoveUp,
  onMoveDown,
  onUpdateNotes,
}: ExerciseCardProps) {
  const router = useRouter();
  const { exercises } = useWorkout();

  const [showNotes, setShowNotes] = useState(Boolean(exercise.notes));

  const exerciseInfo = exercise.exerciseId
    ? exercises.find((ex) => ex.id === exercise.exerciseId)
    : undefined;

  const isTimed =
    exercise.category === "cardio" ||
    exercise.exerciseName.toLowerCase().includes("plank");

  const handleOpenDetails = () => {
    if (!exercise.exerciseId) return;

    router.push({
      pathname: "/exercise/[id]",
      params: {
        id: exercise.exerciseId,
      },
    });
  };

  const handleConfirmRemove = () => {
    Alert.alert(
      "Remove Exercise",
      `Remove "${exercise.exerciseName}" from this workout?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: onRemoveExercise,
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.titleContainer}
          onPress={handleOpenDetails}
          activeOpacity={0.7}
          disabled={!exercise.exerciseId}
        >
          {exerciseInfo?.image ? (
            <Image
              source={{
                uri: `${GITHUB_BASE_URL}${exerciseInfo.image}`,
              }}
              style={styles.exerciseImage}
            />
          ) : (
            <View style={styles.exerciseImagePlaceholder}>
              <Ionicons
                name="barbell-outline"
                size={20}
                color={colors.textMuted}
              />
            </View>
          )}

          <View style={styles.titleText}>
            <Text style={styles.exerciseName} numberOfLines={2}>
              {exercise.exerciseName
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </Text>

            {exercise.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{exercise.category}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Action Controls */}
        <View style={styles.headerActions}>
          {onMoveUp && exerciseIndex > 0 && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onMoveUp}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Ionicons
                name="chevron-up"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}

          {onMoveDown && exerciseIndex < totalExercises - 1 && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onMoveDown}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onReplaceExercise}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons
              name="swap-horizontal"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowNotes((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons
              name={showNotes ? "document-text" : "document-text-outline"}
              size={16}
              color={showNotes ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleConfirmRemove}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.alert} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes */}
      {showNotes && (
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            placeholder="Add exercise notes (e.g. 2s pause, elbow position)..."
            placeholderTextColor={colors.textMuted}
            value={exercise.notes || ""}
            onChangeText={onUpdateNotes}
            multiline
          />
        </View>
      )}

      {/* Table Headers */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCol, { width: 34 }]}>SET</Text>

        <Text style={[styles.headerCol, { flex: 1, textAlign: "center" }]}>
          WEIGHT
        </Text>

        <Text style={[styles.headerCol, { flex: 1, textAlign: "center" }]}>
          {isTimed ? "TIME" : "REPS"}
        </Text>

        <Text style={[styles.headerCol, { width: 32, textAlign: "center" }]}>
          DONE
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Sets */}
      <View style={styles.setsList}>
        {exercise.sets.map((set, sIdx) => (
          <SetRow
            key={set.id || `set-${sIdx}`}
            set={set}
            isTimed={isTimed}
            onUpdate={(updates) => onUpdateSet(sIdx, updates)}
            onToggleComplete={() => onToggleSetCompleted(sIdx)}
            onDelete={() => onRemoveSet(sIdx)}
          />
        ))}
      </View>

      {/* Add Set */}
      <TouchableOpacity
        style={styles.addSetButton}
        onPress={onAddSet}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={15} color={colors.text} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 8,
  },

  exerciseImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
  },

  exerciseImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },

  titleText: {
    flex: 1,
  },

  exerciseName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },

  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },

  notesContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },

  notesInput: {
    fontSize: 12,
    color: colors.text,
    minHeight: 28,
  },

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 6,
    gap: 8,
  },

  headerCol: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },

  setsList: {
    marginBottom: 8,
  },

  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 8,
    borderRadius: 10,
  },

  addSetText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
});
