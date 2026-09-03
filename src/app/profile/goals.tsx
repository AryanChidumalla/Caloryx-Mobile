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
import { useEffect, useMemo, useState } from "react";
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
  {
    value: "lose_fat",
    label: "Lose Fat",
    desc: "Calorie Deficit",
  },
  {
    value: "maintain",
    label: "Maintain Weight",
    desc: "Exact TDEE",
  },
  {
    value: "build_muscle",
    label: "Build Muscle",
    desc: "Calorie Surplus",
  },
];

const STEP_RECOMMENDATIONS: Record<ActivityLevel, number> = {
  sedentary: 6000,
  light: 7500,
  moderate: 10000,
  heavy: 12000,
};

const WATER_ML_PER_KG = 35;

export default function GoalsSettingsScreen() {
  const insets = useSafeAreaInsets();

  const { mode, session, profile, saveProfile } = useAuth();

  const { updateDailyGoals } = useNutrition();

  const { waterGoal, updateWaterGoal, stepGoal, updateStepGoal, recordWeight } =
    useHealth();

  const isGuest = mode === "guest";

  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<PrimaryGoal>("maintain");
  const [calorieAdjustment, setCalorieAdjustment] = useState(400);

  const [isSaving, setIsSaving] = useState(false);

  const [inputWaterGoal, setInputWaterGoal] = useState<string | null>(null);
  const [inputStepGoal, setInputStepGoal] = useState<string | null>(null);

  const numWeight = sanitizeNumber(weight, 70);
  const numHeight = sanitizeNumber(height, 175);
  const numAge = sanitizeNumber(age, 25);

  /*
   * Personalized health recommendations
   *
   * Water:
   * ~35 ml per kg of body weight.
   *
   * Steps:
   * Based on the selected activity level.
   */
  const recommendedWaterGoal = useMemo(() => {
    const calculated = Math.round((numWeight * WATER_ML_PER_KG) / 100) * 100;

    return Math.min(5000, Math.max(1500, calculated));
  }, [numWeight]);

  const recommendedStepGoal = STEP_RECOMMENDATIONS[activity];

  const displayedWaterGoal =
    inputWaterGoal !== null
      ? inputWaterGoal
      : String(waterGoal || recommendedWaterGoal);

  const displayedStepGoal =
    inputStepGoal !== null
      ? inputStepGoal
      : String(stepGoal || recommendedStepGoal);

  /*
   * Load existing profile values.
   */
  useEffect(() => {
    let active = true;

    async function loadData() {
      if (profile) {
        if (profile.sex === "female") {
          setSex("female");
        } else {
          setSex("male");
        }

        if (profile.age) {
          setAge(String(profile.age));
        }

        if (profile.height) {
          setHeight(String(profile.height));
        }

        if (profile.weight) {
          setWeight(String(profile.weight));
        }

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

        if (!active || !guestData) return;

        if (guestData.sex === "female") {
          setSex("female");
        }

        if (guestData.age) {
          setAge(String(guestData.age));
        }

        if (guestData.height) {
          setHeight(String(guestData.height));
        }

        if (guestData.weight) {
          setWeight(String(guestData.weight));
        }

        if (guestData.activity_level) {
          setActivity(guestData.activity_level as ActivityLevel);
        }

        if (guestData.goal) {
          setGoal(guestData.goal);
        }

        if (guestData.calorieAdjustment) {
          setCalorieAdjustment(guestData.calorieAdjustment);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [profile, isGuest]);

  /*
   * Live calorie calculations.
   */
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

  const useRecommendedWater = () => {
    Haptics.selectionAsync();
    setInputWaterGoal(String(recommendedWaterGoal));
  };

  const useRecommendedSteps = () => {
    Haptics.selectionAsync();
    setInputStepGoal(String(recommendedStepGoal));
  };

  const handleSaveAll = async () => {
    if (numWeight <= 20 || numHeight <= 50 || numAge <= 10) {
      Alert.alert(
        "Invalid Information",
        "Please enter valid body stats (age, height, weight).",
      );

      return;
    }

    const parsedWaterGoal = parseInt(displayedWaterGoal, 10);

    const parsedStepGoal = parseInt(displayedStepGoal, 10);

    if (
      isNaN(parsedWaterGoal) ||
      parsedWaterGoal < 1000 ||
      parsedWaterGoal > 10000
    ) {
      Alert.alert(
        "Invalid Water Goal",
        "Please enter a water goal between 1,000 and 10,000 ml.",
      );

      return;
    }

    if (
      isNaN(parsedStepGoal) ||
      parsedStepGoal < 1000 ||
      parsedStepGoal > 30000
    ) {
      Alert.alert(
        "Invalid Step Goal",
        "Please enter a step goal between 1,000 and 30,000 steps.",
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

      await recordWeight(numWeight);

      await updateDailyGoals(macros);

      await updateWaterGoal(parsedWaterGoal);
      await updateStepGoal(parsedStepGoal);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Plan Updated",
        `Your daily plan is now ${targetCalories} kcal with ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat, ${parsedWaterGoal.toLocaleString()} ml water, and ${parsedStepGoal.toLocaleString()} steps.`,
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (err: any) {
      console.error("Save profile error:", err);

      Alert.alert(
        "Unable to save",
        err?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const displayName =
    profile?.username ||
    session?.user?.email?.split("@")[0] ||
    (isGuest ? "Guest User" : "User");

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
          onPress={handleSaveAll}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Text style={[styles.saveNavText, isSaving && styles.disabledText]}>
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
            {
              paddingBottom: insets.bottom + 36,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro */}
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

          {/* Account */}
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

            {isGuest && (
              <View style={styles.guestActions}>
                <TouchableOpacity
                  style={styles.createAccountBtn}
                  onPress={() => router.push("/auth/register")}
                  activeOpacity={0.75}
                >
                  <Text style={styles.createAccountText}>Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={() => router.push("/auth/login")}
                  activeOpacity={0.75}
                >
                  <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Body Stats */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Body Stats</Text>

                <Text style={styles.cardSubtitle}>
                  Used to calculate your energy needs
                </Text>
              </View>

              <View style={styles.sectionIcon}>
                <Ionicons
                  name="body-outline"
                  size={17}
                  color={colors.primary}
                />
              </View>
            </View>

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
                  onChangeText={setAge}
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
                    onChangeText={setHeight}
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
                    onChangeText={setWeight}
                  />

                  <Text style={styles.inputUnit}>kg</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Activity Level */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Activity Level</Text>

                <Text style={styles.cardSubtitle}>
                  Helps personalize your calorie and step targets
                </Text>
              </View>

              <View style={styles.sectionIcon}>
                <Ionicons
                  name="fitness-outline"
                  size={17}
                  color={colors.primary}
                />
              </View>
            </View>

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
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterActive,
                      ]}
                    >
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

          {/* Primary Goal */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Primary Goal</Text>

                <Text style={styles.cardSubtitle}>
                  Your main direction determines your calorie target
                </Text>
              </View>

              <View style={styles.sectionIcon}>
                <Ionicons
                  name="flag-outline"
                  size={17}
                  color={colors.primary}
                />
              </View>
            </View>

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
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.goalIndicator,
                        isSelected && styles.goalIndicatorActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          item.value === "lose_fat"
                            ? "trending-down-outline"
                            : item.value === "build_muscle"
                              ? "barbell-outline"
                              : "remove-outline"
                        }
                        size={17}
                        color={
                          isSelected ? colors.background : colors.textSecondary
                        }
                      />
                    </View>

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

            {(goal === "lose_fat" || goal === "build_muscle") && (
              <View style={styles.adjustmentContainer}>
                <View style={styles.adjustmentHeader}>
                  <View>
                    <Text style={styles.adjustmentLabel}>
                      {goal === "lose_fat"
                        ? "Daily Calorie Deficit"
                        : "Daily Calorie Surplus"}
                    </Text>

                    <Text style={styles.adjustmentHint}>
                      Applied to your estimated TDEE
                    </Text>
                  </View>

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
                    activeOpacity={0.75}
                  >
                    <Text style={styles.stepBtnText}>− 50</Text>
                  </TouchableOpacity>

                  <View style={styles.presetChips}>
                    {[300, 400, 500].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.presetChip,
                          calorieAdjustment === value &&
                            styles.presetChipActive,
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setCalorieAdjustment(value);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            calorieAdjustment === value &&
                              styles.presetChipTextActive,
                          ]}
                        >
                          {value}
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
                    activeOpacity={0.75}
                  >
                    <Text style={styles.stepBtnText}>+ 50</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Daily Health Targets */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Daily Health Targets</Text>

                <Text style={styles.cardSubtitle}>
                  Personalized recommendations based on your profile
                </Text>
              </View>

              <View style={styles.sectionIcon}>
                <Ionicons
                  name="heart-outline"
                  size={17}
                  color={colors.primary}
                />
              </View>
            </View>

            {/* Water */}
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationTop}>
                <View style={styles.recommendationIcon}>
                  <Ionicons name="water-outline" size={19} color="#38BDF8" />
                </View>

                <View style={styles.recommendationContent}>
                  <View style={styles.recommendationTitleRow}>
                    <Text style={styles.recommendationTitle}>Water</Text>

                    <View style={styles.recommendedBadge}>
                      <Ionicons
                        name="sparkles"
                        size={10}
                        color={colors.protein}
                      />

                      <Text style={styles.recommendedBadgeText}>
                        Recommended
                      </Text>
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
                    value={displayedWaterGoal}
                    onChangeText={setInputWaterGoal}
                    placeholderTextColor={colors.textMuted}
                  />

                  <Text style={styles.targetUnit}>ml/day</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.useRecommendationBtn,
                    Number(displayedWaterGoal) === recommendedWaterGoal &&
                      styles.useRecommendationBtnActive,
                  ]}
                  onPress={useRecommendedWater}
                  activeOpacity={0.75}
                >
                  <Text style={styles.useRecommendationText}>
                    {Number(displayedWaterGoal) === recommendedWaterGoal
                      ? "Using"
                      : "Use"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recommendationFooter}>
                <Text style={styles.recommendationFooterText}>
                  Suggested target
                </Text>

                <Text style={styles.recommendationFooterValue}>
                  {recommendedWaterGoal.toLocaleString()} ml
                </Text>
              </View>
            </View>

            {/* Steps */}
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationTop}>
                <View style={styles.recommendationIcon}>
                  <Ionicons
                    name="footsteps-outline"
                    size={19}
                    color="#A78BFA"
                  />
                </View>

                <View style={styles.recommendationContent}>
                  <View style={styles.recommendationTitleRow}>
                    <Text style={styles.recommendationTitle}>Daily Steps</Text>

                    <View style={styles.recommendedBadge}>
                      <Ionicons
                        name="sparkles"
                        size={10}
                        color={colors.protein}
                      />

                      <Text style={styles.recommendedBadgeText}>
                        Recommended
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.recommendationDesc}>
                    Based on your{" "}
                    {ACTIVITY_OPTIONS.find(
                      (item) => item.value === activity,
                    )?.label.toLowerCase()}{" "}
                    activity level
                  </Text>
                </View>
              </View>

              <View style={styles.recommendationAction}>
                <View style={styles.targetInputWrapper}>
                  <TextInput
                    style={styles.targetInput}
                    keyboardType="numeric"
                    value={displayedStepGoal}
                    onChangeText={setInputStepGoal}
                    placeholderTextColor={colors.textMuted}
                  />

                  <Text style={styles.targetUnit}>steps/day</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.useRecommendationBtn,
                    Number(displayedStepGoal) === recommendedStepGoal &&
                      styles.useRecommendationBtnActive,
                  ]}
                  onPress={useRecommendedSteps}
                  activeOpacity={0.75}
                >
                  <Text style={styles.useRecommendationText}>
                    {Number(displayedStepGoal) === recommendedStepGoal
                      ? "Using"
                      : "Use"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recommendationFooter}>
                <Text style={styles.recommendationFooterText}>
                  Suggested target
                </Text>

                <Text style={styles.recommendationFooterValue}>
                  {recommendedStepGoal.toLocaleString()} steps
                </Text>
              </View>
            </View>
          </View>

          {/* Calculated Nutrition */}
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
              <MacroResult
                color={colors.protein}
                label="Protein"
                percentage="30%"
                value={`${macros.protein}g`}
              />

              <MacroResult
                color={colors.carbs}
                label="Carbs"
                percentage="40%"
                value={`${macros.carbs}g`}
              />

              <MacroResult
                color={colors.fat}
                label="Fat"
                percentage="30%"
                value={`${macros.fat}g`}
              />
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveAllBtn, isSaving && styles.btnDisabled]}
            onPress={handleSaveAll}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
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

type MacroResultProps = {
  color: string;
  label: string;
  percentage: string;
  value: string;
};

function MacroResult({ color, label, percentage, value }: MacroResultProps) {
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
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  navTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  saveNavText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    minWidth: 75,
    textAlign: "right",
  },

  disabledText: {
    opacity: 0.4,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  intro: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 4,
    marginBottom: 4,
  },

  introIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.4,
  },

  introText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 4,
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
    borderRadius: 13,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  accountDetails: {
    flex: 1,
  },

  accountName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  accountEmail: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },

  accountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },

  guestBadge: {
    backgroundColor: colors.warningBg,
  },

  authBadge: {
    backgroundColor: colors.successBg,
  },

  accountBadgeText: {
    fontSize: 10,
    fontWeight: "800",
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
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },

  createAccountBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  createAccountText: {
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  cardSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 3,
    maxWidth: 290,
  },

  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
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
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  segmentBtnActive: {
    backgroundColor: colors.primary,
  },

  segmentText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  segmentTextActive: {
    color: colors.background,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 8,
  },

  unitInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    minWidth: 0,
  },

  inputUnit: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "700",
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
    backgroundColor: colors.primaryMuted,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterActive: {
    borderColor: colors.primary,
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
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
  },

  multiplierBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
    backgroundColor: colors.surfaceBorder,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },

  optionDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },

  goalRow: {
    flexDirection: "row",
    gap: 7,
  },

  goalCard: {
    flex: 1,
    minHeight: 106,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  goalCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },

  goalIndicator: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  goalIndicatorActive: {
    backgroundColor: colors.primary,
  },

  goalTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
    textAlign: "center",
  },

  goalTitleActive: {
    color: colors.primary,
  },

  goalDesc: {
    fontSize: 9,
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  adjustmentLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },

  adjustmentHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },

  adjustmentValue: {
    fontSize: 14,
    fontWeight: "900",
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
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },

  stepBtnDisabled: {
    opacity: 0.3,
  },

  stepBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text,
  },

  presetChips: {
    flexDirection: "row",
    gap: 5,
  },

  presetChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
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
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  presetChipTextActive: {
    color: colors.background,
  },

  recommendationCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
    gap: 10,
  },

  recommendationTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  recommendationContent: {
    flex: 1,
  },

  recommendationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  recommendationTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
  },

  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.successBg,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },

  recommendedBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.protein,
  },

  recommendationDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },

  recommendationAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  targetInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 9,
    paddingHorizontal: 10,
  },

  targetInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    paddingVertical: 9,
    minWidth: 0,
  },

  targetUnit: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "700",
  },

  useRecommendationBtn: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: colors.surfaceBorder,
  },

  useRecommendationBtnActive: {
    backgroundColor: colors.successBg,
  },

  useRecommendationText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text,
  },

  recommendationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 2,
  },

  recommendationFooterText: {
    fontSize: 10,
    color: colors.textMuted,
  },

  recommendationFooterValue: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
  },

  resultHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  resultTitleContent: {
    flex: 1,
  },

  resultEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },

  resultCalories: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.8,
    marginTop: 3,
  },

  resultUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: -2,
  },

  calculationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  calculationBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
  },

  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 10,
  },

  resultMetaItem: {
    flex: 1,
    alignItems: "center",
  },

  resultMetaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
  },

  resultMetaValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },

  resultMetaDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.surfaceBorder,
  },

  resultDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 14,
  },

  macroSplitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  macroSplitCol: {
    flex: 1,
    gap: 4,
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
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "600",
  },

  macroPercentage: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: "600",
  },

  macroTagVal: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
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
    marginTop: -4,
  },

  btnDisabled: {
    opacity: 0.5,
  },
});
