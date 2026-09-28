import { colors } from "@/styles/global";
import { formatDateForDisplay, isToday, isYesterday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type WorkoutDateTimeEditorProps = {
  selectedDate: string;
  onSetToday: () => void;
  onSetYesterday: () => void;
  onStepDate: (days: number) => void;
  onOpenDatePicker: () => void;

  timeHours: number;
  timeMinutes: number;
  displayHour: number;
  isPM: boolean;
  onStepHours: (step: number) => void;
  onStepMinutes: (step: number) => void;
  onHourInputChange: (text: string) => void;
  onMinuteInputChange: (text: string) => void;
  onToggleAmPm: (isPM: boolean) => void;

  durationMinutesStr: string;
  durationSecondsStr: string;
  parsedDurationMins: number;
  parsedDurationSecs: number;
  onDurationMinutesChange: (text: string) => void;
  onDurationSecondsChange: (text: string) => void;
  onStepDurationMins: (step: number) => void;
  onApplyPresetMinutes: (preset: number) => void;
};

export default function WorkoutDateTimeEditor({
  selectedDate,
  onSetToday,
  onSetYesterday,
  onStepDate,
  onOpenDatePicker,
  timeMinutes,
  displayHour,
  isPM,
  onStepHours,
  onStepMinutes,
  onHourInputChange,
  onMinuteInputChange,
  onToggleAmPm,
  durationMinutesStr,
  durationSecondsStr,
  parsedDurationMins,
  parsedDurationSecs,
  onDurationMinutesChange,
  onDurationSecondsChange,
  onStepDurationMins,
  onApplyPresetMinutes,
}: WorkoutDateTimeEditorProps) {
  const formatDurationBadge = (mins: number, secs: number) => {
    if (mins === 0 && secs === 0) return "0 min";
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const remM = mins % 60;
      return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
    }
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.label}>WORKOUT DETAILS</Text>
      <View style={styles.detailsCard}>
        {/* 1. Date Row */}
        <View style={styles.detailRow}>
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderLeft}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.detailTitle}>Date</Text>
            </View>
            <View style={styles.quickDateChipsRow}>
              <TouchableOpacity
                style={[
                  styles.quickDateChip,
                  isToday(selectedDate) && styles.quickDateChipActive,
                ]}
                onPress={onSetToday}
                accessibilityRole="button"
                accessibilityLabel="Set date to today"
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
                onPress={onSetYesterday}
                accessibilityRole="button"
                accessibilityLabel="Set date to yesterday"
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
              onPress={() => onStepDate(-1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Previous day"
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateDisplayBtn}
              onPress={onOpenDatePicker}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Select date in calendar"
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
              onPress={() => onStepDate(1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Next day"
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
                {displayHour}:{String(timeMinutes).padStart(2, "0")}{" "}
                {isPM ? "PM" : "AM"}
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
                  onPress={() => onStepHours(-1)}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease hour"
                >
                  <Ionicons name="remove" size={14} color={colors.text} />
                </TouchableOpacity>
                <TextInput
                  style={styles.stepperInput}
                  value={String(displayHour)}
                  onChangeText={onHourInputChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => onStepHours(1)}
                  accessibilityRole="button"
                  accessibilityLabel="Increase hour"
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
                  onPress={() => onStepMinutes(-5)}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease minutes"
                >
                  <Ionicons name="remove" size={14} color={colors.text} />
                </TouchableOpacity>
                <TextInput
                  style={styles.stepperInput}
                  value={String(timeMinutes).padStart(2, "0")}
                  onChangeText={onMinuteInputChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => onStepMinutes(5)}
                  accessibilityRole="button"
                  accessibilityLabel="Increase minutes"
                >
                  <Ionicons name="add" size={14} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* AM / PM Segmented Control */}
            <View style={styles.amPmContainer}>
              <TouchableOpacity
                style={[styles.amPmBtn, !isPM && styles.amPmActive]}
                onPress={() => onToggleAmPm(false)}
                accessibilityRole="button"
                accessibilityLabel="Set AM"
              >
                <Text style={[styles.amPmText, !isPM && styles.amPmTextActive]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.amPmBtn, isPM && styles.amPmActive]}
                onPress={() => onToggleAmPm(true)}
                accessibilityRole="button"
                accessibilityLabel="Set PM"
              >
                <Text style={[styles.amPmText, isPM && styles.amPmTextActive]}>
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
                onChangeText={onDurationMinutesChange}
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
                onChangeText={onDurationSecondsChange}
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
                onPress={() => onStepDurationMins(-5)}
                accessibilityRole="button"
                accessibilityLabel="Decrease duration 5 minutes"
              >
                <Text style={styles.quickStepText}>-5m</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickStepBtn}
                onPress={() => onStepDurationMins(5)}
                accessibilityRole="button"
                accessibilityLabel="Increase duration 5 minutes"
              >
                <Text style={styles.quickStepText}>+5m</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Preset Chips */}
          <View style={styles.presetsRow}>
            {[15, 30, 45, 60, 90].map((preset) => {
              const isActive =
                parsedDurationMins === preset && parsedDurationSecs === 0;
              return (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetChip,
                    isActive && styles.presetChipActive,
                  ]}
                  onPress={() => onApplyPresetMinutes(preset)}
                  accessibilityRole="button"
                  accessibilityLabel={`Set duration to ${preset} minutes`}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isActive && styles.presetTextActive,
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
  );
}

const styles = StyleSheet.create({
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
  detailsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 14,
  },
  detailRow: {
    gap: 10,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  quickDateChipsRow: {
    flexDirection: "row",
    gap: 6,
  },
  quickDateChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  quickDateChipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  quickDateText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  quickDateTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  dateSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  dateDisplayBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dateDisplayText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 14,
  },
  badgeContainer: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
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
    fontSize: 9,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperInput: {
    width: 32,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    padding: 0,
  },
  timeColon: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textSecondary,
    marginTop: 14,
  },
  amPmContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 2,
    marginTop: 14,
    marginLeft: "auto",
  },
  amPmBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  amPmActive: {
    backgroundColor: colors.primary,
  },
  amPmText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  amPmTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  durationInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  durationInputGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
  },
  durationInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    padding: 0,
  },
  durationUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginLeft: 4,
  },
  quickStepGroup: {
    flexDirection: "row",
    gap: 4,
  },
  quickStepBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 9,
  },
  quickStepText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  presetsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  presetChip: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: "center",
  },
  presetChipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  presetTextActive: {
    color: colors.primary,
  },
});
