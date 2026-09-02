import MealItemCard from "@/components/MealItemCard";
import { useNutrition } from "@/context/NutritionContext";
import { colors, globalStyles } from "@/styles/global";
import { DailyTotals, MealEntry } from "@/types/nutrition";
import { formatDateForDisplay } from "@/utils/date";
import {
  calculateDailyTotals,
  formatMacroString,
} from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DayGroup = {
  date: string;
  meals: MealEntry[];
  totals: DailyTotals;
};

export default function AllMealsScreen() {
  const insets = useSafeAreaInsets();
  const {
    meals,
    setSelectedDate,
    setEditingMeal,
    deleteMealEntry,
    clearAllMealsData,
  } = useNutrition();

  // Group meals by date descending
  const groupedDays = useMemo(() => {
    const map = new Map<string, MealEntry[]>();
    for (const meal of meals) {
      const dateKey = meal.date || "Unknown Date";
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(meal);
    }

    const groups: DayGroup[] = [];
    for (const [date, dayMeals] of map.entries()) {
      groups.push({
        date,
        meals: dayMeals,
        totals: calculateDailyTotals(dayMeals),
      });
    }

    // Sort descending by date
    groups.sort((a, b) => b.date.localeCompare(a.date));
    return groups;
  }, [meals]);

  const handleClearAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Clear All History",
      "Are you sure you want to permanently delete all logged meals across all dates? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All History",
          style: "destructive",
          onPress: async () => {
            await clearAllMealsData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  const handleEditMeal = (meal: MealEntry) => {
    setEditingMeal(meal);
    router.navigate("/(tabs)/add-meal");
  };

  const handleJumpToDay = (date: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
    router.navigate("/(tabs)");
  };

  const renderDayGroup = ({ item }: { item: DayGroup }) => {
    const dateLabel = formatDateForDisplay(item.date);

    return (
      <View style={styles.dayCard}>
        {/* Day Header */}
        <View style={styles.dayHeader}>
          <View>
            <Text style={styles.dayTitle}>{dateLabel}</Text>
            <Text style={styles.dayTotalsText}>
              {item.totals.calories} kcal  •  {formatMacroString(item.totals)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.jumpButton}
            onPress={() => handleJumpToDay(item.date)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.jumpButtonText}>View Day</Text>
            <Ionicons
              name="chevron-forward"
              size={12}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Meal List for this Day */}
        <View style={styles.dayMealsList}>
          {item.meals.map((meal) => (
            <MealItemCard
              key={meal.id}
              meal={meal}
              onPress={handleEditMeal}
              onDelete={deleteMealEntry}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={globalStyles.title}>Nutrition History</Text>
          <Text style={styles.historySubtitle}>
            {meals.length} total entries logged
          </Text>
        </View>

        {meals.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={15} color={colors.alert} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {groupedDays.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name="calendar-outline"
              size={32}
              color={colors.textMuted}
            />
          </View>
          <Text style={styles.emptyTitle}>No Meals Logged Yet</Text>
          <Text style={styles.emptySubtitle}>
            When you log meals, your daily nutrition history and macro breakdowns
            will appear here.
          </Text>
          <TouchableOpacity
            style={styles.startLoggingButton}
            onPress={() => router.navigate("/(tabs)/add-meal")}
          >
            <Text style={styles.startLoggingButtonText}>Log Your First Meal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groupedDays}
          keyExtractor={(item) => item.date}
          renderItem={renderDayGroup}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  historySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: {
    color: colors.alert,
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  dayTotalsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  jumpButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jumpButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  dayMealsList: {
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  startLoggingButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  startLoggingButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
});
