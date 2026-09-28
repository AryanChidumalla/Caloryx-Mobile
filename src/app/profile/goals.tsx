import {
  ActivitySection,
  BodyStatsSection,
  CalorieMacroPreview,
  GoalsAccountCard,
  HealthTargetsSection,
  PrimaryGoalSection,
  useGoalsForm,
} from "@/components/profile/goals";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GoalsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const form = useGoalsForm();

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.backButtonText}>Profile</Text>
        </TouchableOpacity>

        <Text style={styles.navTitle}>Edit Plan</Text>

        <TouchableOpacity
          onPress={form.handleSaveAll}
          disabled={form.isSaving}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.saveNavText, form.isSaving && styles.disabledText]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 36 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro Banner */}
          <View style={styles.intro}>
            <View style={styles.introIcon}>
              <Ionicons
                name="sparkles-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>Personalize your plan</Text>
              <Text style={styles.introText}>
                Update your body stats and goals. Caloryx will calculate your
                daily nutrition, water, and activity targets.
              </Text>
            </View>
          </View>

          {/* Account Details & Status */}
          <GoalsAccountCard
            displayName={form.displayName}
            email={form.email}
            isGuest={form.isGuest}
          />

          {/* Body Stats */}
          <BodyStatsSection
            sex={form.sex}
            onSexChange={form.setSex}
            age={form.age}
            onAgeChange={form.setAge}
            height={form.height}
            onHeightChange={form.setHeight}
            weight={form.weight}
            onWeightChange={form.setWeight}
          />

          {/* Activity Level */}
          <ActivitySection
            activity={form.activity}
            onActivityChange={form.setActivity}
          />

          {/* Primary Goal & Calorie Deficit/Surplus */}
          <PrimaryGoalSection
            goal={form.goal}
            onGoalChange={form.setGoal}
            calorieAdjustment={form.calorieAdjustment}
            onCalorieAdjustmentChange={form.handleAdjustmentChange}
            onSetCalorieAdjustment={form.handleSetAdjustment}
          />

          {/* Daily Health Targets (Water, Steps & Sleep) */}
          <HealthTargetsSection
            numWeight={form.numWeight}
            activity={form.activity}
            waterGoal={form.displayedWaterGoal}
            onWaterGoalChange={form.setInputWaterGoal}
            recommendedWaterGoal={form.recommendedWaterGoal}
            onUseRecommendedWater={form.useRecommendedWater}
            stepGoal={form.displayedStepGoal}
            onStepGoalChange={form.setInputStepGoal}
            recommendedStepGoal={form.recommendedStepGoal}
            onUseRecommendedSteps={form.useRecommendedSteps}
            sleepGoal={form.displayedSleepGoal}
            onSleepGoalChange={form.setInputSleepGoal}
            recommendedSleepGoal={form.recommendedSleepGoal}
            onUseRecommendedSleep={form.useRecommendedSleep}
          />

          {/* Calculated Nutrition Preview */}
          <CalorieMacroPreview
            targetCalories={form.targetCalories}
            bmr={form.bmr}
            tdee={form.tdee}
            macros={form.macros}
          />

          {/* Bottom Save Button */}
          <TouchableOpacity
            style={[styles.saveAllBtn, form.isSaving && styles.btnDisabled]}
            onPress={form.handleSaveAll}
            disabled={form.isSaving}
            activeOpacity={0.8}
          >
            {form.isSaving ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={19}
                  color={colors.background}
                />
                <Text style={styles.saveAllBtnText}>Save & Update Plan</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.saveHint}>
            Your targets will be used throughout Caloryx.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 75,
    paddingVertical: 5,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
  saveNavText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
    minWidth: 75,
    textAlign: "right",
  },
  disabledText: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  intro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primaryMuted,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  introIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  introContent: {
    flex: 1,
  },
  introTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  introText: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  saveAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: colors.primary,
    borderRadius: 13,
    paddingVertical: 15,
  },
  saveAllBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.background,
  },
  saveHint: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
