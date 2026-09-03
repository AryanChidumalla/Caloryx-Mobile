import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function UpdateGoalsButton() {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push("/profile/goals")}
      activeOpacity={0.7}
    >
      <Ionicons name="options-outline" size={18} color={colors.background} />
      <Text style={styles.text}>Update Goals & Body Stats</Text>
      <Ionicons name="arrow-forward" size={16} color={colors.background} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 4,
    marginBottom: 24,
  },
  text: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.background,
  },
});
