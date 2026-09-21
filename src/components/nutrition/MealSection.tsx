import { colors } from "@/styles/global";
import { DailyTotals, MealEntry, MealType } from "@/types/nutrition";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MealItemCard from "./MealItemCard";

type MealSectionProps = {
  mealType: MealType;
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  meals: MealEntry[];
  totals: DailyTotals;
  onAddMeal: (type: MealType) => void;
  onEditMeal: (meal: MealEntry) => void;
  onDeleteMeal: (id: string) => void;
};

export default function MealSection({
  mealType,
  title,
  iconName,
  meals,
  totals,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
}: MealSectionProps) {
  const hasMeals = meals.length > 0;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddMeal(mealType);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <Ionicons name={iconName} size={16} color={colors.accent} />
          </View>

          <Text style={styles.titleText}>{title}</Text>
        </View>

        <View style={styles.headerRight}>
          {hasMeals && (
            <Text style={styles.headerCalories}>{totals.calories} kcal</Text>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {hasMeals ? (
        <View style={styles.mealsContainer}>
          {/* <View style={styles.macroSummaryRow}>
            <Text style={styles.macroSummaryText}>
              {formatMacroString(totals)}
            </Text>
          </View> */}

          {meals.map((meal) => (
            <MealItemCard
              key={meal.id}
              meal={meal}
              onPress={onEditMeal}
              onDelete={onDeleteMeal}
            />
          ))}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.emptyContainer}
          onPress={handleAdd}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyText}>
            No {title.toLowerCase()} logged yet
          </Text>
        </TouchableOpacity>
      )}

      {/* <TouchableOpacity
        style={styles.emptyContainer}
        onPress={handleAdd}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyText}>Add</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentMuted,
    justifyContent: "center",
    alignItems: "center",
  },

  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.2,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  headerCalories: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  macroSummaryRow: {
    marginBottom: 9,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },

  macroSummaryText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },

  // divider
  divider: {
    height: 1,
    marginTop: 12,
    marginBottom: 12,
    // width: 1,
    backgroundColor: colors.surfaceBorder,
    // marginHorizontal: 10,
  },

  mealsContainer: {
    // marginTop: 12,
    gap: 12,
  },

  emptyContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: "solid",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    // marginTop: 10,
  },

  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    // justifyContent: "center",
  },

  emptyAddPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  emptyPromptText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
