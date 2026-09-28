import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ActiveNutritionTab = "search" | "manual" | "saved";

type AddMealTabsProps = {
  activeTab: ActiveNutritionTab;
  onTabChange: (tab: ActiveNutritionTab) => void;
};

type TabButtonProps = {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function TabButton({ active, icon, label, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.segmentButton, active && styles.segmentButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={15}
        color={active ? colors.accent : colors.textSecondary}
      />
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function AddMealTabs({
  activeTab,
  onTabChange,
}: AddMealTabsProps) {
  return (
    <View style={styles.segmentContainer}>
      <TabButton
        active={activeTab === "search"}
        icon="search-outline"
        label="Search Database"
        onPress={() => onTabChange("search")}
      />
      <TabButton
        active={activeTab === "manual"}
        icon="create-outline"
        label="Meal Form"
        onPress={() => onTabChange("manual")}
      />
      <TabButton
        active={activeTab === "saved"}
        icon="bookmark-outline"
        label="Saved Foods"
        onPress={() => onTabChange("saved")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: colors.accentMuted,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.accent,
  },
});
