import { colors } from "@/styles/global";
import { ActivityLevel } from "@/types/nutrition";
import { ACTIVITY_OPTIONS } from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type HealthTargetsSectionProps = {
  numWeight: number;
  activity: ActivityLevel;
  waterGoal: string;
  onWaterGoalChange: (val: string) => void;
  recommendedWaterGoal: number;
  onUseRecommendedWater: () => void;
  stepGoal: string;
  onStepGoalChange: (val: string) => void;
  recommendedStepGoal: number;
  onUseRecommendedSteps: () => void;
  sleepGoal: string;
  onSleepGoalChange: (val: string) => void;
  recommendedSleepGoal: number;
  onUseRecommendedSleep: () => void;
};

export default function HealthTargetsSection({
  numWeight,
  activity,
  waterGoal,
  onWaterGoalChange,
  recommendedWaterGoal,
  onUseRecommendedWater,
  stepGoal,
  onStepGoalChange,
  recommendedStepGoal,
  onUseRecommendedSteps,
  sleepGoal,
  onSleepGoalChange,
  recommendedSleepGoal,
  onUseRecommendedSleep,
}: HealthTargetsSectionProps) {
  const activityLabel =
    ACTIVITY_OPTIONS.find((item) => item.value === activity)?.label.toLowerCase() ||
    activity;

  const isUsingRecommendedWater = Number(waterGoal) === recommendedWaterGoal;
  const isUsingRecommendedSteps = Number(stepGoal) === recommendedStepGoal;
  const isUsingRecommendedSleep = Number(sleepGoal) === recommendedSleepGoal;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Daily Health Targets</Text>
          <Text style={styles.cardSubtitle}>
            Personalized recommendations based on your profile
          </Text>
        </View>

        <View style={styles.sectionIcon}>
          <Ionicons name="heart-outline" size={17} color={colors.primary} />
        </View>
      </View>

      {/* Water Recommendation */}
      <View style={styles.recommendationCard}>
        <View style={styles.recommendationTop}>
          <View style={styles.recommendationIcon}>
            <Ionicons name="water-outline" size={19} color="#38BDF8" />
          </View>

          <View style={styles.recommendationContent}>
            <View style={styles.recommendationTitleRow}>
              <Text style={styles.recommendationTitle}>Water</Text>
              <View style={styles.recommendedBadge}>
                <Ionicons name="sparkles" size={10} color={colors.protein} />
                <Text style={styles.recommendedBadgeText}>Recommended</Text>
              </View>
            </View>

            <Text style={styles.recommendationDesc}>
              Based on your {numWeight} kg body weight
            </Text>
          </View>
        </View>

        <View style={styles.recommendationAction}>
          <View style={styles.targetInputWrapper}>
            <TextInput
              style={styles.targetInput}
              keyboardType="numeric"
              value={waterGoal}
              onChangeText={onWaterGoalChange}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.targetUnit}>ml/day</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.useRecommendationBtn,
              isUsingRecommendedWater && styles.useRecommendationBtnActive,
            ]}
            onPress={onUseRecommendedWater}
            activeOpacity={0.75}
          >
            <Text style={styles.useRecommendationText}>
              {isUsingRecommendedWater ? "Using" : "Use"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recommendationFooter}>
          <Text style={styles.recommendationFooterText}>Suggested target</Text>
          <Text style={styles.recommendationFooterValue}>
            {recommendedWaterGoal.toLocaleString()} ml
          </Text>
        </View>
      </View>

      {/* Steps Recommendation */}
      <View style={styles.recommendationCard}>
        <View style={styles.recommendationTop}>
          <View style={styles.recommendationIcon}>
            <Ionicons name="footsteps-outline" size={19} color="#A78BFA" />
          </View>

          <View style={styles.recommendationContent}>
            <View style={styles.recommendationTitleRow}>
              <Text style={styles.recommendationTitle}>Daily Steps</Text>
              <View style={styles.recommendedBadge}>
                <Ionicons name="sparkles" size={10} color={colors.protein} />
                <Text style={styles.recommendedBadgeText}>Recommended</Text>
              </View>
            </View>

            <Text style={styles.recommendationDesc}>
              Based on your {activityLabel} activity level
            </Text>
          </View>
        </View>

        <View style={styles.recommendationAction}>
          <View style={styles.targetInputWrapper}>
            <TextInput
              style={styles.targetInput}
              keyboardType="numeric"
              value={stepGoal}
              onChangeText={onStepGoalChange}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.targetUnit}>steps/day</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.useRecommendationBtn,
              isUsingRecommendedSteps && styles.useRecommendationBtnActive,
            ]}
            onPress={onUseRecommendedSteps}
            activeOpacity={0.75}
          >
            <Text style={styles.useRecommendationText}>
              {isUsingRecommendedSteps ? "Using" : "Use"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recommendationFooter}>
          <Text style={styles.recommendationFooterText}>Suggested target</Text>
          <Text style={styles.recommendationFooterValue}>
            {recommendedStepGoal.toLocaleString()} steps
          </Text>
        </View>
      </View>

      {/* Sleep Recommendation */}
      <View style={styles.recommendationCard}>
        <View style={styles.recommendationTop}>
          <View style={styles.recommendationIcon}>
            <Ionicons name="moon-outline" size={19} color={colors.sleep} />
          </View>

          <View style={styles.recommendationContent}>
            <View style={styles.recommendationTitleRow}>
              <Text style={styles.recommendationTitle}>Sleep & Rest</Text>
              <View style={styles.recommendedBadge}>
                <Ionicons name="sparkles" size={10} color={colors.protein} />
                <Text style={styles.recommendedBadgeText}>Recommended</Text>
              </View>
            </View>

            <Text style={styles.recommendationDesc}>
              Optimal recovery target for active wellness
            </Text>
          </View>
        </View>

        <View style={styles.recommendationAction}>
          <View style={styles.targetInputWrapper}>
            <TextInput
              style={styles.targetInput}
              keyboardType="numeric"
              value={sleepGoal}
              onChangeText={onSleepGoalChange}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.targetUnit}>hours/night</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.useRecommendationBtn,
              isUsingRecommendedSleep && styles.useRecommendationBtnActive,
            ]}
            onPress={onUseRecommendedSleep}
            activeOpacity={0.75}
          >
            <Text style={styles.useRecommendationText}>
              {isUsingRecommendedSleep ? "Using" : "Use"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recommendationFooter}>
          <Text style={styles.recommendationFooterText}>Suggested target</Text>
          <Text style={styles.recommendationFooterValue}>
            {recommendedSleepGoal} hours
          </Text>
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
  recommendationCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    marginBottom: 12,
  },
  recommendationTop: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  recommendationIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.proteinMuted,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.protein,
  },
  recommendationDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },
  recommendationAction: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  targetInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingRight: 10,
  },
  targetInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  targetUnit: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  useRecommendationBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  useRecommendationBtnActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  useRecommendationText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
  recommendationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 8,
  },
  recommendationFooterText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  recommendationFooterValue: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
  },
});
