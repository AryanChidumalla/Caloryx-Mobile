import MacroProgressItem from "@/components/nutrition/MacroProgressItem";
import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NutritionOverview() {
  const { dailyTotals, goals, remainingMacros, percentages } = useNutrition();

  const isExceeded = remainingMacros.isCalorieExceeded;

  const progressRatio = Math.min(
    1,
    goals.calories > 0 ? dailyTotals.calories / goals.calories : 0,
  );

  const progressPercent = Math.round(progressRatio * 100);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* ─────────────────────────────
            Header
        ───────────────────────────── */}

        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="flame" size={17} color={colors.calories} />
            </View>

            <View>
              <Text style={styles.title}>Nutrition</Text>
              <Text style={styles.subtitle}>{"Today's progress"}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logButton}
            onPress={() => router.navigate("/(tabs)/nutrition")}
            activeOpacity={0.75}
            accessibilityLabel="Log food"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={15} color={colors.background} />

            <Text style={styles.logButtonText}>Log food</Text>
          </TouchableOpacity>
        </View>

        {/* ─────────────────────────────
            Calories
        ───────────────────────────── */}

        <View style={styles.calorieSection}>
          <View style={styles.calorieTopRow}>
            <View>
              <Text style={styles.calorieEyebrow}>
                {isExceeded ? "OVER GOAL" : "REMAINING"}
              </Text>

              <View style={styles.calorieValueRow}>
                <Text
                  style={[
                    styles.calorieValue,
                    isExceeded && styles.exceededValue,
                  ]}
                >
                  {isExceeded
                    ? `+${remainingMacros.calories}`
                    : remainingMacros.calories}
                </Text>

                <Text
                  style={[
                    styles.calorieUnit,
                    isExceeded && styles.exceededLabel,
                  ]}
                >
                  kcal
                </Text>
              </View>
            </View>

            <View style={styles.calorieTarget}>
              <Text style={styles.targetLabel}>Daily target</Text>

              <Text style={styles.targetValue}>
                {goals.calories}
                <Text style={styles.targetUnit}> kcal</Text>
              </Text>
            </View>
          </View>

          {/* Calorie progress */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: isExceeded ? colors.alert : colors.calories,
                },
              ]}
            />
          </View>

          <View style={styles.calorieFooter}>
            <Text style={styles.footerText}>
              {dailyTotals.calories} kcal eaten
            </Text>

            <Text
              style={[
                styles.percentageText,
                isExceeded && styles.exceededLabel,
              ]}
            >
              {percentages.calories}%
            </Text>
          </View>
        </View>

        {/* ─────────────────────────────
            Small divider
        ───────────────────────────── */}

        <View style={styles.divider} />

        {/* ─────────────────────────────
            Horizontal Macros
        ───────────────────────────── */}

        <View style={styles.macroSection}>
          <MacroProgressItem
            label="Protein"
            consumed={dailyTotals.protein}
            goal={goals.protein}
            color={colors.protein}
          />

          <View style={styles.macroDivider} />

          <MacroProgressItem
            label="Carbs"
            consumed={dailyTotals.carbs}
            goal={goals.carbs}
            color={colors.carbs}
          />

          <View style={styles.macroDivider} />

          <MacroProgressItem
            label="Fat"
            consumed={dailyTotals.fat}
            goal={goals.fat}
            color={colors.fat}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  // ─────────────────────────────────────
  // Main Card
  // ─────────────────────────────────────

  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 18,
  },

  // ─────────────────────────────────────
  // Header
  // ─────────────────────────────────────

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.caloriesMuted,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
    marginTop: 1,
  },

  logButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },

  logButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.background,
  },

  // ─────────────────────────────────────
  // Calories
  // ─────────────────────────────────────

  calorieSection: {
    paddingBottom: 16,
  },

  calorieTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  calorieEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: colors.textMuted,
    marginBottom: 2,
  },

  calorieValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  calorieValue: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -1.5,
  },

  calorieUnit: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginLeft: 5,
  },

  exceededValue: {
    color: colors.alert,
  },

  exceededLabel: {
    color: colors.alert,
  },

  calorieTarget: {
    alignItems: "flex-end",
    paddingTop: 3,
  },

  targetLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textMuted,
  },

  targetValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },

  targetUnit: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  progressTrack: {
    height: 8,
    width: "100%",
    backgroundColor: colors.surfaceBorder,
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  calorieFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  percentageText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.calories,
  },

  // ─────────────────────────────────────
  // Divider
  // ─────────────────────────────────────

  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginTop: 14,
    marginBottom: 12,
  },

  // ─────────────────────────────────────
  // Horizontal Macros
  // ─────────────────────────────────────

  macroSection: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },

  macroDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 4,
  },
});
