import { colors } from "@/styles/global";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MacroCardProps = {
  label: string;
  value: string;
  goal: string;
  color: string;
};

export default function MacroCard({
  label,
  value,
  goal,
  color,
}: MacroCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.goal}>/ {goal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    width: "48%",
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  goal: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
