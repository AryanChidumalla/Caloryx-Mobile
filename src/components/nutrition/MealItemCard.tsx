import { colors } from "@/styles/global";
import { MealEntry } from "@/types/nutrition";
import { formatMacroString } from "@/utils/nutritionCalculations";
import * as Haptics from "expo-haptics";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MealItemCardProps = {
  meal: MealEntry;
  onPress: (meal: MealEntry) => void;
  onDelete: (id: string) => void;
};

export default function MealItemCard({
  meal,
  onPress,
  onDelete,
}: MealItemCardProps) {
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Meal Entry",
      `Are you sure you want to remove "${meal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete(meal.id);
          },
        },
      ],
    );
  };

  const servingInfo = [
    meal.servings && meal.servings !== 1 ? `${meal.servings} servings` : null,
    meal.servingSize || null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        Haptics.selectionAsync();
        onPress(meal);
      }}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {meal.name}
          </Text>
          <View>
            <Text style={styles.calorieText}>{meal.calories} kcal</Text>
          </View>
        </View>

        {servingInfo ? (
          <Text style={styles.servingText} numberOfLines={1}>
            {servingInfo}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <Text style={styles.macroText}>
            {formatMacroString({
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 48,
  },
  calorieText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.calories,
  },
  servingText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  macroText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
