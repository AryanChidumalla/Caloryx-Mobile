import ScreenHeader from "@/components/common/ScreenHeader";
import { colors } from "@/styles/global";
import { formatDateForDisplay } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type NutritionDateHeaderProps = {
  displayName: string;
  selectedDate: string;
  isToday: boolean;
  onGoToToday: () => void;
};

export default function NutritionDateHeader({
  displayName,
  selectedDate,
  isToday,
  onGoToToday,
}: NutritionDateHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Screen Title & Action */}
      <ScreenHeader
        title="Nutrition"
        subtitle="Daily meals, macro tracking & foods"
        rightAction={
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => router.push("/(tabs)/meals")}
            accessibilityRole="button"
            accessibilityLabel="View meal history"
          >
            <Ionicons name="time-outline" size={15} color={colors.text} />
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
        }
      />

      {/* Greeting and Date Bar */}
      <View style={styles.greetingBar}>
        <View>
          <Text style={styles.greetingText}>Hello, {displayName}</Text>
          <Text style={styles.dateLabelText}>
            {formatDateForDisplay(selectedDate)}
          </Text>
        </View>

        {!isToday && (
          <TouchableOpacity
            style={styles.jumpTodayBtn}
            onPress={onGoToToday}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
          >
            <Ionicons name="today-outline" size={13} color={colors.primary} />
            <Text style={styles.jumpTodayText}>Today</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  greetingBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.3,
  },
  dateLabelText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  jumpTodayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  jumpTodayText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
