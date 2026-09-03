import { colors } from "@/styles/global";
import { WorkoutSession } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type WorkoutHistoryCardProps = {
  session: WorkoutSession;
  onDelete: (id: string) => void;
  onEdit?: (session: WorkoutSession) => void;
};

export default function WorkoutHistoryCard({
  session,
  onDelete,
  onEdit,
}: WorkoutHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mins = Math.round((session.durationSeconds || 0) / 60);
  const totalSets = session.exercises.reduce(
    (acc, ex) => acc + (ex.sets?.length || 0),
    0,
  );

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Workout",
      `Delete workout session "${session.name}" from your history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(session.id),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setIsExpanded((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionDate}>
            {formatDate(session.completedAt || session.startedAt)}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onEdit(session)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={15} color={colors.alert} />
          </TouchableOpacity>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.metricText}>
            {mins > 0 ? `${mins} min` : "<1 min"}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Ionicons name="barbell-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.metricText}>
            {session.exercises.length}{" "}
            {session.exercises.length === 1 ? "exercise" : "exercises"}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Ionicons name="layers-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.metricText}>{totalSets} sets</Text>
        </View>
        {session.totalVolumeKg > 0 && (
          <>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Ionicons name="trophy-outline" size={13} color={colors.protein} />
              <Text style={[styles.metricText, { color: colors.protein }]}>
                {session.totalVolumeKg.toLocaleString()} kg
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Expanded Exercises Breakdown */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          {session.exercises.map((ex, idx) => (
            <View key={ex.id || `hist-ex-${idx}`} style={styles.expandedExercise}>
              <Text style={styles.exNameText}>
                {idx + 1}. {ex.exerciseName}
              </Text>
              <View style={styles.setsWrap}>
                {ex.sets.map((set, sIdx) => (
                  <View key={set.id || `hist-set-${sIdx}`} style={styles.setChip}>
                    <Text style={styles.setChipText}>
                      {set.weightKg > 0 ? `${set.weightKg}kg × ` : ""}
                      {set.durationSeconds
                        ? `${set.durationSeconds}s`
                        : `${set.reps}r`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  deleteBtn: {
    padding: 4,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  metricDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.surfaceBorder,
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    gap: 10,
  },
  expandedExercise: {
    gap: 4,
  },
  exNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  setsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  setChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  setChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
