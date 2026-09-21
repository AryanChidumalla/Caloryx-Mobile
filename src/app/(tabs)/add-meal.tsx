import MealForm from "@/components/nutrition/MealForm";
import SavedFoodsPicker from "@/components/nutrition/SavedFoodsPicker";
import SearchDatabase from "@/components/nutrition/SearchDatabase";
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
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  // ---------------------------------------------------------------------------
  // Screen state
  // ---------------------------------------------------------------------------

  const [activeTab, setActiveTab] = useState<ActiveTab>("search");

  // Search state
  const [foodSearch, setFoodSearch] = useState("");
  const [foodResults, setFoodResults] = useState<SupabaseFood[]>([]);
  const [isSearchingFoods, setIsSearchingFoods] = useState(false);
  const [selectedFood, setSelectedFood] = useState<SupabaseFood | null>(null);

  // Form state
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

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  const handleFoodSearch = async (text: string) => {
    setFoodSearch(text);

    const query = text.trim();

    if (!query) {
      setFoodResults([]);
      setIsSearchingFoods(false);
      return;
    }

    try {
      setIsSearchingFoods(true);

      const results = await searchFoods(query);

      setFoodResults(results);
    } catch (error) {
      console.error("Food search error:", error);
      setFoodResults([]);
    } finally {
      setIsSearchingFoods(false);
    }
  };

  const clearFoodSearch = () => {
    setFoodSearch("");
    setFoodResults([]);
    setIsSearchingFoods(false);
  };

  const handleCreateCustomFood = (foodName: string) => {
    setName(foodName);
    setSelectedFood(null);
    setFoodId(null);
    setActiveTab("manual");
  };

  // ---------------------------------------------------------------------------
  // Food selection
  // ---------------------------------------------------------------------------

  const handleSelectSupabaseFood = (food: SupabaseFood) => {
    Haptics.selectionAsync();

    setSelectedFood(food);
    setFoodId(food.id);
    setName(food.name);

    setCalories(String(Math.round(food.calories_per_serving ?? 0)));

    setProtein(String(Math.round((food.protein_per_serving ?? 0) * 10) / 10));

    setCarbs(String(Math.round((food.carbs_per_serving ?? 0) * 10) / 10));

    setFat(String(Math.round((food.fat_per_serving ?? 0) * 10) / 10));

    setServingSize(
      food.default_serving_unit ||
        (food.default_serving_weight_g
          ? `${food.default_serving_weight_g}g`
          : "1 serving"),
    );

    setServings("1");

    clearFoodSearch();
    setActiveTab("manual");
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

  // ---------------------------------------------------------------------------
  // Form calculations
  // ---------------------------------------------------------------------------

  const handleServingsChange = (value: string) => {
    setServings(value);

    if (!selectedFood) {
      return;
    }

    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    setCalories(
      String(Math.round((selectedFood.calories_per_serving ?? 0) * amount)),
    );

    setProtein(
      String(
        Math.round((selectedFood.protein_per_serving ?? 0) * amount * 10) / 10,
      ),
    );

    setCarbs(
      String(
        Math.round((selectedFood.carbs_per_serving ?? 0) * amount * 10) / 10,
      ),
    );

    setFat(
      String(
        Math.round((selectedFood.fat_per_serving ?? 0) * amount * 10) / 10,
      ),
    );
  };

  const handleEstimateCalories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const estimated = estimateCaloriesFromMacros(
      sanitizeNumber(protein, 0),
      sanitizeNumber(carbs, 0),
      sanitizeNumber(fat, 0),
    );

    if (estimated > 0) {
      setCalories(String(estimated));
      return;
    }

    Alert.alert(
      "Notice",
      "Enter protein, carbs, or fat values first to calculate calories.",
    );
  };

  // ---------------------------------------------------------------------------
  // Form lifecycle
  // ---------------------------------------------------------------------------

  const resetForm = useCallback(() => {
    setActiveTab("search");

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
    setIsSearchingFoods(false);

    setEditingMeal(null);
  }, [setEditingMeal]);

  const populateForm = useCallback(() => {
    if (!editingMeal) {
      setMealType(preselectedMealType || "breakfast");
      setActiveTab("search");
      return;
    }

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
  }, [editingMeal, preselectedMealType]);

  useFocusEffect(
    useCallback(() => {
      populateForm();
    }, [populateForm]),
  );

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
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
          name: trimmedName,
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
        router.navigate("/(tabs)/nutrition");
        return;
      }

      await addMealEntry({
        name: trimmedName,
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
          name: trimmedName,
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
      router.navigate("/(tabs)/nutrition");
    } catch (error) {
      console.error("Failed to save meal:", error);

      Alert.alert(
        "Unable to Save",
        "Something went wrong while saving this meal.",
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = () => {
    if (!editingMeal) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      "Delete Meal Entry",
      `Are you sure you want to delete "${editingMeal.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
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

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleCancel = () => {
    resetForm();
    router.navigate("/(tabs)");
  };

  const handleTabChange = (tab: ActiveTab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 30 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
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

          {/* Tabs */}
          {!editingMeal && (
            <View style={styles.segmentContainer}>
              <TabButton
                active={activeTab === "search"}
                icon="search-outline"
                label="Search Database"
                onPress={() => handleTabChange("search")}
              />

              <TabButton
                active={activeTab === "manual"}
                icon="create-outline"
                label="Meal Form"
                onPress={() => handleTabChange("manual")}
              />

              <TabButton
                active={activeTab === "saved"}
                icon="bookmark-outline"
                label="Saved Foods"
                onPress={() => handleTabChange("saved")}
              />
            </View>
          )}

          {/* Search */}
          {!editingMeal && activeTab === "search" && (
            <SearchDatabase
              foodSearch={foodSearch}
              foodResults={foodResults}
              isSearchingFoods={isSearchingFoods}
              onSearch={handleFoodSearch}
              onClearSearch={clearFoodSearch}
              onSelectFood={handleSelectSupabaseFood}
              onCreateCustomFood={handleCreateCustomFood}
            />
          )}

          {/* Manual form */}
          {(activeTab === "manual" || editingMeal) && (
            <MealForm
              editingMeal={!!editingMeal}
              mealType={mealType}
              setMealType={setMealType}
              name={name}
              setName={setName}
              servings={servings}
              onServingsChange={handleServingsChange}
              servingSize={servingSize}
              setServingSize={setServingSize}
              calories={calories}
              setCalories={setCalories}
              protein={protein}
              setProtein={setProtein}
              carbs={carbs}
              setCarbs={setCarbs}
              fat={fat}
              setFat={setFat}
              saveToFavorites={saveToFavorites}
              setSaveToFavorites={setSaveToFavorites}
              onEstimateCalories={handleEstimateCalories}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          )}

          {/* Saved foods */}
          {!editingMeal && activeTab === "saved" && (
            <SavedFoodsPicker onSelectFood={handleSelectSavedFood} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Small reusable tab button
// -----------------------------------------------------------------------------

type TabButtonProps = {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function TabButton({ active, icon, label, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.segmentButton, active && styles.segmentButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={15}
        color={active ? colors.accent : colors.textSecondary}
      />

      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

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
    backgroundColor: colors.accentMuted,
    // borderColor: colors.accent,
    // borderWidth: 1,
  },

  segmentText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  segmentTextActive: {
    color: colors.accent,
  },
});
