import GoalSettingsModal from "@/components/dashboard/GoalSettingsModal";
import MealSection from "@/components/nutrition/MealSection";
import SummarySection from "@/components/nutrition/SummarySection";
import { useAuth } from "@/context/AuthContext";
import { useNutrition } from "@/context/NutritionContext";
import { colors, globalStyles } from "@/styles/global";
import { MealEntry, MealType } from "@/types/nutrition";
import { formatDateForDisplay, isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
    refreshAll,
    isLoading,
  } = useNutrition();

  const displayName =
    profile?.username ||
    user?.email?.split("@")[0] ||
    (mode === "guest" ? "Guest" : "there");

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

  const isCurrentDateToday = isToday(selectedDate);

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header */}
        <View style={styles.header}>
          <View>
            <Text style={globalStyles.title}>Nutrition</Text>
            <Text style={styles.headerSubtitle}>
              Daily meals, macro tracking & foods
            </Text>
          </View>
        </View>

        {/* User Greeting & Date Bar */}
        <View style={styles.greetingBar}>
          <View>
            <Text style={styles.greetingText}>Hello, {displayName}</Text>
            <Text style={styles.dateLabelText}>
              {formatDateForDisplay(selectedDate)}
            </Text>
          </View>

          {!isCurrentDateToday && (
            <TouchableOpacity style={styles.jumpTodayBtn} onPress={goToToday}>
              <Ionicons name="today-outline" size={13} color={colors.primary} />
              <Text style={styles.jumpTodayText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Day Totals Summary Pill */}
        <SummarySection
          isCurrentDateToday={isCurrentDateToday}
          dailyTotals={dailyTotals}
          goals={goals}
        />

        {/* 1. Breakfast */}
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

        {/* 2. Lunch */}
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

        {/* 3. Dinner */}
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

        {/* 4. Snacks */}
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

        {/* <CopyButton /> */}
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
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  logActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  logActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.background,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.3,
  },
  dateLabelText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  greetingBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  jumpTodayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  jumpTodayText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
