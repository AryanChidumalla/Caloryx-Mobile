import { ExerciseSet, WorkoutSession } from "@/types/workout";
import { addDays, getTodayDateString } from "@/utils/date";
import {
  addExercise,
  addSet,
  buildWorkoutStartedAt,
  parseWorkoutStartedAt,
  removeExercise,
  removeSet,
  reorderExercises,
  replaceExercise,
  toggleSetCompleted,
  updateExerciseNotes,
  updateSessionMetadata,
  updateSet,
} from "@/utils/workoutMutations";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export type UseEditWorkoutFormProps = {
  session: WorkoutSession;
  onSave: (session: WorkoutSession) => Promise<void>;
  selectedExerciseForEdit: {
    exercise: any;
    replacingIndex?: number | null;
  } | null;
  setSelectedExerciseForEdit: (val: any) => void;
};

export function useEditWorkoutForm({
  session,
  onSave,
  selectedExerciseForEdit,
  setSelectedExerciseForEdit,
}: UseEditWorkoutFormProps) {
  const router = useRouter();

  const [draftSession, setDraftSession] = useState<WorkoutSession>(() => ({
    ...session,
    exercises: session.exercises.map((ex) => ({
      ...ex,
      sets: (ex.sets || []).map((s) => ({ ...s })),
    })),
  }));

  // Initial parsed date/time from session.startedAt
  const initialTime = useMemo(
    () => parseWorkoutStartedAt(session.startedAt),
    [session.startedAt],
  );

  const [selectedDate, setSelectedDate] = useState<string>(initialTime.dateStr);
  const [timeHours, setTimeHours] = useState<number>(initialTime.hours);
  const [timeMinutes, setTimeMinutes] = useState<number>(initialTime.minutes);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Duration
  const initDuration = session.durationSeconds || 0;
  const [durationMinutesStr, setDurationMinutesStr] = useState<string>(
    String(Math.floor(initDuration / 60)),
  );
  const [durationSecondsStr, setDurationSecondsStr] = useState<string>(
    String(initDuration % 60),
  );

  const [isSaving, setIsSaving] = useState(false);

  // Consume exercise selected from /workout/selector?target=edit
  useEffect(() => {
    if (!selectedExerciseForEdit) return;

    const payload = selectedExerciseForEdit;
    const timer = setTimeout(() => {
      if (
        payload.replacingIndex !== null &&
        payload.replacingIndex !== undefined
      ) {
        setDraftSession((prev) =>
          replaceExercise(prev, payload.replacingIndex!, payload.exercise),
        );
      } else {
        setDraftSession((prev) =>
          addExercise(prev, payload.exercise, {
            initialSets: 1,
            defaultCompleted: true,
          }),
        );
      }
      setSelectedExerciseForEdit(null);
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedExerciseForEdit, setSelectedExerciseForEdit]);

  const handleOpenSelector = (replacingIndex?: number | null) => {
    router.push({
      pathname: "/workout/selector",
      params: {
        target: "edit",
        ...(replacingIndex !== null && replacingIndex !== undefined
          ? { replacingIndex: String(replacingIndex) }
          : {}),
      },
    });
  };

  // Date / Time helpers
  const isPM = timeHours >= 12;
  const displayHour = timeHours % 12 === 0 ? 12 : timeHours % 12;

  const handleStepDate = (days: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate((prev) => addDays(prev, days));
  };

  const handleSetToday = () => {
    Haptics.selectionAsync();
    setSelectedDate(getTodayDateString());
  };

  const handleSetYesterday = () => {
    Haptics.selectionAsync();
    setSelectedDate(addDays(getTodayDateString(), -1));
  };

  const handleToggleAmPm = (newIsPM: boolean) => {
    Haptics.selectionAsync();
    const current12 = timeHours % 12 === 0 ? 12 : timeHours % 12;
    const new24 = (current12 % 12) + (newIsPM ? 12 : 0);
    setTimeHours(new24);
  };

  const handleStepHours = (step: number) => {
    Haptics.selectionAsync();
    setTimeHours((prev) => {
      let next = (prev + step) % 24;
      if (next < 0) next += 24;
      return next;
    });
  };

  const handleStepMinutes = (step: number) => {
    Haptics.selectionAsync();
    setTimeMinutes((prev) => {
      let next = (prev + step) % 60;
      if (next < 0) next += 60;
      return next;
    });
  };

  const handleHourInputChange = (text: string) => {
    const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return;
    const clamped12 = Math.min(12, Math.max(1, num));
    const new24 = (clamped12 % 12) + (isPM ? 12 : 0);
    setTimeHours(new24);
  };

  const handleMinuteInputChange = (text: string) => {
    const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) {
      setTimeMinutes(0);
      return;
    }
    setTimeMinutes(Math.min(59, Math.max(0, num)));
  };

  // Duration Helpers
  const parsedDurationMins = Math.max(
    0,
    parseInt(durationMinutesStr.replace(/[^0-9]/g, ""), 10) || 0,
  );
  const parsedDurationSecs = Math.min(
    59,
    Math.max(0, parseInt(durationSecondsStr.replace(/[^0-9]/g, ""), 10) || 0),
  );

  const handleStepDurationMins = (step: number) => {
    Haptics.selectionAsync();
    const next = Math.max(0, parsedDurationMins + step);
    setDurationMinutesStr(String(next));
  };

  const handleApplyPresetMinutes = (preset: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDurationMinutesStr(String(preset));
    setDurationSecondsStr("0");
  };

  // Exercise manipulation handlers
  const handleAddSet = (exIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => addSet(prev, exIdx, { completed: true }));
  };

  const handleRemoveSet = (exIdx: number, sIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => removeSet(prev, exIdx, sIdx));
  };

  const handleUpdateSet = (
    exIdx: number,
    sIdx: number,
    updates: Partial<ExerciseSet>,
  ) => {
    setDraftSession((prev) => updateSet(prev, exIdx, sIdx, updates));
  };

  const handleToggleSetCompleted = (exIdx: number, sIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => toggleSetCompleted(prev, exIdx, sIdx));
  };

  const handleRemoveExercise = (exIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => removeExercise(prev, exIdx));
  };

  const handleReorderExercise = (fromIdx: number, toIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => reorderExercises(prev, fromIdx, toIdx));
  };

  const handleUpdateNotes = (exIdx: number, newNotes: string) => {
    setDraftSession((prev) => updateExerciseNotes(prev, exIdx, newNotes));
  };

  const handleSave = async () => {
    if (!draftSession.name.trim()) {
      Alert.alert("Workout Name", "Please enter a name for this workout.");
      return;
    }

    const totalSeconds = parsedDurationMins * 60 + parsedDurationSecs;
    const newStartedAt = buildWorkoutStartedAt(
      selectedDate,
      timeHours,
      timeMinutes,
    );

    setIsSaving(true);
    try {
      const updated: WorkoutSession = updateSessionMetadata(draftSession, {
        name: draftSession.name.trim(),
        startedAt: newStartedAt,
        durationSeconds: totalSeconds,
        notes: draftSession.notes?.trim() || undefined,
      });

      await onSave(updated);
    } catch (err: any) {
      Alert.alert(
        "Error Saving",
        err?.message || "Failed to save workout edits.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    draftSession,
    setDraftSession,
    selectedDate,
    setSelectedDate,
    timeHours,
    timeMinutes,
    displayHour,
    isPM,
    datePickerVisible,
    setDatePickerVisible,
    durationMinutesStr,
    setDurationMinutesStr,
    durationSecondsStr,
    setDurationSecondsStr,
    parsedDurationMins,
    parsedDurationSecs,
    isSaving,
    handleStepDate,
    handleSetToday,
    handleSetYesterday,
    handleToggleAmPm,
    handleStepHours,
    handleStepMinutes,
    handleHourInputChange,
    handleMinuteInputChange,
    handleStepDurationMins,
    handleApplyPresetMinutes,
    handleAddSet,
    handleRemoveSet,
    handleUpdateSet,
    handleToggleSetCompleted,
    handleRemoveExercise,
    handleReorderExercise,
    handleUpdateNotes,
    handleOpenSelector,
    handleSave,
  };
}
