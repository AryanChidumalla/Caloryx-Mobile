import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { MuscleDistribution } from "@/types/workout";
import { calculateMuscleDistribution } from "@/utils/workoutCalculations";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type MuscleDistributionModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  exercisesList: {
    exerciseId?: string;
    exerciseName: string;
    setsCount?: number;
  }[];
};

const DISTRIBUTION_COLORS = [
  "#3B82F6", // Primary Blue
  "#818CF8", // Indigo
  "#38BDF8", // Sky
  "#34D399", // Emerald
  "#F59E0B", // Amber
  "#A78BFA", // Purple
  "#EC4899", // Pink
  "#F97316", // Orange
];

export default function MuscleDistributionModal({
  visible,
  onClose,
  title = "Muscle Distribution",
  exercisesList,
}: MuscleDistributionModalProps) {
  const { exercises: allExercises } = useWorkout();

  const distribution: MuscleDistribution[] = useMemo(() => {
    return calculateMuscleDistribution(exercisesList, allExercises);
  }, [exercisesList, allExercises]);

  const totalExercises = exercisesList.length;
  const totalSets = exercisesList.reduce(
    (sum, ex) => sum + (ex.setsCount || 1),
    0,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="body-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.sheetTitle}>{title}</Text>
                <Text style={styles.sheetSubtitle}>
                  {totalExercises} {totalExercises === 1 ? "exercise" : "exercises"} •{" "}
                  {totalSets} {totalSets === 1 ? "set" : "sets"} •{" "}
                  {distribution.length} muscle {distribution.length === 1 ? "group" : "groups"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Distribution Stacked Bar */}
          {distribution.length > 0 ? (
            <View style={styles.stackedBarContainer}>
              <View style={styles.stackedBar}>
                {distribution.map((item, idx) => {
                  const color =
                    DISTRIBUTION_COLORS[idx % DISTRIBUTION_COLORS.length];
                  return (
                    <View
                      key={item.muscle}
                      style={[
                        styles.barSegment,
                        {
                          flex: item.percentage,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Muscle breakdown list */}
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {distribution.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="barbell-outline"
                  size={36}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyText}>
                  Add exercises to view targeted muscle distribution
                </Text>
              </View>
            ) : (
              distribution.map((item, idx) => {
                const color =
                  DISTRIBUTION_COLORS[idx % DISTRIBUTION_COLORS.length];
                return (
                  <View key={item.muscle} style={styles.muscleCard}>
                    <View style={styles.muscleTopRow}>
                      <View style={styles.muscleNameWrap}>
                        <View
                          style={[
                            styles.colorIndicator,
                            { backgroundColor: color },
                          ]}
                        />
                        <Text style={styles.muscleName}>{item.muscle}</Text>
                      </View>

                      <View style={styles.muscleStatsWrap}>
                        <Text style={styles.percentText}>{item.percentage}%</Text>
                        <Text style={styles.setsText}>
                          {item.count} {item.count === 1 ? "set" : "sets"}
                        </Text>
                      </View>
                    </View>

                    {/* Progress line */}
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, item.percentage)}%`,
                            backgroundColor: color,
                          },
                        ]}
                      />
                    </View>

                    {/* Contributing exercises */}
                    <View style={styles.exercisesList}>
                      {item.exercises.map((name) => (
                        <View key={name} style={styles.exercisePill}>
                          <Text style={styles.exercisePillText} numberOfLines={1}>
                            {name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Done Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: "82%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  stackedBarContainer: {
    marginBottom: 16,
  },
  stackedBar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: colors.surfaceBorder,
    gap: 2,
  },
  barSegment: {
    height: "100%",
    borderRadius: 3,
  },
  listContainer: {
    maxHeight: 380,
  },
  listContent: {
    paddingBottom: 12,
    gap: 12,
  },
  muscleCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  muscleTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  muscleNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  muscleName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  muscleStatsWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  percentText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  setsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  exercisesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  exercisePill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    maxWidth: "100%",
  },
  exercisePillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 240,
  },
  doneBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
});
