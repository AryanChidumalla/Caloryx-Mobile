import { useAuth } from "@/context/AuthContext";
import { useNutrition } from "@/context/NutritionContext";
import { getGuestProfile, saveGuestProfile } from "@/storage/nutritionStorage";
import { colors, globalStyles } from "@/styles/global";
import { ActivityLevel, PrimaryGoal, Sex } from "@/types/nutrition";
import {
  calculateBMR,
  calculateMacroTargetsFromCalories,
  calculateTargetCalories,
  calculateTDEE,
  sanitizeNumber,
} from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  label: string;
  desc: string;
  multiplier: number;
}[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    desc: "Little to no exercise, desk job",
    multiplier: 1.2,
  },
  {
    value: "light",
    label: "Lightly Active",
    desc: "Light exercise 1–3 days/week",
    multiplier: 1.375,
  },
  {
    value: "moderate",
    label: "Moderate",
    desc: "Moderate exercise 3–5 days/week",
    multiplier: 1.55,
  },
  {
    value: "heavy",
    label: "Very Active",
    desc: "Hard exercise 6–7 days/week",
    multiplier: 1.725,
  },
];

const GOAL_OPTIONS: {
  value: PrimaryGoal;
  label: string;
  desc: string;
}[] = [
  { value: "lose_fat", label: "Lose Fat", desc: "Calorie Deficit" },
  { value: "maintain", label: "Maintain Weight", desc: "Exact TDEE" },
  { value: "build_muscle", label: "Build Muscle", desc: "Calorie Surplus" },
];

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { mode, user, profile, hasCompletedProfile, saveProfile } = useAuth();
  const { updateDailyGoals } = useNutrition();

  const isGuest = mode === "guest";
  const canGoBack = hasCompletedProfile || isGuest;

  // Form State
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<PrimaryGoal>("maintain");
  const [calorieAdjustment, setCalorieAdjustment] = useState<number>(400);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from existing profile (Supabase or AsyncStorage)
  useEffect(() => {
    async function loadInitialData() {
      if (profile) {
        if (profile.sex === "female") setSex("female");
        else setSex("male");

        if (profile.age) setAge(String(profile.age));
        if (profile.height) setHeight(String(profile.height));
        if (profile.weight) setWeight(String(profile.weight));

        const act = profile.activity_level;
        if (act === "sedentary" || act === "light" || act === "moderate" || act === "heavy") {
          setActivity(act as ActivityLevel);
        }
      } else if (isGuest) {
        const guestData = await getGuestProfile();
        if (guestData) {
          if (guestData.sex === "female") setSex("female");
          if (guestData.age) setAge(String(guestData.age));
          if (guestData.height) setHeight(String(guestData.height));
          if (guestData.weight) setWeight(String(guestData.weight));
          if (guestData.activity_level) {
            setActivity(guestData.activity_level as ActivityLevel);
          }
          if (guestData.goal) setGoal(guestData.goal);
          if (guestData.calorieAdjustment) {
            setCalorieAdjustment(guestData.calorieAdjustment);
          }
        }
      }
    }
    loadInitialData();
  }, [profile, isGuest]);

  const numWeight = sanitizeNumber(weight, 70);
  const numHeight = sanitizeNumber(height, 175);
  const numAge = sanitizeNumber(age, 25);

  // Live Mifflin-St Jeor & TDEE Calculations
  const bmr = calculateBMR(numWeight, numHeight, numAge, sex);
  const tdee = calculateTDEE(bmr, activity);
  const targetCalories = calculateTargetCalories(tdee, goal, calorieAdjustment);
  const macros = calculateMacroTargetsFromCalories(targetCalories);

  const handleAdjustmentChange = (delta: number) => {
    Haptics.selectionAsync();
    setCalorieAdjustment((prev) => {
      const next = prev + delta;
      return Math.min(800, Math.max(150, next));
    });
  };

  const handleSave = async () => {
    if (numWeight <= 20 || numHeight <= 50 || numAge <= 10) {
      Alert.alert(
        "Invalid Information",
        "Please enter valid body stats (age, height, weight).",
      );
      return;
    }

    setIsSaving(true);
    try {
      if (isGuest) {
        // Guest mode: Save locally
        await saveGuestProfile({
          sex,
          age: Math.round(numAge),
          height: numHeight,
          weight: numWeight,
          activity_level: activity,
          target_calorie: targetCalories,
          goal,
          calorieAdjustment,
        });

        await updateDailyGoals(macros);
      } else {
        // Authenticated mode: Save to Supabase `profiles` table
        await saveProfile({
          sex,
          age: Math.round(numAge),
          height: numHeight,
          weight: numWeight,
          activity_level: activity,
          target_calorie: targetCalories,
        });

        await updateDailyGoals(macros);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Profile save error:", err);
      Alert.alert("Unable to save profile", err.message || "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName =
    profile?.username ||
    user?.email?.split("@")[0] ||
    (isGuest ? "Guest" : "there");

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 30 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar / Back Button */}
          {canGoBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.badge}>PROFILE & NUTRITION GOALS</Text>
            <Text style={styles.title}>Welcome, {displayName}!</Text>
            <Text style={styles.subtitle}>
              Configure your body stats and activity level to calculate your
              accurate calorie target and macronutrient split.
            </Text>
          </View>

          {/* Section 1: Body Stats */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>YOUR BODY STATS</Text>

            <Text style={styles.label}>Biological Sex</Text>
            <View style={styles.segmentRow}>
              {SEX_OPTIONS.map((item) => {
                const isSelected = sex === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.segmentButton,
                      isSelected && styles.segmentButtonActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSex(item.value);
                    }}
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
                <Text style={styles.label}>Age (years)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="25"
                  placeholderTextColor={colors.textMuted}
                  value={age}
                  onChangeText={setAge}
                />
              </View>

              <View style={styles.statCol}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="175"
                  placeholderTextColor={colors.textMuted}
                  value={height}
                  onChangeText={setHeight}
                />
              </View>

              <View style={styles.statCol}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor={colors.textMuted}
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>
          </View>

          {/* Section 2: Activity Level */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>ACTIVITY LEVEL</Text>
            <View style={styles.optionsList}>
              {ACTIVITY_OPTIONS.map((item) => {
                const isSelected = activity === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setActivity(item.value);
                    }}
                  >
                    <View style={styles.radioCircle}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.optionContent}>
                      <View style={styles.optionTitleRow}>
                        <Text style={styles.optionTitle}>{item.label}</Text>
                        <Text style={styles.multiplierBadge}>
                          {item.multiplier}x
                        </Text>
                      </View>
                      <Text style={styles.optionDesc}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 3: Primary Goal */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>PRIMARY GOAL</Text>
            <View style={styles.goalRow}>
              {GOAL_OPTIONS.map((item) => {
                const isSelected = goal === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.goalCard,
                      isSelected && styles.goalCardActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setGoal(item.value);
                    }}
                  >
                    <Text
                      style={[
                        styles.goalTitle,
                        isSelected && styles.goalTitleActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.goalSub}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Adjustable Deficit/Surplus if applicable */}
            {(goal === "lose_fat" || goal === "build_muscle") && (
              <View style={styles.adjustmentContainer}>
                <View style={styles.adjustmentHeader}>
                  <Text style={styles.adjustmentLabel}>
                    {goal === "lose_fat" ? "Daily Calorie Deficit" : "Daily Calorie Surplus"}
                  </Text>
                  <Text style={styles.adjustmentValue}>
                    {goal === "lose_fat" ? `-${calorieAdjustment}` : `+${calorieAdjustment}`} kcal/day
                  </Text>
                </View>

                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={[
                      styles.stepButton,
                      calorieAdjustment <= 150 && styles.stepButtonDisabled,
                    ]}
                    onPress={() => handleAdjustmentChange(-50)}
                    disabled={calorieAdjustment <= 150}
                  >
                    <Text style={styles.stepButtonText}>- 50</Text>
                  </TouchableOpacity>

                  <View style={styles.presetChips}>
                    {[300, 400, 500].map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.presetChip,
                          calorieAdjustment === val && styles.presetChipActive,
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setCalorieAdjustment(val);
                        }}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            calorieAdjustment === val && styles.presetChipTextActive,
                          ]}
                        >
                          {val}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.stepButton,
                      calorieAdjustment >= 800 && styles.stepButtonDisabled,
                    ]}
                    onPress={() => handleAdjustmentChange(50)}
                    disabled={calorieAdjustment >= 800}
                  >
                    <Text style={styles.stepButtonText}>+ 50</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.adjustmentHint}>
                  Range: 150–800 kcal/day (Default: 400 kcal)
                </Text>
              </View>
            )}
          </View>

          {/* Live Calculated Output Card */}
          <View style={styles.resultCard}>
            <View style={styles.resultTop}>
              <View>
                <Text style={styles.resultLabel}>CALCULATED DAILY TARGET</Text>
                <Text style={styles.resultCalories}>
                  {targetCalories} kcal/day
                </Text>
              </View>
              <View style={styles.bmrPill}>
                <Text style={styles.bmrText}>BMR: {bmr} • TDEE: {tdee}</Text>
              </View>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.macroBreakdownRow}>
              <View style={styles.macroCol}>
                <View style={styles.macroTagRow}>
                  <View
                    style={[
                      styles.macroDot,
                      { backgroundColor: colors.protein },
                    ]}
                  />
                  <Text style={styles.macroLabel}>Protein (30%)</Text>
                </View>
                <Text style={styles.macroValue}>{macros.protein}g</Text>
              </View>

              <View style={styles.macroCol}>
                <View style={styles.macroTagRow}>
                  <View
                    style={[
                      styles.macroDot,
                      { backgroundColor: colors.carbs },
                    ]}
                  />
                  <Text style={styles.macroLabel}>Carbs (40%)</Text>
                </View>
                <Text style={styles.macroValue}>{macros.carbs}g</Text>
              </View>

              <View style={styles.macroCol}>
                <View style={styles.macroTagRow}>
                  <View
                    style={[
                      styles.macroDot,
                      { backgroundColor: colors.fat },
                    ]}
                  />
                  <Text style={styles.macroLabel}>Fat (30%)</Text>
                </View>
                <Text style={styles.macroValue}>{macros.fat}g</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Save Target</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  header: {
    marginBottom: 4,
  },
  badge: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.background,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCol: {
    flex: 1,
    gap: 6,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
    textAlign: "center",
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: "center",
    alignItems: "center",
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
  optionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  multiplierBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    backgroundColor: colors.surfaceBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  goalRow: {
    flexDirection: "row",
    gap: 8,
  },
  goalCard: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  goalCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textAlign: "center",
  },
  goalTitleActive: {
    color: colors.primary,
  },
  goalSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  adjustmentContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginTop: 6,
    gap: 10,
  },
  adjustmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adjustmentLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  adjustmentValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.protein,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  stepButton: {
    backgroundColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stepButtonDisabled: {
    opacity: 0.3,
  },
  stepButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  presetChips: {
    flexDirection: "row",
    gap: 6,
  },
  presetChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: colors.background,
  },
  adjustmentHint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
  },
  resultCard: {
    backgroundColor: "#161616",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 18,
  },
  resultTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  resultCalories: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -1,
    marginTop: 2,
  },
  bmrPill: {
    backgroundColor: colors.surfaceBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bmrText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  resultDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 14,
  },
  macroBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroCol: {
    alignItems: "center",
    flex: 1,
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
  macroLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },
});
