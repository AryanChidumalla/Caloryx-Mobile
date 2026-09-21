import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/styles/global";
import { MealType } from "@/types/nutrition";

type ActiveTab = "search" | "manual" | "saved";

type MealFormProps = {
  editingMeal: boolean;

  mealType: MealType;
  setMealType: (value: MealType) => void;

  name: string;
  setName: (value: string) => void;

  servings: string;
  onServingsChange: (value: string) => void;

  servingSize: string;
  setServingSize: (value: string) => void;

  calories: string;
  setCalories: (value: string) => void;

  protein: string;
  setProtein: (value: string) => void;

  carbs: string;
  setCarbs: (value: string) => void;

  fat: string;
  setFat: (value: string) => void;

  saveToFavorites: boolean;
  setSaveToFavorites: (value: boolean) => void;

  onEstimateCalories: () => void;
  onSubmit: () => void;
  onDelete: () => void;
};

const MEAL_TYPES: {
  type: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    type: "breakfast",
    label: "Breakfast",
    icon: "sunny-outline",
  },
  {
    type: "lunch",
    label: "Lunch",
    icon: "restaurant-outline",
  },
  {
    type: "dinner",
    label: "Dinner",
    icon: "moon-outline",
  },
  {
    type: "snack",
    label: "Snack",
    icon: "nutrition-outline",
  },
];

export default function MealForm({
  editingMeal,
  mealType,
  setMealType,
  name,
  setName,
  servings,
  onServingsChange,
  servingSize,
  setServingSize,
  calories,
  setCalories,
  protein,
  setProtein,
  carbs,
  setCarbs,
  fat,
  setFat,
  saveToFavorites,
  setSaveToFavorites,
  onEstimateCalories,
  onSubmit,
  onDelete,
}: MealFormProps) {
  return (
    <View style={styles.form}>
      {/* Meal Type */}
      <View>
        <Text style={styles.fieldLabel}>Meal Category</Text>

        <View style={styles.mealTypeRow}>
          {MEAL_TYPES.map((item) => {
            const isSelected = mealType === item.type;

            return (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.mealTypePill,
                  isSelected && styles.mealTypePillSelected,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setMealType(item.type);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={isSelected ? colors.background : colors.textSecondary}
                />

                <Text
                  style={[
                    styles.mealTypeLabel,
                    isSelected && styles.mealTypeLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Food Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Food Name *</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Grilled Chicken Salad"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Servings + Serving Size */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Servings</Text>

          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={servings}
            onChangeText={onServingsChange}
          />
        </View>

        <View style={[styles.inputGroup, { flex: 2 }]}>
          <Text style={styles.fieldLabel}>Serving Unit / Size</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. 1 katori (150g), 1 cup"
            placeholderTextColor={colors.textMuted}
            value={servingSize}
            onChangeText={setServingSize}
          />
        </View>
      </View>

      {/* Calories */}
      <View style={styles.inputGroup}>
        <View style={styles.labelWithAction}>
          <Text style={styles.fieldLabel}>Calories (kcal) *</Text>

          <TouchableOpacity
            style={styles.estimateChip}
            onPress={onEstimateCalories}
            activeOpacity={0.7}
          >
            <Ionicons name="calculator-outline" size={12} color={colors.text} />

            <Text style={styles.estimateChipText}>Estimate (4P + 4C + 9F)</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, styles.calorieInput]}
          placeholder="e.g. 350"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
        />
      </View>

      {/* Macronutrients */}
      <View>
        <Text style={styles.fieldLabel}>Macronutrients</Text>

        <View style={styles.row}>
          {/* Protein */}
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.macroTag}>
              <View
                style={[styles.tagDot, { backgroundColor: colors.protein }]}
              />

              <Text style={styles.tagText}>Protein (g)</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
            />
          </View>

          {/* Carbs */}
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.macroTag}>
              <View
                style={[styles.tagDot, { backgroundColor: colors.carbs }]}
              />

              <Text style={styles.tagText}>Carbs (g)</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
            />
          </View>

          {/* Fat */}
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.macroTag}>
              <View style={[styles.tagDot, { backgroundColor: colors.fat }]} />

              <Text style={styles.tagText}>Fat (g)</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={fat}
              onChangeText={setFat}
            />
          </View>
        </View>
      </View>

      {/* Save to Favorites */}
      {!editingMeal && (
        <View style={styles.favoriteRow}>
          <View style={styles.favoriteTextGroup}>
            <Text style={styles.favoriteTitle}>Save to My Foods</Text>

            <Text style={styles.favoriteSubtitle}>
              Save this item for quick 1-tap logging later
            </Text>
          </View>

          <Switch
            value={saveToFavorites}
            onValueChange={setSaveToFavorites}
            trackColor={{
              false: colors.surfaceLight,
              true: colors.primary,
            }}
          />
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={onSubmit}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {editingMeal ? "Save Changes" : "Log Meal"}
        </Text>
      </TouchableOpacity>

      {/* Delete */}
      {editingMeal && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={16} color={colors.alert} />

          <Text style={styles.deleteButtonText}>Delete Entry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginBottom: 6,
  },

  mealTypeRow: {
    flexDirection: "row",
    gap: 6,
  },

  mealTypePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingVertical: 10,
  },

  mealTypePillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  mealTypeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  mealTypeLabelSelected: {
    color: colors.background,
  },

  inputGroup: {},

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

  calorieInput: {
    fontSize: 18,
    fontWeight: "800",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  labelWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  estimateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  estimateChipText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: "600",
  },

  macroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },

  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  tagText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  favoriteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },

  favoriteTextGroup: {
    flex: 1,
    marginRight: 10,
  },

  favoriteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  favoriteSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },

  submitButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.alertBg,
    borderRadius: 14,
    paddingVertical: 14,
  },

  deleteButtonText: {
    color: colors.alert,
    fontSize: 15,
    fontWeight: "700",
  },
});
