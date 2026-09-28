import { colors } from "@/styles/global";
import { DailyGoals } from "@/types/nutrition";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type CalorieMacroPreviewProps = {
  targetCalories: number;
  bmr: number;
  tdee: number;
  macros: DailyGoals;
};

export default function CalorieMacroPreview({
  targetCalories,
  bmr,
  tdee,
  macros,
}: CalorieMacroPreviewProps) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeaderRow}>
        <View style={styles.resultTitleContent}>
          <Text style={styles.resultEyebrow}>YOUR CALCULATED PLAN</Text>
          <Text style={styles.resultCalories}>
            {targetCalories.toLocaleString()}
          </Text>
          <Text style={styles.resultUnit}>kcal / day</Text>
        </View>

        <View style={styles.calculationBadge}>
          <Ionicons
            name="calculator-outline"
            size={14}
            color={colors.primary}
          />
          <Text style={styles.calculationBadgeText}>Live</Text>
        </View>
      </View>

      <View style={styles.resultMeta}>
        <View style={styles.resultMetaItem}>
          <Text style={styles.resultMetaLabel}>BMR</Text>
          <Text style={styles.resultMetaValue}>{bmr}</Text>
        </View>

        <View style={styles.resultMetaDivider} />

        <View style={styles.resultMetaItem}>
          <Text style={styles.resultMetaLabel}>TDEE</Text>
          <Text style={styles.resultMetaValue}>{tdee}</Text>
        </View>
      </View>

      <View style={styles.resultDivider} />

      <View style={styles.macroSplitRow}>
        <MacroTag
          color={colors.protein}
          label="Protein"
          percentage="30%"
          value={`${macros.protein}g`}
        />

        <MacroTag
          color={colors.carbs}
          label="Carbs"
          percentage="40%"
          value={`${macros.carbs}g`}
        />

        <MacroTag
          color={colors.fat}
          label="Fat"
          percentage="30%"
          value={`${macros.fat}g`}
        />
      </View>
    </View>
  );
}

type MacroTagProps = {
  color: string;
  label: string;
  percentage: string;
  value: string;
};

function MacroTag({ color, label, percentage, value }: MacroTagProps) {
  return (
    <View style={styles.macroSplitCol}>
      <View style={styles.macroTagRow}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Text style={styles.macroTagLabel}>{label}</Text>
        <Text style={styles.macroPercentage}>{percentage}</Text>
      </View>
      <Text style={styles.macroTagVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 18,
    marginBottom: 20,
  },
  resultHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  resultTitleContent: {
    flex: 1,
  },
  resultEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.primary,
    marginBottom: 4,
  },
  resultCalories: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  resultUnit: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    marginTop: -2,
  },
  calculationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  calculationBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  resultMetaItem: {
    flex: 1,
    alignItems: "center",
  },
  resultMetaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  resultMetaValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  resultMetaDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.surfaceBorder,
  },
  resultDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 16,
  },
  macroSplitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroSplitCol: {
    flex: 1,
    alignItems: "center",
  },
  macroTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroTagLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  macroPercentage: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.textMuted,
  },
  macroTagVal: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
});
