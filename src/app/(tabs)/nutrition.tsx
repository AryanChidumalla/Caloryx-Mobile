import NutritionDateHeader from "@/components/nutrition/NutritionDateHeader";
import NutritionMealList from "@/components/nutrition/NutritionMealList";
import SummarySection from "@/components/nutrition/SummarySection";
import { useAuth } from "@/context/AuthContext";
import { useNutrition } from "@/context/NutritionContext";
import { globalStyles } from "@/styles/global";
import { MealEntry, MealType } from "@/types/nutrition";
import { isToday } from "@/utils/date";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { profile, user, mode } = useAuth();
  const {
    mealBreakdown,
    dailyTotals,
    goals,
    deleteMealEntry,
    setEditingMeal,
    setPreselectedMealType,
    selectedDate,
    goToToday,
  } = useNutrition();

  const displayName =
    profile?.username ||
    user?.email?.split("@")[0] ||
    (mode === "guest" ? "Guest" : "there");

  const isCurrentDateToday = isToday(selectedDate);

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
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header & Date Section */}
        <NutritionDateHeader
          displayName={displayName}
          selectedDate={selectedDate}
          isToday={isCurrentDateToday}
          onGoToToday={goToToday}
        />

        {/* Day Totals Summary */}
        <SummarySection
          isCurrentDateToday={isCurrentDateToday}
          dailyTotals={dailyTotals}
          goals={goals}
        />

        {/* 4 Categorized Meal Sections */}
        <NutritionMealList
          mealBreakdown={mealBreakdown}
          onAddMeal={handleAddMealForType}
          onEditMeal={handleEditMeal}
          onDeleteMeal={deleteMealEntry}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
