import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ProgressSummaryCardsProps = {
  currentWeight: number;
  weightDelta: number;
  calorieTarget: number;
  proteinTarget: number;
  stepGoal: number;
  waterGoal: number;
};

export default function ProgressSummaryCards({
  currentWeight,
  weightDelta,
  calorieTarget,
  proteinTarget,
  stepGoal,
  waterGoal,
}: ProgressSummaryCardsProps) {
  const formatDelta = () => {
    if (weightDelta === 0) return "Stable";
    const sign = weightDelta > 0 ? "+" : "";
    return `${sign}${weightDelta} kg`;
  };

  return (
    <View style={styles.grid}>
      {/* 1. Weight */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>CURRENT WEIGHT</Text>
          <Ionicons name="speedometer-outline" size={15} color={colors.textSecondary} />
        </View>
        <View style={styles.valRow}>
          <Text style={styles.cardVal}>{currentWeight}</Text>
          <Text style={styles.cardUnit}>kg</Text>
        </View>
        <Text
          style={[
            styles.cardSub,
            weightDelta < 0 && { color: colors.protein },
            weightDelta > 0 && { color: colors.warning },
          ]}
        >
          {formatDelta()}
        </Text>
      </View>

      {/* 2. Calorie Target */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>CALORIE GOAL</Text>
          <Ionicons name="flame-outline" size={15} color={colors.warning} />
        </View>
        <View style={styles.valRow}>
          <Text style={styles.cardVal}>{calorieTarget}</Text>
          <Text style={styles.cardUnit}>kcal</Text>
        </View>
        <Text style={styles.cardSub}>Daily target</Text>
      </View>

      {/* 3. Protein Target */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>PROTEIN GOAL</Text>
          <Ionicons name="fitness-outline" size={15} color={colors.protein} />
        </View>
        <View style={styles.valRow}>
          <Text style={styles.cardVal}>{proteinTarget}</Text>
          <Text style={styles.cardUnit}>g</Text>
        </View>
        <Text style={styles.cardSub}>30% macro split</Text>
      </View>

      {/* 4. Activity Targets */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>DAILY TARGETS</Text>
          <Ionicons name="footsteps-outline" size={15} color="#A78BFA" />
        </View>
        <View style={styles.valRow}>
          <Text style={styles.cardValSmall}>
            {(stepGoal / 1000).toFixed(0)}k
          </Text>
          <Text style={styles.cardUnit}>steps</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.cardValSmall}>
            {(waterGoal / 1000).toFixed(1)}L
          </Text>
        </View>
        <Text style={styles.cardSub}>Steps & Water</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  card: {
    width: "48.5%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  valRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  cardVal: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  cardValSmall: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  cardUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  dot: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cardSub: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
