import { colors } from "@/styles/global";
import { RangeNutritionSummary } from "@/types/health";
import { DailyGoals } from "@/types/nutrition";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MacroProgressCardProps = {
  summary: RangeNutritionSummary;
  goals: DailyGoals;
};

export default function MacroProgressCard({
  summary,
  goals,
}: MacroProgressCardProps) {
  const hasData = summary.daysLogged > 0;

  // Calculate actual macro caloric contribution percentages
  const proteinCals = summary.averageProtein * 4;
  const carbsCals = summary.averageCarbs * 4;
  const fatCals = summary.averageFat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

  const proteinPct =
    totalMacroCals > 0 ? Math.round((proteinCals / totalMacroCals) * 100) : 0;
  const carbsPct =
    totalMacroCals > 0 ? Math.round((carbsCals / totalMacroCals) * 100) : 0;
  const fatPct =
    totalMacroCals > 0 ? Math.round((fatCals / totalMacroCals) * 100) : 0;

  const proteinGoalPct =
    goals.protein > 0
      ? Math.min(100, Math.round((summary.averageProtein / goals.protein) * 100))
      : 0;
  const carbsGoalPct =
    goals.carbs > 0
      ? Math.min(100, Math.round((summary.averageCarbs / goals.carbs) * 100))
      : 0;
  const fatGoalPct =
    goals.fat > 0
      ? Math.min(100, Math.round((summary.averageFat / goals.fat) * 100))
      : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Macronutrient Breakdown</Text>
          <Text style={styles.subtitle}>
            {hasData
              ? `Average daily macro intake over ${summary.daysLogged} days`
              : "No macro data recorded"}
          </Text>
        </View>

        {hasData && (
          <View style={styles.splitBadge}>
            <Text style={styles.splitText}>
              {proteinPct}P / {carbsPct}C / {fatPct}F
            </Text>
          </View>
        )}
      </View>

      {!hasData ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pie-chart-outline" size={28} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No macronutrient history</Text>
          <Text style={styles.emptySub}>
            Logged foods will automatically generate your average protein, carbs,
            and fat split here.
          </Text>
        </View>
      ) : (
        <View style={styles.macrosList}>
          {/* Protein */}
          <View style={styles.macroRow}>
            <View style={styles.macroMeta}>
              <View style={styles.macroTag}>
                <View
                  style={[
                    styles.macroDot,
                    { backgroundColor: colors.protein },
                  ]}
                />
                <Text style={styles.macroName}>Protein</Text>
              </View>
              <Text style={styles.macroStats}>
                {summary.averageProtein}g{" "}
                <Text style={styles.goalRef}>/ {goals.protein}g ({proteinGoalPct}%)</Text>
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${proteinGoalPct}%`,
                    backgroundColor: colors.protein,
                  },
                ]}
              />
            </View>
          </View>

          {/* Carbs */}
          <View style={styles.macroRow}>
            <View style={styles.macroMeta}>
              <View style={styles.macroTag}>
                <View
                  style={[
                    styles.macroDot,
                    { backgroundColor: colors.carbs },
                  ]}
                />
                <Text style={styles.macroName}>Carbohydrates</Text>
              </View>
              <Text style={styles.macroStats}>
                {summary.averageCarbs}g{" "}
                <Text style={styles.goalRef}>/ {goals.carbs}g ({carbsGoalPct}%)</Text>
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${carbsGoalPct}%`,
                    backgroundColor: colors.carbs,
                  },
                ]}
              />
            </View>
          </View>

          {/* Fat */}
          <View style={styles.macroRow}>
            <View style={styles.macroMeta}>
              <View style={styles.macroTag}>
                <View
                  style={[
                    styles.macroDot,
                    { backgroundColor: colors.fat },
                  ]}
                />
                <Text style={styles.macroName}>Fats</Text>
              </View>
              <Text style={styles.macroStats}>
                {summary.averageFat}g{" "}
                <Text style={styles.goalRef}>/ {goals.fat}g ({fatGoalPct}%)</Text>
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${fatGoalPct}%`,
                    backgroundColor: colors.fat,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  splitBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  splitText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  macrosList: {
    gap: 12,
    marginTop: 4,
  },
  macroRow: {
    gap: 6,
  },
  macroMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  macroStats: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
  goalRef: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});
