import AddMealTabs, {
  ActiveNutritionTab,
} from "@/components/nutrition/AddMealTabs";
import MealForm from "@/components/nutrition/MealForm";
import SavedFoodsPicker from "@/components/nutrition/SavedFoodsPicker";
import SearchDatabase from "@/components/nutrition/SearchDatabase";
import { useNutrition } from "@/context/NutritionContext";
import { useFoodSearch } from "@/hooks/useFoodSearch";
import { useMealForm } from "@/hooks/useMealForm";
import { SupabaseFood } from "@/services/foodService";
import { colors, globalStyles } from "@/styles/global";
import { SavedFood } from "@/types/nutrition";
import { formatDateForDisplay } from "@/utils/date";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddMealScreen() {
  const insets = useSafeAreaInsets();
  const { selectedDate } = useNutrition();

  const [activeTab, setActiveTab] = useState<ActiveNutritionTab>("search");

  const {
    foodSearch,
    foodResults,
    isSearchingFoods,
    handleSearch,
    clearSearch,
  } = useFoodSearch();

  const {
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
    isSubmitting,
    onEstimateCalories,
    onSelectSupabaseFood,
    onSelectSavedFood,
    onCreateCustomFood,
    populateForm,
    resetForm,
    onSubmit,
    onDelete,
  } = useMealForm();

  // Populate form on screen focus
  useFocusEffect(
    useCallback(() => {
      populateForm();
      if (editingMeal) {
        setActiveTab("manual");
      }
    }, [populateForm, editingMeal]),
  );

  const handleTabChange = (tab: ActiveNutritionTab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const handleSelectFood = (food: SupabaseFood) => {
    onSelectSupabaseFood(food);
    clearSearch();
    setActiveTab("manual");
  };

  const handleSelectSaved = (food: SavedFood) => {
    onSelectSavedFood(food);
    setActiveTab("manual");
  };

  const handleCreateCustom = (foodName: string) => {
    onCreateCustomFood(foodName);
    setActiveTab("manual");
  };

  const handleCancel = () => {
    resetForm();
    clearSearch();
    router.navigate("/(tabs)/nutrition");
  };

  const handleFormSubmit = () => {
    onSubmit(() => {
      clearSearch();
      router.navigate("/(tabs)/nutrition");
    });
  };

  const handleFormDelete = () => {
    onDelete(() => {
      clearSearch();
      router.navigate("/(tabs)/nutrition");
    });
  };

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

          {/* Segmented Tabs (hidden during editing) */}
          {!editingMeal && (
            <AddMealTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          {/* Tab 1: Database Search */}
          {!editingMeal && activeTab === "search" && (
            <SearchDatabase
              foodSearch={foodSearch}
              foodResults={foodResults}
              isSearchingFoods={isSearchingFoods}
              onSearch={handleSearch}
              onClearSearch={clearSearch}
              onSelectFood={handleSelectFood}
              onCreateCustomFood={handleCreateCustom}
            />
          )}

          {/* Tab 2: Manual / Editing Form */}
          {(activeTab === "manual" || editingMeal) && (
            <MealForm
              editingMeal={editingMeal}
              mealType={mealType}
              setMealType={setMealType}
              name={name}
              setName={setName}
              servings={servings}
              onServingsChange={onServingsChange}
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
              isSubmitting={isSubmitting}
              onEstimateCalories={onEstimateCalories}
              onSubmit={handleFormSubmit}
              onDelete={handleFormDelete}
            />
          )}

          {/* Tab 3: Saved Foods Picker */}
          {!editingMeal && activeTab === "saved" && (
            <SavedFoodsPicker onSelectFood={handleSelectSaved} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
});
