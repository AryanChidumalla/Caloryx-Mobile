import SavedFoodsPicker from "@/components/SavedFoodsPicker";
import { useNutrition } from "@/context/NutritionContext";
import { searchFoods, SupabaseFood } from "@/services/foodService";
import { colors, globalStyles } from "@/styles/global";
import { MealType, SavedFood } from "@/types/nutrition";
import { formatDateForDisplay } from "@/utils/date";
import {
  estimateCaloriesFromMacros,
  sanitizeNumber,
} from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEAL_TYPES: {
  type: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { type: "breakfast", label: "Breakfast", icon: "sunny-outline" },
  { type: "lunch", label: "Lunch", icon: "restaurant-outline" },
  { type: "dinner", label: "Dinner", icon: "moon-outline" },
  { type: "snack", label: "Snack", icon: "nutrition-outline" },
];

type ActiveTab = "search" | "manual" | "saved";

export default function AddMealScreen() {
  const insets = useSafeAreaInsets();
  const {
    selectedDate,
    preselectedMealType,
    editingMeal,
    setEditingMeal,
    addMealEntry,
    updateMealEntry,
    deleteMealEntry,
    saveCustomFood,
  } = useNutrition();

  const [activeTab, setActiveTab] = useState<ActiveTab>("search");

  // Food search state
  const [foodSearch, setFoodSearch] = useState("");
  const [foodResults, setFoodResults] = useState<SupabaseFood[]>([]);
  const [isSearchingFoods, setIsSearchingFoods] = useState(false);
  const [selectedFood, setSelectedFood] = useState<SupabaseFood | null>(null);

  // Form Fields
  const [mealType, setMealType] = useState<MealType>(
    preselectedMealType || "breakfast",
  );
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servings, setServings] = useState("1");
  const [foodId, setFoodId] = useState<number | null>(null);
  const [saveToFavorites, setSaveToFavorites] = useState(false);

  const handleFoodSearch = async (text: string) => {
    setFoodSearch(text);

    if (!text.trim()) {
      setFoodResults([]);
      return;
    }

    try {
      setIsSearchingFoods(true);
      const results = await searchFoods(text);
      setFoodResults(results);
    } catch (error) {
      console.error("Food search error:", error);
    } finally {
      setIsSearchingFoods(false);
    }
  };

  const handleSelectSupabaseFood = (food: SupabaseFood) => {
    Haptics.selectionAsync();
    setSelectedFood(food);
    setFoodId(food.id);
    setName(food.name);

    const baseCalories =
      food.calories_per_serving != null
        ? food.calories_per_serving
        : food.calories_per_100g != null
          ? food.calories_per_100g
          : 0;

    const baseProtein =
      food.protein_per_serving != null
        ? food.protein_per_serving
        : food.protein_per_100g != null
          ? food.protein_per_100g
          : 0;

    const baseCarbs =
      food.carbs_per_serving != null
        ? food.carbs_per_serving
        : food.carbs_per_100g != null
          ? food.carbs_per_100g
          : 0;

    const baseFat =
      food.fat_per_serving != null
        ? food.fat_per_serving
        : food.fat_per_100g != null
          ? food.fat_per_100g
          : 0;

    setCalories(String(Math.round(baseCalories)));
    setProtein(String(Math.round(baseProtein * 10) / 10));
    setCarbs(String(Math.round(baseCarbs * 10) / 10));
    setFat(String(Math.round(baseFat * 10) / 10));

    setServingSize(
      food.default_serving_unit ||
        (food.default_serving_weight_g
          ? `${food.default_serving_weight_g}g`
          : "1 serving"),
    );
    setServings("1");

    setFoodSearch("");
    setFoodResults([]);
    setActiveTab("manual");
  };

  const handleServingsChange = (val: string) => {
    setServings(val);
    const num = Number(val);
    if (!selectedFood || isNaN(num) || num <= 0) {
      return;
    }

    const baseCalories = selectedFood.calories_per_serving ?? 0;
    const baseProtein = selectedFood.protein_per_serving ?? 0;
    const baseCarbs = selectedFood.carbs_per_serving ?? 0;
    const baseFat = selectedFood.fat_per_serving ?? 0;

    setCalories(String(Math.round(baseCalories * num)));
    setProtein(String(Math.round(baseProtein * num * 10) / 10));
    setCarbs(String(Math.round(baseCarbs * num * 10) / 10));
    setFat(String(Math.round(baseFat * num * 10) / 10));
  };

  // Sync state when entering screen or when editingMeal / preselectedMealType changes
  const populateForm = useCallback(() => {
    if (editingMeal) {
      setName(editingMeal.name);
      setCalories(String(editingMeal.calories));
      setProtein(editingMeal.protein > 0 ? String(editingMeal.protein) : "");
      setCarbs(editingMeal.carbs > 0 ? String(editingMeal.carbs) : "");
      setFat(editingMeal.fat > 0 ? String(editingMeal.fat) : "");
      setServingSize(editingMeal.servingSize || "");
      setServings(String(editingMeal.servings || 1));
      setMealType(editingMeal.mealType);
      setFoodId(editingMeal.foodId ?? null);
      setSelectedFood(null);
      setActiveTab("manual");
    } else {
      setMealType(preselectedMealType || "breakfast");
      setActiveTab("search");
    }
  }, [editingMeal, preselectedMealType]);

  useFocusEffect(
    useCallback(() => {
      populateForm();
    }, [populateForm]),
  );

  const resetForm = () => {
    setSelectedFood(null);
    setFoodId(null);
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setServingSize("");
    setServings("1");
    setSaveToFavorites(false);
    setFoodSearch("");
    setFoodResults([]);
    setEditingMeal(null);
  };

  const handleEstimateCalories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const p = sanitizeNumber(protein, 0);
    const c = sanitizeNumber(carbs, 0);
    const f = sanitizeNumber(fat, 0);
    const estimated = estimateCaloriesFromMacros(p, c, f);
    if (estimated > 0) {
      setCalories(String(estimated));
    } else {
      Alert.alert(
        "Notice",
        "Enter protein, carbs, or fat values first to calculate calories.",
      );
    }
  };

  const handleSelectSavedFood = (food: SavedFood) => {
    setSelectedFood(null);
    setFoodId(null);
    setName(food.name);
    setCalories(String(food.calories));
    setProtein(food.protein > 0 ? String(food.protein) : "");
    setCarbs(food.carbs > 0 ? String(food.carbs) : "");
    setFat(food.fat > 0 ? String(food.fat) : "");
    setServingSize(food.servingSize || "");
    setServings("1");
    setActiveTab("manual");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a food or meal name.");
      return;
    }

    if (!calories.trim() || isNaN(Number(calories))) {
      Alert.alert("Missing Calories", "Please enter a valid calorie amount.");
      return;
    }

    const safeCalories = sanitizeNumber(calories, 0, true);
    const safeProtein = sanitizeNumber(protein, 0);
    const safeCarbs = sanitizeNumber(carbs, 0);
    const safeFat = sanitizeNumber(fat, 0);
    const safeServings = sanitizeNumber(servings, 1);

    try {
      if (editingMeal) {
        await updateMealEntry({
          ...editingMeal,
          name: name.trim(),
          calories: safeCalories,
          protein: safeProtein,
          carbs: safeCarbs,
          fat: safeFat,
          servingSize: servingSize.trim() || undefined,
          servings: safeServings,
          mealType,
          foodId,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        resetForm();
        router.navigate("/(tabs)");
      } else {
        await addMealEntry({
          name: name.trim(),
          calories: safeCalories,
          protein: safeProtein,
          carbs: safeCarbs,
          fat: safeFat,
          servingSize: servingSize.trim() || undefined,
          servings: safeServings,
          mealType,
          foodId,
          date: selectedDate,
        });

        if (saveToFavorites) {
          await saveCustomFood({
            name: name.trim(),
            calories: safeCalories,
            protein: safeProtein,
            carbs: safeCarbs,
            fat: safeFat,
            servingSize: servingSize.trim() || undefined,
            isFavorite: true,
          });
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        resetForm();
        router.navigate("/(tabs)");
      }
    } catch (error) {
      console.error("Failed to save meal:", error);
      Alert.alert("Unable to Save", "Something went wrong while saving this meal.");
    }
  };

  const handleDelete = () => {
    if (!editingMeal) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Meal Entry",
      `Are you sure you want to delete "${editingMeal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMealEntry(editingMeal.id);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              resetForm();
              router.navigate("/(tabs)");
            } catch (error) {
              console.error("Failed to delete meal:", error);
              Alert.alert(
                "Unable to Delete",
                "Something went wrong while deleting this meal.",
              );
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    resetForm();
    router.navigate("/(tabs)");
  };

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
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={globalStyles.title}>
                {editingMeal ? "Edit Meal" : "Log Food"}
              </Text>
              <Text style={styles.dateSubtitle}>
                {formatDateForDisplay(selectedDate)}
              </Text>
            </View>

            {editingMeal && (
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Segmented Switch */}
          {!editingMeal && (
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeTab === "search" && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab("search");
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={15}
                  color={
                    activeTab === "search" ? colors.background : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === "search" && styles.segmentTextActive,
                  ]}
                >
                  Search Database
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeTab === "manual" && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab("manual");
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={15}
                  color={
                    activeTab === "manual" ? colors.background : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === "manual" && styles.segmentTextActive,
                  ]}
                >
                  Manual Entry
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeTab === "saved" && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab("saved");
                }}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={15}
                  color={
                    activeTab === "saved" ? colors.background : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === "saved" && styles.segmentTextActive,
                  ]}
                >
                  Saved Foods
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tab 1: Database Search */}
          {!editingMeal && activeTab === "search" && (
            <View style={styles.searchSection}>
              <View style={styles.searchInputContainer}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search foods (e.g. rice, chicken, roti, paneer)..."
                  placeholderTextColor={colors.textMuted}
                  value={foodSearch}
                  onChangeText={handleFoodSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {foodSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setFoodSearch("");
                      setFoodResults([]);
                    }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {isSearchingFoods && (
                <View style={styles.searchLoading}>
                  <ActivityIndicator color={colors.text} />
                  <Text style={styles.loadingText}>Searching foods...</Text>
                </View>
              )}

              {!isSearchingFoods &&
                foodSearch.trim() !== "" &&
                foodResults.length === 0 && (
                  <View style={styles.emptySearch}>
                    <Ionicons
                      name="search-outline"
                      size={32}
                      color={colors.textMuted}
                    />
                    <Text style={styles.emptySearchTitle}>No matching food found</Text>
                    <Text style={styles.emptySearchText}>
                      Can't find this food in the database? Create a custom entry.
                    </Text>
                    <TouchableOpacity
                      style={styles.customFoodButton}
                      onPress={() => {
                        setName(foodSearch.trim());
                        setSelectedFood(null);
                        setFoodId(null);
                        setActiveTab("manual");
                      }}
                    >
                      <Ionicons name="add" size={18} color={colors.background} />
                      <Text style={styles.customFoodButtonText}>
                        Create Custom Food
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

              {foodResults.length > 0 && (
                <View style={styles.resultsContainer}>
                  {foodResults.map((food) => {
                    const cal =
                      food.calories_per_serving != null
                        ? Math.round(food.calories_per_serving)
                        : food.calories_per_100g != null
                          ? Math.round(food.calories_per_100g)
                          : 0;

                    const pro =
                      food.protein_per_serving != null
                        ? Number(food.protein_per_serving).toFixed(1)
                        : food.protein_per_100g != null
                          ? Number(food.protein_per_100g).toFixed(1)
                          : "0";

                    const carbsVal =
                      food.carbs_per_serving != null
                        ? Number(food.carbs_per_serving).toFixed(1)
                        : "0";

                    const fatVal =
                      food.fat_per_serving != null
                        ? Number(food.fat_per_serving).toFixed(1)
                        : "0";

                    return (
                      <TouchableOpacity
                        key={food.id}
                        style={styles.foodResult}
                        onPress={() => handleSelectSupabaseFood(food)}
                      >
                        <View style={styles.foodResultContent}>
                          <View style={styles.foodNameRow}>
                            <Text style={styles.foodResultName} numberOfLines={1}>
                              {food.name}
                            </Text>
                            {food.hindi_name && (
                              <Text style={styles.hindiName}>
                                ({food.hindi_name})
                              </Text>
                            )}
                          </View>
                          <Text style={styles.foodResultMeta}>
                            {cal} kcal  •  {pro}g P  •  {carbsVal}g C  •  {fatVal}g F
                          </Text>
                          {food.default_serving_unit && (
                            <Text style={styles.foodResultServing}>
                              Serving: {food.default_serving_unit}
                            </Text>
                          )}
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {!foodSearch.trim() && (
                <View style={styles.searchHint}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.searchHintText}>
                    Search across 220+ verified foods including Indian dishes,
                    proteins, grains, dairy, and snacks.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Tab 2: Saved Foods */}
          {!editingMeal && activeTab === "saved" && (
            <SavedFoodsPicker onSelectFood={handleSelectSavedFood} />
          )}

          {/* Tab 3: Manual Entry / Log Form */}
          {(activeTab === "manual" || editingMeal) && (
            <View style={styles.form}>
              {/* Meal Type Selector */}
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

              {/* Servings & Serving Size */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Servings</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={servings}
                    onChangeText={handleServingsChange}
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
                    onPress={handleEstimateCalories}
                  >
                    <Ionicons
                      name="calculator-outline"
                      size={12}
                      color={colors.text}
                    />
                    <Text style={styles.estimateChipText}>
                      Estimate ($4P + 4C + 9F$)
                    </Text>
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
              <Text style={styles.fieldLabel}>Macronutrients</Text>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.macroTag}>
                    <View
                      style={[
                        styles.tagDot,
                        { backgroundColor: colors.protein },
                      ]}
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

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.macroTag}>
                    <View
                      style={[
                        styles.tagDot,
                        { backgroundColor: colors.carbs },
                      ]}
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

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.macroTag}>
                    <View
                      style={[
                        styles.tagDot,
                        { backgroundColor: colors.fat },
                      ]}
                    />
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

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editingMeal ? "Save Changes" : "Log Meal"}
                </Text>
              </TouchableOpacity>

              {editingMeal && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.alert}
                  />
                  <Text style={styles.deleteButtonText}>Delete Entry</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 14,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  dateSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentButtonActive: {
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
  searchSection: {
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  searchLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  emptySearch: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 8,
  },
  emptySearchTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySearchText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
  customFoodButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 6,
  },
  customFoodButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "800",
  },
  resultsContainer: {
    gap: 8,
  },
  foodResult: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 14,
  },
  foodResultContent: {
    flex: 1,
    gap: 2,
  },
  foodNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  foodResultName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  hindiName: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  foodResultMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  foodResultServing: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  searchHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 10,
  },
  searchHintText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
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
  inputGroup: {
    //
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
  calorieInput: {
    fontSize: 18,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 10,
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
