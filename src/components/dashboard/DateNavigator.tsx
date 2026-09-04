import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import { formatDateForDisplay, isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DateNavigator() {
  const { selectedDate, goToPreviousDay, goToNextDay, goToToday } =
    useNutrition();

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToPreviousDay();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToNextDay();
  };

  const handleToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    goToToday();
  };

  const dateLabel = formatDateForDisplay(selectedDate);
  const currentlyToday = isToday(selectedDate);

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={handlePrev}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.centerSection}>
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={handleNext}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!currentlyToday && (
        <TouchableOpacity style={styles.todayPill} onPress={handleToday}>
          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
          <Text style={styles.todayPillText}>Jump to Today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 16,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: "100%",
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.2,
  },
  todayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  todayPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
});
