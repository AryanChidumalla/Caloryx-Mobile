import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

export type StepsProgressRingProps = {
  steps: number;
  progressRatio: number;
  activityMessage: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    color: string;
  };
};

const RING_SIZE = 190;
const RING_STROKE = 13;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function StepsProgressRing({
  steps,
  progressRatio,
  activityMessage,
}: StepsProgressRingProps) {
  const ringOffset = RING_CIRCUMFERENCE * (1 - progressRatio);

  return (
    <View style={styles.ringWrapper}>
      <View style={styles.svgContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <Defs>
            <LinearGradient id="stepsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#818CF8" />
              <Stop offset="100%" stopColor="#C084FC" />
            </LinearGradient>
          </Defs>

          {/* Background track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.surfaceBorder}
            strokeWidth={RING_STROKE}
            fill="none"
            opacity={0.4}
          />

          {/* Progress circle */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="url(#stepsGradient)"
            strokeWidth={RING_STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${RING_CIRCUMFERENCE}`}
            strokeDashoffset={ringOffset}
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.ringCenterContent}>
          <Text style={styles.stepCountText}>{steps.toLocaleString()}</Text>
          <Text style={styles.stepsLabelText}>STEPS</Text>

          <View style={styles.activityMessageBadge}>
            <Ionicons
              name={activityMessage.icon}
              size={12}
              color={activityMessage.color}
            />
            <Text
              style={[
                styles.activityMessageText,
                { color: activityMessage.color },
              ]}
              numberOfLines={1}
            >
              {activityMessage.text}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ringWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  svgContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenterContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  stepCountText: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -1,
  },
  stepsLabelText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 1,
  },
  activityMessageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    maxWidth: 140,
  },
  activityMessageText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
