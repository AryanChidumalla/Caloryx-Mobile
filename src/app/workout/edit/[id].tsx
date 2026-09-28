import ExerciseCard from "@/components/workout/exercises/ExerciseCard";
import CalendarPickerModal from "@/components/workout/history/CalendarPickerModal";
import WorkoutDateTimeEditor from "@/components/workout/history/WorkoutDateTimeEditor";
import { useEditWorkoutForm } from "@/components/workout/history/useEditWorkoutForm";
import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { WorkoutSession } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditWorkoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    sessions,
    updateSession,
    selectedExerciseForEdit,
    setSelectedExerciseForEdit,
  } = useWorkout();

  const originalSession = sessions.find((s) => s.id === id);

  if (!originalSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.notFound}>
          <Ionicons name="barbell-outline" size={40} color={colors.textMuted} />
          <Text style={styles.notFoundTitle}>Workout session not found</Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backHomeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <EditWorkoutFormContent
      key={originalSession.id}
      session={originalSession}
      onClose={() => router.back()}
      onSave={async (updated) => {
        await updateSession(updated);
        router.back();
      }}
      selectedExerciseForEdit={selectedExerciseForEdit}
      setSelectedExerciseForEdit={setSelectedExerciseForEdit}
    />
  );
}

function EditWorkoutFormContent({
  session,
  onClose,
  onSave,
  selectedExerciseForEdit,
  setSelectedExerciseForEdit,
}: {
  session: WorkoutSession;
  onClose: () => void;
  onSave: (session: WorkoutSession) => Promise<void>;
  selectedExerciseForEdit: {
    exercise: any;
    replacingIndex?: number | null;
  } | null;
  setSelectedExerciseForEdit: (val: any) => void;
}) {
  const form = useEditWorkoutForm({
    session,
    onSave,
    selectedExerciseForEdit,
    setSelectedExerciseForEdit,
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Cancel edit"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Workout</Text>
        <TouchableOpacity
          onPress={form.handleSave}
          disabled={form.isSaving}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Save workout edits"
        >
          {form.isSaving ? (
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
            value={form.draftSession.name}
            onChangeText={(name) =>
              form.setDraftSession((prev) => ({ ...prev, name }))
            }
            placeholder="e.g. Chest & Triceps"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Workout Details (Date, Start Time, Duration) */}
        <WorkoutDateTimeEditor
          selectedDate={form.selectedDate}
          onSetToday={form.handleSetToday}
          onSetYesterday={form.handleSetYesterday}
          onStepDate={form.handleStepDate}
          onOpenDatePicker={() => form.setDatePickerVisible(true)}
          timeHours={form.timeHours}
          timeMinutes={form.timeMinutes}
          displayHour={form.displayHour}
          isPM={form.isPM}
          onStepHours={form.handleStepHours}
          onStepMinutes={form.handleStepMinutes}
          onHourInputChange={form.handleHourInputChange}
          onMinuteInputChange={form.handleMinuteInputChange}
          onToggleAmPm={form.handleToggleAmPm}
          durationMinutesStr={form.durationMinutesStr}
          durationSecondsStr={form.durationSecondsStr}
          parsedDurationMins={form.parsedDurationMins}
          parsedDurationSecs={form.parsedDurationSecs}
          onDurationMinutesChange={form.setDurationMinutesStr}
          onDurationSecondsChange={form.setDurationSecondsStr}
          onStepDurationMins={form.handleStepDurationMins}
          onApplyPresetMinutes={form.handleApplyPresetMinutes}
        />

        {/* Workout Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>WORKOUT NOTES (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={form.draftSession.notes || ""}
            onChangeText={(notes) =>
              form.setDraftSession((prev) => ({ ...prev, notes }))
            }
            placeholder="Session notes, feeling, or adjustments..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        {/* Exercises Header */}
        <View style={styles.exHeaderRow}>
          <Text style={styles.label}>
            EXERCISES ({form.draftSession.exercises.length})
          </Text>
          <TouchableOpacity
            style={styles.addExChip}
            onPress={() => form.handleOpenSelector(null)}
            accessibilityRole="button"
            accessibilityLabel="Add exercise"
          >
            <Ionicons name="add" size={14} color={colors.primary} />
            <Text style={styles.addExText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {/* Exercises List */}
        {form.draftSession.exercises.map((ex, exIdx) => (
          <ExerciseCard
            key={ex.id || `edit-ex-${exIdx}`}
            exercise={ex}
            exerciseIndex={exIdx}
            totalExercises={form.draftSession.exercises.length}
            onAddSet={() => form.handleAddSet(exIdx)}
            onRemoveSet={(sIdx) => form.handleRemoveSet(exIdx, sIdx)}
            onUpdateSet={(sIdx, updates) =>
              form.handleUpdateSet(exIdx, sIdx, updates)
            }
            onToggleSetCompleted={(sIdx) =>
              form.handleToggleSetCompleted(exIdx, sIdx)
            }
            onRemoveExercise={() => form.handleRemoveExercise(exIdx)}
            onReplaceExercise={() => form.handleOpenSelector(exIdx)}
            onMoveUp={() => form.handleReorderExercise(exIdx, exIdx - 1)}
            onMoveDown={() => form.handleReorderExercise(exIdx, exIdx + 1)}
            onUpdateNotes={(n) => form.handleUpdateNotes(exIdx, n)}
          />
        ))}

        {/* Add Exercise Button at bottom */}
        <TouchableOpacity
          style={styles.addBottomBtn}
          onPress={() => form.handleOpenSelector(null)}
          accessibilityRole="button"
          accessibilityLabel="Add another exercise"
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addBottomText}>Add Another Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      <CalendarPickerModal
        visible={form.datePickerVisible}
        selectedDate={form.selectedDate}
        onSelectDate={form.setSelectedDate}
        onClose={() => form.setDatePickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  saveText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
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
    fontWeight: "600",
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: "top",
    fontWeight: "400",
    fontSize: 14,
  },
  exHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    borderStyle: "dashed",
    paddingVertical: 14,
    marginTop: 8,
    backgroundColor: colors.surfaceLight,
  },
  addBottomText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  backHomeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  backHomeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
