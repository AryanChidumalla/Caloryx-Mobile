import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import { DailyGoals } from "@/types/nutrition";
import {
  estimateCaloriesFromMacros,
  sanitizeNumber,
} from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type GoalSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function GoalSettingsModal({
  visible,
  onClose,
}: GoalSettingsModalProps) {
  const insets = useSafeAreaInsets();
  const { goals, updateDailyGoals } = useNutrition();

  const [calories, setCalories] = useState(String(goals.calories));
  const [protein, setProtein] = useState(String(goals.protein));
  const [carbs, setCarbs] = useState(String(goals.carbs));
  const [fat, setFat] = useState(String(goals.fat));

  // Sync inputs when modal opens or goals change
  useEffect(() => {
    if (visible) {
      setCalories(String(goals.calories));
      setProtein(String(goals.protein));
      setCarbs(String(goals.carbs));
      setFat(String(goals.fat));
    }
  }, [visible, goals]);

  const pNum = sanitizeNumber(protein, 0);
  const cNum = sanitizeNumber(carbs, 0);
  const fNum = sanitizeNumber(fat, 0);
  const calNum = sanitizeNumber(calories, 0, true);
  const estimatedCalories = estimateCaloriesFromMacros(pNum, cNum, fNum);

  const applyPreset = (pPct: number, cPct: number, fPct: number) => {
    Haptics.selectionAsync();
    const baseCal = calNum > 500 ? calNum : 2000;
    const calcP = Math.round((baseCal * pPct) / 4);
    const calcC = Math.round((baseCal * cPct) / 4);
    const calcF = Math.round((baseCal * fPct) / 9);

    setProtein(String(calcP));
    setCarbs(String(calcC));
    setFat(String(calcF));
  };

  const handleSyncCalories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCalories(String(estimatedCalories));
  };

  const handleOpenCalculator = () => {
    onClose();
    router.push("/auth/profile-setup");
  };

  const handleSave = async () => {
    if (calNum <= 0) {
      Alert.alert("Invalid Target", "Daily calories must be greater than 0.");
      return;
    }

    const newGoals: DailyGoals = {
      calories: calNum,
      protein: pNum,
      carbs: cNum,
      fat: fNum,
    };

    await updateDailyGoals(newGoals);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View
          style={[
            styles.container,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Daily Nutrition Goals</Text>
              <Text style={styles.subtitle}>
                Set your daily calorie and macronutrient targets
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Calculator Link */}
            <TouchableOpacity
              style={styles.calculatorBanner}
              onPress={handleOpenCalculator}
            >
              <View style={styles.calculatorBannerIcon}>
                <Ionicons name="body-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.calculatorBannerTitle}>
                  Profile & Goals Calculator
                </Text>
                <Text style={styles.calculatorBannerSub}>
                  Calculate BMR & TDEE based on your body stats & activity
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Presets */}
            <Text style={styles.sectionLabel}>Macro Presets</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => applyPreset(0.3, 0.4, 0.3)}
              >
                <Text style={styles.presetText}>Balanced</Text>
                <Text style={styles.presetSub}>30P • 40C • 30F</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => applyPreset(0.4, 0.35, 0.25)}
              >
                <Text style={styles.presetText}>High Protein</Text>
                <Text style={styles.presetSub}>40P • 35C • 25F</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => applyPreset(0.35, 0.2, 0.45)}
              >
                <Text style={styles.presetText}>Low Carb</Text>
                <Text style={styles.presetSub}>35P • 20C • 45F</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Daily Calorie Target (kcal)</Text>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                placeholder="2000"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.macroInputsRow}>
              <View style={styles.macroInputCol}>
                <View style={styles.macroHeaderRow}>
                  <View
                    style={[
                      styles.macroDot,
                      { backgroundColor: colors.protein },
                    ]}
                  />
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                </View>
                <TextInput
                  style={[styles.input, { borderColor: colors.proteinMuted }]}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholder="150"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.macroInputCol}>
                <View style={styles.macroHeaderRow}>
                  <View
                    style={[
                      styles.macroDot,
                      { backgroundColor: colors.carbs },
                    ]}
                  />
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                </View>
                <TextInput
                  style={[styles.input, { borderColor: colors.carbsMuted }]}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  placeholder="200"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.macroInputCol}>
                <View style={styles.macroHeaderRow}>
                  <View
                    style={[
                      styles.macroDot,
                      { backgroundColor: colors.fat },
                    ]}
                  />
                  <Text style={styles.inputLabel}>Fat (g)</Text>
                </View>
                <TextInput
                  style={[styles.input, { borderColor: colors.fatMuted }]}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  placeholder="67"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Macro Calculation Helper */}
            <View style={styles.calcHelperCard}>
              <View style={styles.calcHelperHeader}>
                <Ionicons
                  name="calculator-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.calcHelperTitle}>Macro Sum Energy</Text>
              </View>
              <Text style={styles.calcHelperText}>
                {pNum}g P × 4 + {cNum}g C × 4 + {fNum}g F × 9 ={" "}
                <Text style={styles.calcHelperBold}>
                  {estimatedCalories} kcal
                </Text>
              </Text>
              {estimatedCalories !== calNum && estimatedCalories > 0 && (
                <TouchableOpacity
                  style={styles.syncButton}
                  onPress={handleSyncCalories}
                >
                  <Text style={styles.syncButtonText}>
                    Set Calorie Target to {estimatedCalories} kcal
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Goals</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  calculatorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    marginBottom: 18,
    gap: 12,
  },
  calculatorBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  calculatorBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  calculatorBannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  presetChip: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
  },
  presetText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  presetSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
  },
  macroInputsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  macroInputCol: {
    flex: 1,
  },
  macroHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  calcHelperCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  calcHelperHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  calcHelperTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  calcHelperText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  calcHelperBold: {
    fontWeight: "700",
    color: colors.primary,
  },
  syncButton: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    alignItems: "center",
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
});
