import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
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

export default function GoalsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { mode, session, profile, signOut, saveProfile } = useAuth();
  const { updateDailyGoals } = useNutrition();
  const {
    waterGoal,
    updateWaterGoal,
    stepGoal,
    updateStepGoal,
    recordWeight,
  } = useHealth();

  const isGuest = mode === "guest";

  // Form State
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<PrimaryGoal>("maintain");
  const [calorieAdjustment, setCalorieAdjustment] = useState<number>(400);

  const [isSaving, setIsSaving] = useState(false);

  const [inputWaterGoal, setInputWaterGoal] = useState<string | null>(null);
  const [inputStepGoal, setInputStepGoal] = useState<string | null>(null);

  const displayedWaterGoal =
    inputWaterGoal !== null ? inputWaterGoal : String(waterGoal);
  const displayedStepGoal =
    inputStepGoal !== null ? inputStepGoal : String(stepGoal);

  // Load profile values
  useEffect(() => {
    let active = true;
    async function loadData() {
      if (profile) {
        if (profile.sex === "female") setSex("female");
        else setSex("male");
        if (profile.age) setAge(String(profile.age));
        if (profile.height) setHeight(String(profile.height));
        if (profile.weight) setWeight(String(profile.weight));
        if (
          profile.activity_level === "sedentary" ||
          profile.activity_level === "light" ||
          profile.activity_level === "moderate" ||
          profile.activity_level === "heavy"
        ) {
          setActivity(profile.activity_level as ActivityLevel);
        }
      } else if (isGuest) {
        const guestData = await getGuestProfile();
        if (active && guestData) {
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
    loadData();
    return () => {
      active = false;
    };
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

  const handleSaveAll = async () => {
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
      } else {
        await saveProfile({
          sex,
          age: Math.round(numAge),
          height: numHeight,
          weight: numWeight,
          activity_level: activity,
          target_calorie: targetCalories,
        });
      }

      // Record weight in history log
      await recordWeight(numWeight);

      // Update daily macro goals
      await updateDailyGoals(macros);

      // Update water and step goals
      const wg = parseInt(displayedWaterGoal, 10);
      if (!isNaN(wg) && wg > 0) {
        await updateWaterGoal(wg);
      }
      const sg = parseInt(displayedStepGoal, 10);
      if (!isNaN(sg) && sg > 0) {
        await updateStepGoal(sg);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Goals Updated",
        `Daily target updated to ${targetCalories} kcal with ${macros.protein}g Protein, ${macros.carbs}g Carbs, and ${macros.fat}g Fat.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      console.error("Save profile error:", err);
      Alert.alert("Unable to save", err.message || "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Sign Out", "Are you sure you want to sign out of Caloryx?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth/welcome");
        },
      },
    ]);
  };

  const displayName =
    profile?.username ||
    session?.user?.email?.split("@")[0] ||
    (isGuest ? "Guest User" : "User");

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.backButtonText}>Profile</Text>
        </TouchableOpacity>

        <Text style={styles.navTitle}>Edit Goals</Text>

        <TouchableOpacity
          onPress={handleSaveAll}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Text style={[styles.saveNavText, isSaving && { opacity: 0.5 }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 36 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subtitle banner */}
          <Text style={styles.screenSubtitle}>
            Configure your body stats and Mifflin-St Jeor daily nutrition
            targets.
          </Text>

          {/* Account Card */}
          <View style={styles.accountCard}>
            <View style={styles.accountRow}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{displayName}</Text>
                <Text style={styles.accountEmail}>
                  {isGuest
                    ? "Local storage only"
                    : session?.user?.email || "Authenticated"}
                </Text>
              </View>
              <View
                style={[
                  styles.accountBadge,
                  isGuest ? styles.guestBadge : styles.authBadge,
                ]}
              >
                <Text
                  style={[
                    styles.accountBadgeText,
                    isGuest ? styles.guestBadgeText : styles.authBadgeText,
                  ]}
                >
                  {isGuest ? "Guest" : "Synced"}
                </Text>
              </View>
            </View>

            {isGuest ? (
              <View style={styles.guestActions}>
                <TouchableOpacity
                  style={styles.createAccountBtn}
                  onPress={() => router.push("/auth/register")}
                >
                  <Text style={styles.createAccountText}>Create Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={() => router.push("/auth/login")}
                >
                  <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleSignOut}
              >
                <Ionicons
                  name="log-out-outline"
                  size={15}
                  color={colors.alert}
                />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section 1: Body Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>BODY STATS</Text>

            <Text style={styles.inputLabel}>Biological Sex</Text>
            <View style={styles.segmentRow}>
              {SEX_OPTIONS.map((item) => {
                const isSelected = sex === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.segmentBtn,
                      isSelected && styles.segmentBtnActive,
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
                <Text style={styles.inputLabel}>Age</Text>
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
                <Text style={styles.inputLabel}>Height (cm)</Text>
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
                <Text style={styles.inputLabel}>Weight (kg)</Text>
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
            <Text style={styles.cardTitle}>ACTIVITY LEVEL</Text>
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
                    <View style={styles.radioOuter}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.optionContent}>
                      <View style={styles.optionHeaderRow}>
                        <Text style={styles.optionLabel}>{item.label}</Text>
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
            <Text style={styles.cardTitle}>PRIMARY GOAL</Text>
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
                    <Text style={styles.goalDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Calorie Deficit / Surplus Stepper */}
            {(goal === "lose_fat" || goal === "build_muscle") && (
              <View style={styles.adjustmentContainer}>
                <View style={styles.adjustmentHeader}>
                  <Text style={styles.adjustmentLabel}>
                    {goal === "lose_fat"
                      ? "Daily Calorie Deficit"
                      : "Daily Calorie Surplus"}
                  </Text>
                  <Text style={styles.adjustmentValue}>
                    {goal === "lose_fat"
                      ? `-${calorieAdjustment}`
                      : `+${calorieAdjustment}`}{" "}
                    kcal
                  </Text>
                </View>

                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={[
                      styles.stepBtn,
                      calorieAdjustment <= 150 && styles.stepBtnDisabled,
                    ]}
                    onPress={() => handleAdjustmentChange(-50)}
                    disabled={calorieAdjustment <= 150}
                  >
                    <Text style={styles.stepBtnText}>- 50</Text>
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
                            calorieAdjustment === val &&
                              styles.presetChipTextActive,
                          ]}
                        >
                          {val}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.stepBtn,
                      calorieAdjustment >= 800 && styles.stepBtnDisabled,
                    ]}
                    onPress={() => handleAdjustmentChange(50)}
                    disabled={calorieAdjustment >= 800}
                  >
                    <Text style={styles.stepBtnText}>+ 50</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Section 4: Daily Water & Step Targets */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>DAILY HEALTH TARGETS</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.inputLabel}>Water Goal (ml)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="2500"
                  placeholderTextColor={colors.textMuted}
                  value={displayedWaterGoal}
                  onChangeText={setInputWaterGoal}
                />
              </View>

              <View style={styles.statCol}>
                <Text style={styles.inputLabel}>Step Goal</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="10000"
                  placeholderTextColor={colors.textMuted}
                  value={displayedStepGoal}
                  onChangeText={setInputStepGoal}
                />
              </View>
            </View>
          </View>

          {/* Mifflin-St Jeor Live Calculation Result Card */}
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <View>
                <Text style={styles.resultTitle}>CALCULATED TARGET</Text>
                <Text style={styles.resultCalories}>
                  {targetCalories} kcal/day
                </Text>
              </View>
              <View style={styles.bmrPill}>
                <Text style={styles.bmrPillText}>
                  BMR: {bmr} • TDEE: {tdee}
                </Text>
              </View>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.macroSplitRow}>
              <View style={styles.macroSplitCol}>
                <View style={styles.macroTagRow}>
                  <View
                    style={[
                      styles.macroDot,
                      { backgroundColor: colors.protein },
                    ]}
                  />
                  <Text style={styles.macroTagLabel}>Protein (30%)</Text>
                </View>
                <Text style={styles.macroTagVal}>{macros.protein}g</Text>
              </View>

              <View style={styles.macroSplitCol}>
                <View style={styles.macroTagRow}>
                  <View
                    style={[
                      styles.macroDot,
                      { backgroundColor: colors.carbs },
                    ]}
                  />
                  <Text style={styles.macroTagLabel}>Carbs (40%)</Text>
                </View>
                <Text style={styles.macroTagVal}>{macros.carbs}g</Text>
              </View>

              <View style={styles.macroSplitCol}>
                <View style={styles.macroTagRow}>
                  <View
                    style={[
                      styles.macroDot,
                      { backgroundColor: colors.fat },
                    ]}
                  />
                  <Text style={styles.macroTagLabel}>Fat (30%)</Text>
                </View>
                <Text style={styles.macroTagVal}>{macros.fat}g</Text>
              </View>
            </View>
          </View>

          {/* Save & Apply Button */}
          <TouchableOpacity
            style={[styles.saveAllBtn, isSaving && styles.btnDisabled]}
            onPress={handleSaveAll}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.saveAllBtnText}>
                Save & Update Daily Targets
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  saveNavText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 16,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    gap: 12,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  accountEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  guestBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.12)",
  },
  authBadge: {
    backgroundColor: "rgba(52, 211, 153, 0.12)",
  },
  accountBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  guestBadgeText: {
    color: colors.warning,
  },
  authBadgeText: {
    color: colors.protein,
  },
  guestActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  createAccountBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  createAccountText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.background,
  },
  signInBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  signInText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.alert,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentBtnActive: {
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
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
    gap: 12,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  radioOuter: {
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
  optionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionLabel: {
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
  goalDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
    textAlign: "center",
  },
  adjustmentContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
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
  stepBtn: {
    backgroundColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  presetChips: {
    flexDirection: "row",
    gap: 6,
  },
  presetChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  resultCard: {
    backgroundColor: "#161616",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 16,
    gap: 12,
  },
  resultHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  resultTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  resultCalories: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  bmrPill: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bmrPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  resultDivider: {
    height: 1,
    backgroundColor: "#262626",
  },
  macroSplitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroSplitCol: {
    gap: 3,
  },
  macroTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroTagLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  macroTagVal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  saveAllBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveAllBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.background,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
