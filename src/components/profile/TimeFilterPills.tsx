import { colors } from "@/styles/global";
import { TimeFilter } from "@/types/health";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TimeFilterPillsProps = {
  selected: TimeFilter;
  onSelect: (filter: TimeFilter) => void;
};

const FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "3 Months" },
];

export default function TimeFilterPills({
  selected,
  onSelect,
}: TimeFilterPillsProps) {
  const handlePress = (f: TimeFilter) => {
    if (f !== selected) {
      Haptics.selectionAsync();
      onSelect(f);
    }
  };

  return (
    <View style={styles.container}>
      {FILTERS.map((f) => {
        const isSelected = selected === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            style={[styles.pill, isSelected && styles.pillActive]}
            onPress={() => handlePress(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 3,
    marginBottom: 16,
    gap: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 9,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.background,
    fontWeight: "800",
  },
});
