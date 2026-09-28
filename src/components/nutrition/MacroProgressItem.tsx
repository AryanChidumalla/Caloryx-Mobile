import { colors } from "@/styles/global";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type MacroProgressItemProps = {
  label: string;
  consumed: number;
  goal: number;
  color: string;
  unit?: string;
};

function formatMacroNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Number(value.toFixed(1)).toString();
}

export default function MacroProgressItem({
  label,
  consumed,
  goal,
  color,
  unit = "g",
}: MacroProgressItemProps) {
  const safeGoal = Math.max(goal ?? 0, 0);
  const safeConsumed = Math.max(consumed ?? 0, 0);

  const percentage =
    safeGoal > 0 ? Math.round((safeConsumed / safeGoal) * 100) : 0;
  const progressPercent = Math.min(100, Math.max(0, percentage));
  const isExceeded = safeGoal > 0 && safeConsumed > safeGoal;
  const difference = Math.abs(safeGoal - safeConsumed);
  const displayColor = isExceeded ? colors.alert : color;

  return (
    <View style={styles.macroItem}>
      {/* Macro header */}
      <View style={styles.macroHeader}>
        <View style={styles.macroLabel}>
          <View
            style={[
              styles.colorDot,
              {
                backgroundColor: displayColor,
              },
            ]}
          />
          <Text style={styles.macroName} numberOfLines={1}>
            {label}
          </Text>
        </View>

        <Text
          style={[
            styles.macroPercentage,
            {
              color: displayColor,
            },
          ]}
        >
          {percentage}%
        </Text>
      </View>

      {/* Consumed / goal */}
      <Text style={styles.macroValue}>
        <Text style={styles.macroConsumed}>
          {formatMacroNumber(safeConsumed)}
          {unit}
        </Text>
        <Text style={styles.macroGoal}>
          {" / "}
          {formatMacroNumber(safeGoal)}
          {unit}
        </Text>
      </Text>

      {/* Progress bar */}
      <View style={styles.macroBarTrack}>
        <View
          style={[
            styles.macroBarFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: displayColor,
            },
          ]}
        />
      </View>

      {/* Remaining / exceeded */}
      <Text
        style={[styles.macroRemaining, isExceeded && styles.macroExceeded]}
        numberOfLines={1}
      >
        {isExceeded
          ? `${formatMacroNumber(difference)}${unit} over`
          : difference === 0
            ? "Goal reached"
            : `${formatMacroNumber(difference)}${unit} left`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  macroItem: {
    flex: 1,
  },
  macroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  macroLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  macroPercentage: {
    fontSize: 12,
    fontWeight: "800",
  },
  macroValue: {
    marginBottom: 6,
  },
  macroConsumed: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  macroGoal: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  macroBarTrack: {
    height: 4,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  macroBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  macroRemaining: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
  },
  macroExceeded: {
    color: colors.alert,
  },
});
