import ExerciseCard from "@/components/workout/exercises/ExerciseCard";
import ExerciseSelectorModal from "@/components/workout/exercises/ExerciseSelectorModal";
import { colors } from "@/styles/global";
import { Exercise, ExerciseSet, WorkoutSession } from "@/types/workout";
import {
  addDays,
  formatDateForDisplay,
  getTodayDateString,
  isToday,
  isYesterday,
  parseLocalDate,
} from "@/utils/date";
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
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

type CalendarPickerModalProps = {
  visible: boolean;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Clean calendar picker modal for selecting any workout date
 */
type CalendarPickerContentProps = {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
};

function CalendarPickerContent({
  selectedDate,
  onSelectDate,
  onClose,
}: CalendarPickerContentProps) {
  const parsed = useMemo(() => parseLocalDate(selectedDate), [selectedDate]);
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  const handlePrevMonth = () => {
    Haptics.selectionAsync();
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.selectionAsync();
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const handlePickDay = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const mStr = String(viewMonth + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    onSelectDate(`${viewYear}-${mStr}-${dStr}`);
    onClose();
  };

  return (
    <View style={calStyles.modalCard}>
          {/* Month / Year Header */}
          <View style={calStyles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={calStyles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={calStyles.title}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={calStyles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Weekday Row */}
          <View style={calStyles.weekdayRow}>
            {["S", "M", "T", "W", "T", "F", "S"].map((wd, i) => (
              <Text key={i} style={calStyles.weekdayText}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={calStyles.daysGrid}>
            {Array.from({ length: firstDayWeekday }).map((_, idx) => (
              <View key={`empty-${idx}`} style={calStyles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }, (_, idx) => idx + 1).map((day) => {
              const mStr = String(viewMonth + 1).padStart(2, "0");
              const dStr = String(day).padStart(2, "0");
              const dateStr = `${viewYear}-${mStr}-${dStr}`;
              const isSelected = dateStr === selectedDate;
              const isCurrentDay = isToday(dateStr);

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    calStyles.dayCell,
                    isSelected && calStyles.selectedDayCell,
                    isCurrentDay && !isSelected && calStyles.todayCell,
                  ]}
                  onPress={() => handlePickDay(day)}
                >
                  <Text
                    style={[
                      calStyles.dayText,
                      isSelected && calStyles.selectedDayText,
                      isCurrentDay && !isSelected && calStyles.todayText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Jump & Close Footer */}
          <View style={calStyles.footer}>
            <TouchableOpacity
              style={calStyles.footerBtn}
              onPress={() => {
                onSelectDate(getTodayDateString());
                onClose();
              }}
            >
              <Text style={calStyles.todayActionText}>Jump to Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={calStyles.closeBtn} onPress={onClose}>
              <Text style={calStyles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
  );
}

function CalendarPickerModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}: CalendarPickerModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={calStyles.backdrop}>
        <CalendarPickerContent
          key={selectedDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onClose={onClose}
        />
      </View>
    </Modal>
  );
}

function EditWorkoutForm({ session, onClose, onSave }: EditWorkoutFormProps) {
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

  // Initial duration
  const initDuration = session.durationSeconds || 0;
  const [durationMinutesStr, setDurationMinutesStr] = useState<string>(
    String(Math.floor(initDuration / 60)),
  );
  const [durationSecondsStr, setDurationSecondsStr] = useState<string>(
    String(initDuration % 60),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // Date & Time Helpers
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Duration Helpers
  // ---------------------------------------------------------------------------
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

  const formatDurationBadge = (mins: number, secs: number) => {
    if (mins === 0 && secs === 0) return "0 min";
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const remM = mins % 60;
      return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
    }
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  };

  // Add a set to an exercise
  const handleAddSet = (exIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => addSet(prev, exIdx, { completed: true }));
  };

  // Remove a set
  const handleRemoveSet = (exIdx: number, sIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => removeSet(prev, exIdx, sIdx));
  };

  // Update a set
  const handleUpdateSet = (
    exIdx: number,
    sIdx: number,
    updates: Partial<ExerciseSet>,
  ) => {
    setDraftSession((prev) => updateSet(prev, exIdx, sIdx, updates));
  };

  // Toggle set completed
  const handleToggleSetCompleted = (exIdx: number, sIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => toggleSetCompleted(prev, exIdx, sIdx));
  };

  // Remove an exercise
  const handleRemoveExercise = (exIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => removeExercise(prev, exIdx));
  };

  // Move exercise up/down
  const handleReorderExercise = (fromIdx: number, toIdx: number) => {
    Haptics.selectionAsync();
    setDraftSession((prev) => reorderExercises(prev, fromIdx, toIdx));
  };

  // Update notes
  const handleUpdateNotes = (exIdx: number, newNotes: string) => {
    setDraftSession((prev) => updateExerciseNotes(prev, exIdx, newNotes));
  };

  // Select exercise from modal
  const handleSelectExercise = (ex: Exercise) => {
    if (replacingIndex !== null) {
      setDraftSession((prev) => replaceExercise(prev, replacingIndex, ex));
      setReplacingIndex(null);
    } else {
      setDraftSession((prev) =>
        addExercise(prev, ex, { initialSets: 1, defaultCompleted: true }),
      );
    }
    setSelectorVisible(false);
  };

  // Save changes
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
            value={draftSession.name}
            onChangeText={(name) =>
              setDraftSession((prev) => ({ ...prev, name }))
            }
            placeholder="e.g. Chest & Triceps"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Workout Details (Date, Start Time, Duration) */}
        <View style={styles.section}>
          <Text style={styles.label}>WORKOUT DETAILS</Text>
          <View style={styles.detailsCard}>
            {/* 1. Date Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderLeft}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailTitle}>Date</Text>
                </View>
                <View style={styles.quickDateChipsRow}>
                  <TouchableOpacity
                    style={[
                      styles.quickDateChip,
                      isToday(selectedDate) && styles.quickDateChipActive,
                    ]}
                    onPress={handleSetToday}
                  >
                    <Text
                      style={[
                        styles.quickDateText,
                        isToday(selectedDate) && styles.quickDateTextActive,
                      ]}
                    >
                      Today
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.quickDateChip,
                      isYesterday(selectedDate) && styles.quickDateChipActive,
                    ]}
                    onPress={handleSetYesterday}
                  >
                    <Text
                      style={[
                        styles.quickDateText,
                        isYesterday(selectedDate) && styles.quickDateTextActive,
                      ]}
                    >
                      Yesterday
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dateSelectorRow}>
                <TouchableOpacity
                  style={styles.dateNavBtn}
                  onPress={() => handleStepDate(-1)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateDisplayBtn}
                  onPress={() => setDatePickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar" size={15} color={colors.primary} />
                  <Text style={styles.dateDisplayText}>
                    {formatDateForDisplay(selectedDate)}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateNavBtn}
                  onPress={() => handleStepDate(1)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="chevron-forward" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailsDivider} />

            {/* 2. Start Time Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderLeft}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailTitle}>Start Time</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {displayHour}:{String(timeMinutes).padStart(2, "0")} {isPM ? "PM" : "AM"}
                  </Text>
                </View>
              </View>

              <View style={styles.timeControlsRow}>
                {/* Hour Col */}
                <View style={styles.timeUnitCol}>
                  <Text style={styles.unitLabel}>HOUR</Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => handleStepHours(-1)}
                    >
                      <Ionicons name="remove" size={14} color={colors.text} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.stepperInput}
                      value={String(displayHour)}
                      onChangeText={handleHourInputChange}
                      keyboardType="number-pad"
                      maxLength={2}
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => handleStepHours(1)}
                    >
                      <Ionicons name="add" size={14} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.timeColon}>:</Text>

                {/* Minute Col */}
                <View style={styles.timeUnitCol}>
                  <Text style={styles.unitLabel}>MIN</Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => handleStepMinutes(-5)}
                    >
                      <Ionicons name="remove" size={14} color={colors.text} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.stepperInput}
                      value={String(timeMinutes).padStart(2, "0")}
                      onChangeText={handleMinuteInputChange}
                      keyboardType="number-pad"
                      maxLength={2}
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => handleStepMinutes(5)}
                    >
                      <Ionicons name="add" size={14} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* AM / PM Segmented Control */}
                <View style={styles.amPmContainer}>
                  <TouchableOpacity
                    style={[styles.amPmBtn, !isPM && styles.amPmActive]}
                    onPress={() => handleToggleAmPm(false)}
                  >
                    <Text
                      style={[styles.amPmText, !isPM && styles.amPmTextActive]}
                    >
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.amPmBtn, isPM && styles.amPmActive]}
                    onPress={() => handleToggleAmPm(true)}
                  >
                    <Text
                      style={[styles.amPmText, isPM && styles.amPmTextActive]}
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.detailsDivider} />

            {/* 3. Duration Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderLeft}>
                  <Ionicons name="timer-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailTitle}>Duration</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {formatDurationBadge(parsedDurationMins, parsedDurationSecs)}
                  </Text>
                </View>
              </View>

              <View style={styles.durationInputRow}>
                <View style={styles.durationInputGroup}>
                  <TextInput
                    style={styles.durationInput}
                    value={durationMinutesStr}
                    onChangeText={setDurationMinutesStr}
                    keyboardType="number-pad"
                    maxLength={4}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    selectTextOnFocus
                  />
                  <Text style={styles.durationUnit}>min</Text>
                </View>

                <View style={styles.durationInputGroup}>
                  <TextInput
                    style={styles.durationInput}
                    value={durationSecondsStr}
                    onChangeText={setDurationSecondsStr}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    selectTextOnFocus
                  />
                  <Text style={styles.durationUnit}>sec</Text>
                </View>

                {/* +/- 5m Quick Step */}
                <View style={styles.quickStepGroup}>
                  <TouchableOpacity
                    style={styles.quickStepBtn}
                    onPress={() => handleStepDurationMins(-5)}
                  >
                    <Text style={styles.quickStepText}>-5m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickStepBtn}
                    onPress={() => handleStepDurationMins(5)}
                  >
                    <Text style={styles.quickStepText}>+5m</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Preset Chips */}
              <View style={styles.presetsRow}>
                {[15, 30, 45, 60, 90].map((preset) => {
                  const isPresetActive =
                    parsedDurationMins === preset && parsedDurationSecs === 0;
                  return (
                    <TouchableOpacity
                      key={`preset-${preset}`}
                      style={[
                        styles.presetChip,
                        isPresetActive && styles.presetChipActive,
                      ]}
                      onPress={() => handleApplyPresetMinutes(preset)}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          isPresetActive && styles.presetTextActive,
                        ]}
                      >
                        {preset}m
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Workout Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>WORKOUT NOTES (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={draftSession.notes || ""}
            onChangeText={(notes) =>
              setDraftSession((prev) => ({ ...prev, notes }))
            }
            placeholder="Session notes, feeling, or adjustments..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        {/* Exercises Header */}
        <View style={styles.exHeaderRow}>
          <Text style={styles.label}>
            EXERCISES ({draftSession.exercises.length})
          </Text>
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
        {draftSession.exercises.map((ex, exIdx) => (
          <ExerciseCard
            key={ex.id || `edit-ex-${exIdx}`}
            exercise={ex}
            exerciseIndex={exIdx}
            totalExercises={draftSession.exercises.length}
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

      <CalendarPickerModal
        visible={datePickerVisible}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onClose={() => setDatePickerVisible(false)}
      />

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
    gap: 16,
  },
  section: {
    gap: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  exHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  addExChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addExText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  addBottomBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  addBottomText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  // ---------------------------------------------------------------------------
  // Workout Details Card Styles
  // ---------------------------------------------------------------------------
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    gap: 14,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  detailRow: {
    gap: 10,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  badgeContainer: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  // Date Selector
  dateSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  dateDisplayBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  dateDisplayText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  quickDateChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickDateChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
  },
  quickDateChipActive: {
    backgroundColor: colors.primary,
  },
  quickDateText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  quickDateTextActive: {
    color: "#0A0A0A",
  },

  // Time Selector
  timeControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeUnitCol: {
    alignItems: "center",
    gap: 4,
  },
  unitLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
  },
  stepBtn: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperInput: {
    width: 36,
    height: 36,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  timeColon: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },
  amPmContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 3,
    marginLeft: "auto",
    marginTop: 14,
  },
  amPmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
  },
  amPmActive: {
    backgroundColor: colors.primary,
  },
  amPmText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  amPmTextActive: {
    color: "#0A0A0A",
  },

  // Duration Selector
  durationInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  durationInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 10,
    height: 38,
  },
  durationInput: {
    width: 36,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  durationUnit: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
  quickStepGroup: {
    flexDirection: "row",
    gap: 6,
    marginLeft: "auto",
  },
  quickStepBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickStepText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  presetsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  presetChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  presetTextActive: {
    color: "#0A0A0A",
    fontWeight: "700",
  },
});

const calStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  weekdayText: {
    width: 36,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginVertical: 2,
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  selectedDayText: {
    color: "#0A0A0A",
    fontWeight: "700",
  },
  todayText: {
    color: colors.primary,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  footerBtn: {
    paddingVertical: 6,
  },
  todayActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  closeBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  closeBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
