import { colors } from "@/styles/global";
import { ActivityLevel } from "@/types/nutrition";
import { ACTIVITY_OPTIONS } from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ActivitySectionProps = {
  activity: ActivityLevel;
  onActivityChange: (activity: ActivityLevel) => void;
};

export default function ActivitySection({
  activity,
  onActivityChange,
}: ActivitySectionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Activity Level</Text>
          <Text style={styles.cardSubtitle}>
            Helps personalize your calorie and step targets
          </Text>
        </View>

        <View style={styles.sectionIcon}>
          <Ionicons name="fitness-outline" size={17} color={colors.primary} />
        </View>
      </View>

      <View style={styles.optionsList}>
        {ACTIVITY_OPTIONS.map((item) => {
          const isSelected = activity === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[styles.optionCard, isSelected && styles.optionCardActive]}
              onPress={() => {
                Haptics.selectionAsync();
                onActivityChange(item.value);
              }}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterActive,
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>

              <View style={styles.optionContent}>
                <View style={styles.optionHeaderRow}>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  <Text style={styles.multiplierBadge}>{item.multiplier}x</Text>
                </View>
                <Text style={styles.optionDesc}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    gap: 12,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  multiplierBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
});
