import { colors } from "@/styles/global";
import { ExerciseSet, SetType } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SetRowProps = {
  set: ExerciseSet;
  isTimed?: boolean;
  onUpdate: (updates: Partial<ExerciseSet>) => void;
  onToggleComplete: () => void;
  onDelete: () => void;
};

export default function SetRow({
  set,
  isTimed,
  onUpdate,
  onToggleComplete,
  onDelete,
}: SetRowProps) {
  const handleToggleType = () => {
    Haptics.selectionAsync();
    const cycle: SetType[] = ["regular", "warmup", "drop", "failure"];
    const currentIdx = cycle.indexOf(set.setType);
    const nextType = cycle[(currentIdx + 1) % cycle.length];
    onUpdate({ setType: nextType });
  };

  const getTypeLabel = (type: SetType) => {
    switch (type) {
      case "warmup":
        return "W";
      case "drop":
        return "D";
      case "failure":
        return "F";
      default:
        return String(set.setNumber);
    }
  };

  return (
    <View style={[styles.row, set.completed && styles.rowCompleted]}>
      {/* Set Number / Type button */}
      <TouchableOpacity
        style={[
          styles.setTypeBadge,
          set.setType === "warmup" && styles.warmupBadge,
          set.setType === "drop" && styles.dropBadge,
          set.setType === "failure" && styles.failureBadge,
        ]}
        onPress={handleToggleType}
      >
        <Text
          style={[
            styles.setTypeText,
            set.setType !== "regular" && styles.specialTypeText,
          ]}
        >
          {getTypeLabel(set.setType)}
        </Text>
      </TouchableOpacity>

      {/* Weight Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, set.completed && styles.inputCompleted]}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          value={set.weightKg > 0 ? String(set.weightKg) : ""}
          onChangeText={(val) => {
            const num = parseFloat(val);
            onUpdate({ weightKg: isNaN(num) ? 0 : num });
          }}
        />
        <Text style={styles.inputUnit}>kg</Text>
      </View>

      {/* Reps or Duration Input */}
      {isTimed ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, set.completed && styles.inputCompleted]}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor={colors.textMuted}
            value={
              set.durationSeconds && set.durationSeconds > 0
                ? String(set.durationSeconds)
                : ""
            }
            onChangeText={(val) => {
              const num = parseInt(val);
              onUpdate({ durationSeconds: isNaN(num) ? 0 : num });
            }}
          />
          <Text style={styles.inputUnit}>sec</Text>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, set.completed && styles.inputCompleted]}
            keyboardType="numeric"
            placeholder="10"
            placeholderTextColor={colors.textMuted}
            value={set.reps > 0 ? String(set.reps) : ""}
            onChangeText={(val) => {
              const num = parseInt(val);
              onUpdate({ reps: isNaN(num) ? 0 : num });
            }}
          />
          <Text style={styles.inputUnit}>reps</Text>
        </View>
      )}

      {/* Completed Checkmark Button */}
      <TouchableOpacity
        style={[styles.checkButton, set.completed && styles.checkButtonActive]}
        onPress={onToggleComplete}
        activeOpacity={0.7}
      >
        <Ionicons
          name={set.completed ? "checkmark" : "checkmark-outline"}
          size={16}
          color={set.completed ? "#0A0A0A" : colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Delete set option */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={14} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    marginBottom: 6,
    gap: 8,
  },
  rowCompleted: {
    backgroundColor: "rgba(52, 211, 153, 0.08)",
  },
  setTypeBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  warmupBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
  },
  dropBadge: {
    backgroundColor: "rgba(167, 139, 250, 0.2)",
  },
  failureBadge: {
    backgroundColor: "rgba(248, 113, 113, 0.2)",
  },
  setTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  specialTypeText: {
    color: colors.text,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    padding: 0,
  },
  inputCompleted: {
    color: colors.protein,
  },
  inputUnit: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  checkButtonActive: {
    backgroundColor: colors.protein,
    borderColor: colors.protein,
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
