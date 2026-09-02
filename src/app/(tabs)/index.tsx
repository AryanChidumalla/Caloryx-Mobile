import CalorieOverview from "@/components/CalorieOverview";
import CopyButton from "@/components/CopyButton";
import DateNavigator from "@/components/DateNavigator";
import GoalSettingsModal from "@/components/GoalSettingsModal";
import HomeHeader from "@/components/HomeHeader";
import MacroProgressBars from "@/components/MacroProgressBars";
import MealSection from "@/components/MealSection";
import { useNutrition } from "@/context/NutritionContext";
import { globalStyles } from "@/styles/global";
import { MealEntry, MealType } from "@/types/nutrition";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    mealBreakdown,
    deleteMealEntry,
    setEditingMeal,
    setPreselectedMealType,
  } = useNutrition();

  const [goalsModalVisible, setGoalsModalVisible] = useState(false);

  const handleAddMealForType = (type: MealType) => {
    setEditingMeal(null);
    setPreselectedMealType(type);
    router.navigate("/(tabs)/add-meal");
  };

  const handleEditMeal = (meal: MealEntry) => {
    setEditingMeal(meal);
    setPreselectedMealType(meal.mealType);
    router.navigate("/(tabs)/add-meal");
  };

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          onOpenGoals={() => setGoalsModalVisible(true)}
          onOpenAccount={() => router.push("/auth/account")}
        />

        <DateNavigator />

        <CalorieOverview onOpenGoals={() => setGoalsModalVisible(true)} />

        <MacroProgressBars />

        {/* Meal Categories */}
        <MealSection
          mealType="breakfast"
          title="Breakfast"
          iconName="sunny-outline"
          meals={mealBreakdown.breakfast.meals}
          totals={mealBreakdown.breakfast.totals}
          onAddMeal={handleAddMealForType}
          onEditMeal={handleEditMeal}
          onDeleteMeal={deleteMealEntry}
        />

        <MealSection
          mealType="lunch"
          title="Lunch"
          iconName="restaurant-outline"
          meals={mealBreakdown.lunch.meals}
          totals={mealBreakdown.lunch.totals}
          onAddMeal={handleAddMealForType}
          onEditMeal={handleEditMeal}
          onDeleteMeal={deleteMealEntry}
        />

        <MealSection
          mealType="dinner"
          title="Dinner"
          iconName="moon-outline"
          meals={mealBreakdown.dinner.meals}
          totals={mealBreakdown.dinner.totals}
          onAddMeal={handleAddMealForType}
          onEditMeal={handleEditMeal}
          onDeleteMeal={deleteMealEntry}
        />

        <MealSection
          mealType="snack"
          title="Snacks"
          iconName="nutrition-outline"
          meals={mealBreakdown.snack.meals}
          totals={mealBreakdown.snack.totals}
          onAddMeal={handleAddMealForType}
          onEditMeal={handleEditMeal}
          onDeleteMeal={deleteMealEntry}
        />

        <CopyButton />
      </ScrollView>

      <GoalSettingsModal
        visible={goalsModalVisible}
        onClose={() => setGoalsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});
