import { colors } from "@/styles/global";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type SummarySectionProps = {
  isCurrentDateToday: boolean;
  dailyTotals: any;
  goals: any;
};

type MacroItemProps = {
  label: string;
  consumed: number;
  goal: number;
  color: string;
};

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Number(value.toFixed(1)).toString();
}

function MacroItem({ label, consumed, goal, color }: MacroItemProps) {
  const safeGoal = Math.max(goal ?? 0, 0);
  const safeConsumed = Math.max(consumed ?? 0, 0);

  const percentage =
    safeGoal > 0 ? Math.round((safeConsumed / safeGoal) * 100) : 0;

  const progressPercent = Math.min(100, Math.max(0, percentage));

  const isExceeded = safeGoal > 0 && safeConsumed > safeGoal;

  const difference = Math.abs(safeGoal - safeConsumed);

  const displayColor = isExceeded ? colors.alert : color;

  return (
    <View style={styles.macroItem}>
      {/* Macro header */}
      <View style={styles.macroHeader}>
        <View style={styles.macroLabel}>
          <View
            style={[
              styles.colorDot,
              {
                backgroundColor: displayColor,
              },
            ]}
          />

          <Text style={styles.macroName} numberOfLines={1}>
            {label}
          </Text>
        </View>

        <Text
          style={[
            styles.macroPercentage,
            {
              color: displayColor,
            },
          ]}
        >
          {percentage}%
        </Text>
      </View>

      {/* Consumed / goal */}
      <Text style={styles.macroValue}>
        <Text style={styles.macroConsumed}>{formatNumber(safeConsumed)}g</Text>

        <Text style={styles.macroGoal}>
          {" / "}
          {formatNumber(safeGoal)}g
        </Text>
      </Text>

      {/* Progress bar */}
      <View style={styles.macroBarTrack}>
        <View
          style={[
            styles.macroBarFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: displayColor,
            },
          ]}
        />
      </View>

      {/* Remaining / exceeded */}
      <Text
        style={[styles.macroRemaining, isExceeded && styles.macroExceeded]}
        numberOfLines={1}
      >
        {isExceeded
          ? `${formatNumber(difference)}g over`
          : difference === 0
            ? "Goal reached"
            : `${formatNumber(difference)}g left`}
      </Text>
    </View>
  );
}

export default function SummarySection({
  isCurrentDateToday: _isCurrentDateToday,
  dailyTotals,
  goals,
}: SummarySectionProps) {
  // ─────────────────────────────────────
  // Calories
  // ─────────────────────────────────────

  const calories = Math.max(dailyTotals?.calories ?? 0, 0);

  const calorieGoal = Math.max(goals?.calories ?? 0, 1);

  const calorieRatio = calories / calorieGoal;

  const caloriePercentage = Math.round(calorieRatio * 100);

  const calorieProgress = Math.min(1, Math.max(0, calorieRatio));

  const isCalorieOver = calories > calorieGoal;

  const calorieDifference = Math.abs(calorieGoal - calories);

  const ringColor = isCalorieOver ? colors.alert : colors.accent;

  // SVG circle values
  const ringRadius = 78;
  const ringCircumference = 2 * Math.PI * ringRadius;

  const ringOffset = ringCircumference * (1 - calorieProgress);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* ─────────────────────────────
            Header
        ───────────────────────────── */}

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Daily nutrition</Text>

            <Text style={styles.subtitle}>Today's progress</Text>
          </View>

          <View
            style={[
              styles.percentageBadge,
              {
                backgroundColor: isCalorieOver
                  ? colors.overWarningMuted
                  : colors.accentMuted,
              },
            ]}
          >
            <Text
              style={[
                styles.percentageBadgeText,
                {
                  color: ringColor,
                },
              ]}
            >
              {caloriePercentage}%
            </Text>
          </View>
        </View>

        {/* ─────────────────────────────
            Calorie Ring
        ───────────────────────────── */}

        <View style={styles.ringContainer}>
          <Svg width={210} height={210} viewBox="0 0 210 210">
            {/* Outer background ring */}
            <Circle
              cx="105"
              cy="105"
              r={ringRadius}
              stroke={colors.surfaceBorder}
              strokeWidth="12"
              fill="none"
              opacity={0.45}
            />

            {/* Progress ring */}
            <Circle
              cx="105"
              cy="105"
              r={ringRadius}
              stroke={ringColor}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${ringCircumference}`}
              strokeDashoffset={ringOffset}
              rotation="-90"
              origin="105, 105"
            />

            {/* Inner ring */}
            <Circle
              cx="105"
              cy="105"
              r="64"
              stroke={colors.surfaceBorder}
              strokeWidth="1"
              fill="none"
              opacity={0.5}
            />
          </Svg>

          {/* Ring content */}
          <View style={styles.ringCenter}>
            <Text style={styles.calorieEyebrow}>
              {isCalorieOver ? "OVER GOAL" : "CALORIES"}
            </Text>

            <Text
              style={[
                styles.calorieValue,
                isCalorieOver && styles.exceededValue,
              ]}
            >
              {calories}
            </Text>

            <Text style={styles.calorieUnit}>kcal</Text>

            <View style={styles.goalLine}>
              {/* <View
                style={[
                  styles.goalDot,
                  {
                    backgroundColor: ringColor,
                  },
                ]}
              /> */}

              <Text
                style={[styles.goalText, isCalorieOver && styles.exceededLabel]}
              >
                {isCalorieOver
                  ? `${formatNumber(calorieDifference)} kcal over`
                  : `${formatNumber(calorieDifference)} kcal remaining`}
              </Text>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────
            Divider
        ───────────────────────────── */}

        <View style={styles.divider} />

        {/* ─────────────────────────────
            Macros
        ───────────────────────────── */}

        <View style={styles.macroSection}>
          <MacroItem
            label="Protein"
            consumed={dailyTotals?.protein ?? 0}
            goal={goals?.protein ?? 0}
            color={colors.protein}
          />

          <View style={styles.macroDivider} />

          <MacroItem
            label="Carbs"
            consumed={dailyTotals?.carbs ?? 0}
            goal={goals?.carbs ?? 0}
            color={colors.carbs}
          />

          <View style={styles.macroDivider} />

          <MacroItem
            label="Fat"
            consumed={dailyTotals?.fat ?? 0}
            goal={goals?.fat ?? 0}
            color={colors.fat}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─────────────────────────────────────
  // Container
  // ─────────────────────────────────────

  container: {
    marginBottom: 20,
  },

  // ─────────────────────────────────────
  // Card
  // ─────────────────────────────────────

  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 20,
    overflow: "hidden",
  },

  // ─────────────────────────────────────
  // Header
  // ─────────────────────────────────────

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
    // marginTop: 2,
  },

  percentageBadge: {
    minWidth: 46,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  percentageBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  // ─────────────────────────────────────
  // Ring
  // ─────────────────────────────────────

  ringContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 2,
  },

  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  calorieEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 2,
  },

  calorieValue: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -1.5,
    color: colors.text,
  },

  calorieUnit: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginTop: -1,
  },

  exceededValue: {
    color: colors.alert,
  },

  goalLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  goalDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 6,
  },

  goalText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  exceededLabel: {
    color: colors.alert,
  },

  // ─────────────────────────────────────
  // Calorie Summary
  // ─────────────────────────────────────

  calorieSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surfaceBorder,
  },

  summaryStat: {
    flex: 1,
    alignItems: "center",
  },

  summaryStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 3,
  },

  summaryStatValue: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },

  summaryStatUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  summaryStatDivider: {
    width: 1,
    height: 25,
    backgroundColor: colors.surfaceBorder,
  },

  // ─────────────────────────────────────
  // Main Divider
  // ─────────────────────────────────────

  divider: {
    height: 1,
    // marginTop: 8,
    marginBottom: 12,
    // width: 1,
    backgroundColor: colors.surfaceBorder,
    // marginHorizontal: 10,
  },

  // ─────────────────────────────────────
  // Macros
  // ─────────────────────────────────────

  macroSection: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  macroItem: {
    flex: 1,
    minWidth: 0,
  },

  macroDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: 10,
  },

  // ─────────────────────────────────────
  // Macro Header
  // ─────────────────────────────────────

  macroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginBottom: 7,
  },

  macroLabel: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  colorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  macroName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    flexShrink: 1,
  },

  macroPercentage: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 3,
  },

  // ─────────────────────────────────────
  // Macro Value
  // ─────────────────────────────────────

  macroValue: {
    marginBottom: 7,
  },

  macroConsumed: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  macroGoal: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
  },

  // ─────────────────────────────────────
  // Macro Bar
  // ─────────────────────────────────────

  macroBarTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceLight,
    overflow: "hidden",
  },

  macroBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // ─────────────────────────────────────
  // Macro Remaining
  // ─────────────────────────────────────

  macroRemaining: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
    marginTop: 5,
  },

  macroExceeded: {
    color: colors.alert,
    fontWeight: "700",
  },
});
