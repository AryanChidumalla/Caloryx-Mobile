import { colors } from "@/styles/global";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export type CalorieProgressRingProps = {
  calories: number;
  calorieGoal: number;
};

export default function CalorieProgressRing({
  calories,
  calorieGoal,
}: CalorieProgressRingProps) {
  const safeGoal = Math.max(calorieGoal ?? 0, 1);
  const safeCalories = Math.max(calories ?? 0, 0);

  const ratio = safeCalories / safeGoal;
  const progress = Math.min(1, Math.max(0, ratio));
  const isOver = safeCalories > safeGoal;
  const difference = Math.abs(safeGoal - safeCalories);
  const ringColor = isOver ? colors.alert : colors.accent;

  const ringRadius = 78;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progress);

  return (
    <View style={styles.ringContainer}>
      <Svg width={210} height={210} viewBox="0 0 210 210">
        {/* Outer background ring */}
        <Circle
          cx="105"
          cy="105"
          r={ringRadius}
          stroke={colors.surfaceBorder}
          strokeWidth="12"
          fill="none"
          opacity={0.45}
        />

        {/* Progress ring */}
        <Circle
          cx="105"
          cy="105"
          r={ringRadius}
          stroke={ringColor}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${ringCircumference}`}
          strokeDashoffset={ringOffset}
          rotation="-90"
          origin="105, 105"
        />

        {/* Inner subtle guide ring */}
        <Circle
          cx="105"
          cy="105"
          r="64"
          stroke={colors.surfaceBorder}
          strokeWidth="1"
          fill="none"
          opacity={0.5}
        />
      </Svg>

      {/* Ring center content */}
      <View style={styles.ringCenter}>
        <Text style={styles.calorieEyebrow}>
          {isOver ? "OVER GOAL" : "CALORIES"}
        </Text>

        <Text style={[styles.calorieValue, isOver && styles.exceededValue]}>
          {safeCalories}
        </Text>

        <Text style={styles.calorieUnit}>kcal</Text>

        <View style={styles.goalLine}>
          <Text style={[styles.goalText, isOver && styles.exceededLabel]}>
            {isOver
              ? `${difference} kcal over`
              : `${difference} kcal remaining`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ringContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  calorieEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 2,
  },
  calorieValue: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -1.5,
    color: colors.text,
  },
  exceededValue: {
    color: colors.alert,
  },
  calorieUnit: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginTop: -1,
  },
  goalLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  goalText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  exceededLabel: {
    color: colors.alert,
  },
});
