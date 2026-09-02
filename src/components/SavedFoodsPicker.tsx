import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import { SavedFood } from "@/types/nutrition";
import { formatMacroString } from "@/utils/nutritionCalculations";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SavedFoodsPickerProps = {
  onSelectFood: (food: SavedFood) => void;
};

export default function SavedFoodsPicker({
  onSelectFood,
}: SavedFoodsPickerProps) {
  const { savedFoods, deleteCustomFood } = useNutrition();
  const [search, setSearch] = useState("");

  const filteredFoods = useMemo(() => {
    if (!search.trim()) return savedFoods;
    const q = search.toLowerCase();
    return savedFoods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.servingSize && f.servingSize.toLowerCase().includes(q)),
    );
  }, [savedFoods, search]);

  const handleDelete = (food: SavedFood) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Saved Food",
      `Remove "${food.name}" from your saved foods?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCustomFood(food.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved foods..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {filteredFoods.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved foods found</Text>
          <Text style={styles.emptySubtitle}>
            Save foods while logging to quickly reuse them here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredFoods.map((food) => (
            <TouchableOpacity
              key={food.id}
              style={styles.foodCard}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectFood(food);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.foodInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.foodName} numberOfLines={1}>
                    {food.name}
                  </Text>
                  {food.isFavorite && (
                    <Ionicons name="star" size={12} color={colors.carbs} />
                  )}
                </View>
                {food.servingSize ? (
                  <Text style={styles.servingSize} numberOfLines={1}>
                    {food.servingSize}
                  </Text>
                ) : null}
                <Text style={styles.macroText}>
                  {formatMacroString(food)}
                </Text>
              </View>

              <View style={styles.cardRight}>
                <View style={styles.calBadge}>
                  <Text style={styles.calText}>{food.calories} cal</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(food)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={14}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  list: {
    gap: 8,
  },
  foodCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
  },
  foodInfo: {
    flex: 1,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  foodName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  servingSize: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  macroText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  calBadge: {
    backgroundColor: colors.caloriesMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  calText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.calories,
  },
  deleteButton: {
    padding: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
