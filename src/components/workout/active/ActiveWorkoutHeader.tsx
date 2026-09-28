import { colors } from "@/styles/global";
import { formatWorkoutTimer } from "@/utils/workoutCalculations";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type ActiveWorkoutHeaderProps = {
  workoutName: string;
  durationSeconds: number;
  isFinishing: boolean;
  onUpdateWorkoutName: (name: string) => void;
  onFinish: () => void;
  onCancel: () => void;
};

export default function ActiveWorkoutHeader({
  workoutName,
  durationSeconds,
  isFinishing,
  onUpdateWorkoutName,
  onFinish,
  onCancel,
}: ActiveWorkoutHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState(workoutName);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    const trimmed = workoutTitle.trim();
    if (trimmed && trimmed !== workoutName) {
      onUpdateWorkoutName(trimmed);
    } else {
      setWorkoutTitle(workoutName);
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onCancel}
        disabled={isFinishing}
      >
        <Text style={styles.discardText}>Discard</Text>
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        {isEditingTitle ? (
          <TextInput
            style={styles.titleInput}
            value={workoutTitle}
            onChangeText={setWorkoutTitle}
            autoFocus
            onBlur={handleTitleSubmit}
            onSubmitEditing={handleTitleSubmit}
          />
        ) : (
          <TouchableOpacity
            onPress={() => {
              setWorkoutTitle(workoutName);
              setIsEditingTitle(true);
            }}
          >
            <Text style={styles.workoutTitle} numberOfLines={1}>
              {workoutName}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timer}>{formatWorkoutTimer(durationSeconds)}</Text>
      </View>

      <TouchableOpacity
        style={styles.finishButton}
        onPress={onFinish}
        disabled={isFinishing}
      >
        {isFinishing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.finishText}>Finish</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colors.alert,
    fontSize: 15,
    fontWeight: "600",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  workoutTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  titleInput: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF",
    paddingBottom: 2,
    minWidth: 120,
  },
  timer: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  finishButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  finishText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
