import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
import { useNutrition } from "@/context/NutritionContext";
import { getGuestProfile } from "@/storage/nutritionStorage";
import { ActivityLevel, PrimaryGoal, Sex } from "@/types/nutrition";
import {
  calculateBMR,
  calculateMacroTargetsFromCalories,
  calculateRecommendedStepGoal,
  calculateRecommendedWaterGoal,
  calculateTargetCalories,
  calculateTDEE,
  sanitizeNumber,
  validateBodyStats,
  validateHealthGoals,
} from "@/utils/nutritionCalculations";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export function useGoalsForm() {
  const { mode, session, profile, saveProfile } = useAuth();
  const { updateDailyGoals } = useNutrition();
  const {
    updateWaterGoal,
    updateStepGoal,
    recordWeight,
    updateSleepGoal,
    sleepGoalMinutes,
  } = useHealth();

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
  const [inputSleepGoal, setInputSleepGoal] = useState<string | null>(null);

  const numWeight = sanitizeNumber(weight, 70);
  const numHeight = sanitizeNumber(height, 175);
  const numAge = sanitizeNumber(age, 25);

  const recommendedWaterGoal = useMemo(() => {
    return calculateRecommendedWaterGoal(numWeight);
  }, [numWeight]);

  const recommendedStepGoal = calculateRecommendedStepGoal(activity);
  const recommendedSleepGoal = 8; // 8 hours default

  const displayedWaterGoal =
    inputWaterGoal !== null ? inputWaterGoal : String(recommendedWaterGoal);

  const displayedStepGoal =
    inputStepGoal !== null ? inputStepGoal : String(recommendedStepGoal);

  const displayedSleepGoal =
    inputSleepGoal !== null
      ? inputSleepGoal
      : String(Math.round((sleepGoalMinutes || 480) / 60));

  const useRecommendedWater = () => {
    Haptics.selectionAsync();
    setInputWaterGoal(String(recommendedWaterGoal));
  };

  const useRecommendedSteps = () => {
    Haptics.selectionAsync();
    setInputStepGoal(String(recommendedStepGoal));
  };

  const useRecommendedSleep = () => {
    Haptics.selectionAsync();
    setInputSleepGoal(String(recommendedSleepGoal));
  };

  // Load existing profile or guest profile
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

        if (profile.primary_goal) {
          setGoal(profile.primary_goal);
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

  // Live calorie & macro calculations
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

  const handleSetAdjustment = (value: number) => {
    Haptics.selectionAsync();
    setCalorieAdjustment(Math.min(800, Math.max(150, value)));
  };

  const handleSaveAll = async () => {
    const statsValidation = validateBodyStats(numWeight, numHeight, numAge);
    if (!statsValidation.valid) {
      Alert.alert("Invalid Information", statsValidation.error);
      return;
    }

    const parsedWaterGoal = parseInt(displayedWaterGoal, 10);
    const parsedStepGoal = parseInt(displayedStepGoal, 10);

    const goalsValidation = validateHealthGoals(parsedWaterGoal, parsedStepGoal);
    if (!goalsValidation.valid) {
      Alert.alert("Invalid Target", goalsValidation.error);
      return;
    }

    setIsSaving(true);
    try {
      await saveProfile({
        sex,
        primary_goal: goal,
        age: Math.round(numAge),
        height: numHeight,
        weight: numWeight,
        activity_level: activity,
        target_calorie: targetCalories,
      });

      await recordWeight(numWeight);
      await updateDailyGoals(macros);
      await updateWaterGoal(parsedWaterGoal);
      await updateStepGoal(parsedStepGoal);

      const parsedSleepHours = Math.max(3, Math.min(14, parseFloat(displayedSleepGoal) || 8));
      await updateSleepGoal(Math.round(parsedSleepHours * 60));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Plan Updated",
        `Your daily plan is now ${targetCalories} kcal with ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat, ${parsedWaterGoal.toLocaleString()} ml water, ${parsedStepGoal.toLocaleString()} steps, and ${parsedSleepHours}h sleep.`,
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

  const email = isGuest
    ? "Local storage only"
    : session?.user?.email || "Authenticated";

  return {
    // Identity
    displayName,
    email,
    isGuest,
    isSaving,

    // Body Stats
    sex,
    setSex,
    age,
    setAge,
    height,
    setHeight,
    weight,
    setWeight,
    numWeight,

    // Activity & Goals
    activity,
    setActivity,
    goal,
    setGoal,
    calorieAdjustment,
    handleAdjustmentChange,
    handleSetAdjustment,

    // Health targets
    displayedWaterGoal,
    setInputWaterGoal,
    recommendedWaterGoal,
    useRecommendedWater,
    displayedStepGoal,
    setInputStepGoal,
    recommendedStepGoal,
    useRecommendedSteps,
    displayedSleepGoal,
    setInputSleepGoal,
    recommendedSleepGoal,
    useRecommendedSleep,

    // Live preview
    bmr,
    tdee,
    targetCalories,
    macros,

    // Actions
    handleSaveAll,
  };
}
