import ExerciseCard from "@/components/ExerciseCard";
import ExerciseSelectorModal from "@/components/ExerciseSelectorModal";
import { colors } from "@/styles/global";
import {
  Exercise,
  ExerciseSet,
  SessionExercise,
  WorkoutSession,
} from "@/types/workout";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type EditWorkoutModalProps = {
  visible: boolean;
  session: WorkoutSession | null;
  onClose: () => void;
  onSave: (session: WorkoutSession) => Promise<void>;
};

type EditWorkoutFormProps = {
  session: WorkoutSession;
  onClose: () => void;
  onSave: (session: WorkoutSession) => Promise<void>;
};

function EditWorkoutForm({ session, onClose, onSave }: EditWorkoutFormProps) {
  const [name, setName] = useState(session.name);
  const [notes, setNotes] = useState(session.notes || "");
  const [exercises, setExercises] = useState<SessionExercise[]>(() =>
    session.exercises.map((ex) => ({
      ...ex,
      sets: (ex.sets || []).map((s) => ({ ...s })),
    })),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Add a set to an exercise
  const handleAddSet = (exIdx: number) => {
    Haptics.selectionAsync();
    setExercises((prev) => {
      const copy = [...prev];
      const ex = copy[exIdx];
      if (!ex) return prev;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: ExerciseSet = {
        id: `set-${Date.now()}-${ex.sets.length}`,
        setNumber: ex.sets.length + 1,
        setType: "regular",
        weightKg: lastSet ? lastSet.weightKg : 0,
        reps: lastSet ? lastSet.reps : 10,
        completed: true,
      };
      copy[exIdx] = { ...ex, sets: [...ex.sets, newSet] };
      return copy;
    });
  };

  // Remove a set
  const handleRemoveSet = (exIdx: number, sIdx: number) => {
    Haptics.selectionAsync();
    setExercises((prev) => {
      const copy = [...prev];
      const ex = copy[exIdx];
      if (!ex) return prev;
      const filtered = ex.sets
        .filter((_, idx) => idx !== sIdx)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      copy[exIdx] = { ...ex, sets: filtered };
      return copy;
    });
  };

  // Update a set
  const handleUpdateSet = (
    exIdx: number,
    sIdx: number,
    updates: Partial<ExerciseSet>,
  ) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = copy[exIdx];
      if (!ex) return prev;
      const updatedSets = [...ex.sets];
      updatedSets[sIdx] = { ...updatedSets[sIdx], ...updates };
      copy[exIdx] = { ...ex, sets: updatedSets };
      return copy;
    });
  };

  // Toggle set completed
  const handleToggleSetCompleted = (exIdx: number, sIdx: number) => {
    Haptics.selectionAsync();
    setExercises((prev) => {
      const copy = [...prev];
      const ex = copy[exIdx];
      if (!ex) return prev;
      const updatedSets = [...ex.sets];
      updatedSets[sIdx] = {
        ...updatedSets[sIdx],
        completed: !updatedSets[sIdx].completed,
      };
      copy[exIdx] = { ...ex, sets: updatedSets };
      return copy;
    });
  };

  // Remove an exercise
  const handleRemoveExercise = (exIdx: number) => {
    Haptics.selectionAsync();
    setExercises((prev) => prev.filter((_, idx) => idx !== exIdx));
  };

  // Move exercise up/down
  const handleReorderExercise = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= exercises.length) return;
    Haptics.selectionAsync();
    setExercises((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  };

  // Update notes
  const handleUpdateNotes = (exIdx: number, newNotes: string) => {
    setExercises((prev) => {
      const copy = [...prev];
      if (copy[exIdx]) {
        copy[exIdx] = { ...copy[exIdx], notes: newNotes };
      }
      return copy;
    });
  };

  // Select exercise from modal
  const handleSelectExercise = (ex: Exercise) => {
    if (replacingIndex !== null) {
      setExercises((prev) => {
        const copy = [...prev];
        if (copy[replacingIndex]) {
          copy[replacingIndex] = {
            ...copy[replacingIndex],
            exerciseId: ex.id,
            exerciseName: ex.name,
            category: ex.category,
          };
        }
        return copy;
      });
      setReplacingIndex(null);
    } else {
      const newEx: SessionExercise = {
        id: `se-${Date.now()}-${exercises.length}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        category: ex.category,
        orderIndex: exercises.length,
        sets: [
          {
            id: `set-${Date.now()}-0`,
            setNumber: 1,
            setType: "regular",
            weightKg: 0,
            reps: 10,
            completed: true,
          },
        ],
      };
      setExercises((prev) => [...prev, newEx]);
    }
    setSelectorVisible(false);
  };

  // Save changes
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Workout Name", "Please enter a name for this workout.");
      return;
    }

    // Recalculate total volume
    let totalVolume = 0;
    for (const ex of exercises) {
      for (const s of ex.sets) {
        if (s.completed && s.weightKg > 0 && s.reps > 0) {
          totalVolume += s.weightKg * s.reps;
        }
      }
    }

    setIsSaving(true);
    try {
      const updated: WorkoutSession = {
        ...session,
        name: name.trim(),
        notes: notes.trim() || undefined,
        exercises,
        totalVolumeKg: Math.round(totalVolume),
      };
      await onSave(updated);
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Error Saving",
        err?.message || "Failed to save workout edits.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Workout</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={styles.headerBtn}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Workout Name */}
        <View style={styles.section}>
          <Text style={styles.label}>WORKOUT NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chest & Triceps"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Workout Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>WORKOUT NOTES (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Session notes, feeling, or adjustments..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        {/* Exercises Header */}
        <View style={styles.exHeaderRow}>
          <Text style={styles.label}>EXERCISES ({exercises.length})</Text>
          <TouchableOpacity
            style={styles.addExChip}
            onPress={() => {
              setReplacingIndex(null);
              setSelectorVisible(true);
            }}
          >
            <Ionicons name="add" size={14} color={colors.primary} />
            <Text style={styles.addExText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {/* Exercises List */}
        {exercises.map((ex, exIdx) => (
          <ExerciseCard
            key={ex.id || `edit-ex-${exIdx}`}
            exercise={ex}
            exerciseIndex={exIdx}
            totalExercises={exercises.length}
            onAddSet={() => handleAddSet(exIdx)}
            onRemoveSet={(sIdx) => handleRemoveSet(exIdx, sIdx)}
            onUpdateSet={(sIdx, updates) =>
              handleUpdateSet(exIdx, sIdx, updates)
            }
            onToggleSetCompleted={(sIdx) =>
              handleToggleSetCompleted(exIdx, sIdx)
            }
            onRemoveExercise={() => handleRemoveExercise(exIdx)}
            onReplaceExercise={() => {
              setReplacingIndex(exIdx);
              setSelectorVisible(true);
            }}
            onMoveUp={() => handleReorderExercise(exIdx, exIdx - 1)}
            onMoveDown={() => handleReorderExercise(exIdx, exIdx + 1)}
            onUpdateNotes={(n) => handleUpdateNotes(exIdx, n)}
          />
        ))}

        {/* Add Exercise Button at bottom */}
        <TouchableOpacity
          style={styles.addBottomBtn}
          onPress={() => {
            setReplacingIndex(null);
            setSelectorVisible(true);
          }}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addBottomText}>Add Another Exercise</Text>
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
  );
}

export default function EditWorkoutModal({
  visible,
  session,
  onClose,
  onSave,
}: EditWorkoutModalProps) {
  if (!session) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <EditWorkoutForm
        key={session.id}
        session={session}
        onClose={onClose}
        onSave={onSave}
      />
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
  headerBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  cancelText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  saveText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
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
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 50,
  },
  exHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  addExChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addExText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  addBottomBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  addBottomText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
});
