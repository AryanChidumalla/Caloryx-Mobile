import { colors } from "@/styles/global";
import { Sex } from "@/types/nutrition";
import { SEX_OPTIONS } from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type BodyStatsSectionProps = {
  sex: Sex;
  onSexChange: (sex: Sex) => void;
  age: string;
  onAgeChange: (age: string) => void;
  height: string;
  onHeightChange: (height: string) => void;
  weight: string;
  onWeightChange: (weight: string) => void;
};

export default function BodyStatsSection({
  sex,
  onSexChange,
  age,
  onAgeChange,
  height,
  onHeightChange,
  weight,
  onWeightChange,
}: BodyStatsSectionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Body Stats</Text>
          <Text style={styles.cardSubtitle}>
            Used to calculate your energy needs
          </Text>
        </View>

        <View style={styles.sectionIcon}>
          <Ionicons name="body-outline" size={17} color={colors.primary} />
        </View>
      </View>

      <Text style={styles.inputLabel}>Biological Sex</Text>

      <View style={styles.segmentRow}>
        {SEX_OPTIONS.map((item) => {
          const isSelected = sex === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                onSexChange(item.value);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="25"
            placeholderTextColor={colors.textMuted}
            value={age}
            onChangeText={onAgeChange}
          />
        </View>

        <View style={styles.statCol}>
          <Text style={styles.inputLabel}>Height</Text>
          <View style={styles.inputWithUnit}>
            <TextInput
              style={styles.unitInput}
              keyboardType="numeric"
              placeholder="175"
              placeholderTextColor={colors.textMuted}
              value={height}
              onChangeText={onHeightChange}
            />
            <Text style={styles.inputUnit}>cm</Text>
          </View>
        </View>

        <View style={styles.statCol}>
          <Text style={styles.inputLabel}>Weight</Text>
          <View style={styles.inputWithUnit}>
            <TextInput
              style={styles.unitInput}
              keyboardType="numeric"
              placeholder="70"
              placeholderTextColor={colors.textMuted}
              value={weight}
              onChangeText={onWeightChange}
            />
            <Text style={styles.inputUnit}>kg</Text>
          </View>
        </View>
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
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.background,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCol: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingRight: 10,
  },
  unitInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  inputUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
});
