import { colors } from "@/styles/global";
import { MealEntry } from "@/types/nutrition";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MealItem from "./MealItem";

type RecentMealsProps = {
  meals: MealEntry[];
  onDelete?: () => void;
};

export default function RecentMeals({ meals, onDelete }: RecentMealsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Logged Meals</Text>
      {meals.length === 0 ? (
        <Text style={styles.empty}>No meals logged yet.</Text>
      ) : (
        meals
          .slice(0, 5)
          .map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              onDelete={onDelete}
            />
          ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
