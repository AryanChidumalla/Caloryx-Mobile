import { colors, typography } from "@/styles/global";
import { SleepQuality } from "@/types/health";
import { formatSleepDuration } from "@/utils/healthCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type SleepLogModalProps = {
  visible: boolean;
  initialMinutes?: number;
  initialQuality?: SleepQuality;
  goalMinutes: number;
  onSave: (durationMinutes: number, quality: SleepQuality, notes?: string) => Promise<void>;
  onClose: () => void;
};

const QUALITY_OPTIONS: { key: SleepQuality; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "optimal", label: "Optimal", icon: "sparkles", color: colors.protein },
  { key: "good", label: "Good", icon: "happy-outline", color: colors.primary },
  { key: "fair", label: "Fair", icon: "remove-circle-outline", color: colors.carbs },
  { key: "short", label: "Short", icon: "alert-circle-outline", color: colors.alert },
];

export default function SleepLogModal({
  visible,
  initialMinutes = 450, // default 7h 30m
  initialQuality = "good",
  goalMinutes,
  onSave,
  onClose,
}: SleepLogModalProps) {
  const [hours, setHours] = useState(Math.floor(initialMinutes / 60));
  const [minutes, setMinutes] = useState(initialMinutes % 60);
  const [quality, setQuality] = useState<SleepQuality>(initialQuality);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      const init = initialMinutes > 0 ? initialMinutes : goalMinutes;
      setHours(Math.floor(init / 60));
      setMinutes(init % 60);
      setQuality(initialQuality);
      setNotes("");
      setIsSaving(false);
    }
  }

  const totalMinutes = hours * 60 + minutes;

  const handleStepHours = (delta: number) => {
    Haptics.selectionAsync();
    setHours((prev) => Math.max(0, Math.min(24, prev + delta)));
  };

  const handleStepMinutes = (delta: number) => {
    Haptics.selectionAsync();
    setMinutes((prev) => {
      let next = prev + delta;
      if (next >= 60) {
        setHours((h) => Math.min(24, h + 1));
        return next % 60;
      }
      if (next < 0) {
        if (hours > 0) {
          setHours((h) => h - 1);
          return 60 + next;
        }
        return 0;
      }
      return next;
    });
  };

  const handlePreset = (presetHours: number, presetMins = 0) => {
    Haptics.selectionAsync();
    setHours(presetHours);
    setMinutes(presetMins);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(totalMinutes, quality, notes);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Log Sleep</Text>
              <Text style={styles.subtitle}>
                Target: {formatSleepDuration(goalMinutes)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Steppers */}
          <View style={styles.durationCard}>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>HOURS</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleStepHours(-1)}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease hour"
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.timeVal}>{hours}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleStepHours(1)}
                  accessibilityRole="button"
                  accessibilityLabel="Increase hour"
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.timeColon}>:</Text>

            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>MINUTES</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleStepMinutes(-15)}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease 15 minutes"
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.timeVal}>
                  {String(minutes).padStart(2, "0")}
                </Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleStepMinutes(15)}
                  accessibilityRole="button"
                  accessibilityLabel="Increase 15 minutes"
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Presets */}
          <View style={styles.presetsRow}>
            {[6, 7, 8, 9].map((p) => {
              const isActive = hours === p && minutes === 0;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.presetChip, isActive && styles.presetChipActive]}
                  onPress={() => handlePreset(p, 0)}
                  accessibilityRole="button"
                  accessibilityLabel={`${p} hours`}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isActive && styles.presetTextActive,
                    ]}
                  >
                    {p}h
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quality Select */}
          <Text style={styles.sectionHeading}>SLEEP QUALITY</Text>
          <View style={styles.qualityRow}>
            {QUALITY_OPTIONS.map((q) => {
              const isSelected = quality === q.key;
              return (
                <TouchableOpacity
                  key={q.key}
                  style={[
                    styles.qualityChip,
                    isSelected && {
                      borderColor: q.color,
                      backgroundColor: colors.surfaceLight,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setQuality(q.key);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={q.label}
                >
                  <Ionicons
                    name={q.icon}
                    size={14}
                    color={isSelected ? q.color : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.qualityText,
                      isSelected && { color: q.color, fontWeight: "700" },
                    ]}
                  >
                    {q.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Notes (Optional) */}
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes (optional, e.g. woke up once, rested)..."
            placeholderTextColor={colors.textMuted}
          />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Save Sleep"
            >
              <Text style={styles.saveText}>Save Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  durationCard: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 16,
  },
  timeGroup: {
    alignItems: "center",
    gap: 6,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  timeVal: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    minWidth: 40,
    textAlign: "center",
  },
  timeColon: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textSecondary,
    marginTop: 18,
  },
  presetsRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
  },
  presetChipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  presetTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  sectionHeading: {
    ...typography.eyebrow,
    marginTop: 4,
  },
  qualityRow: {
    flexDirection: "row",
    gap: 6,
  },
  qualityChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  qualityText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  notesInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
