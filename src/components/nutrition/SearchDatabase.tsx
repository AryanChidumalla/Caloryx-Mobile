import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SupabaseFood } from "@/services/foodService";
import { colors } from "@/styles/global";

type SearchDatabaseProps = {
  foodSearch: string;
  foodResults: SupabaseFood[];
  isSearchingFoods: boolean;

  onSearch: (text: string) => void;
  onClearSearch: () => void;
  onSelectFood: (food: SupabaseFood) => void;
  onCreateCustomFood: (name: string) => void;
};

export default function SearchDatabase({
  foodSearch,
  foodResults,
  isSearchingFoods,
  onSearch,
  onClearSearch,
  onSelectFood,
  onCreateCustomFood,
}: SearchDatabaseProps) {
  const hasSearch = foodSearch.trim() !== "";
  const hasResults = foodResults.length > 0;

  return (
    <View style={styles.searchSection}>
      {/* Search input */}
      <View style={styles.searchInputContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.textSecondary}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search foods (e.g. rice, chicken, roti, paneer)..."
          placeholderTextColor={colors.textMuted}
          value={foodSearch}
          onChangeText={onSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {hasSearch && (
          <TouchableOpacity onPress={onClearSearch} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {isSearchingFoods && (
        <View style={styles.searchLoading}>
          <ActivityIndicator color={colors.text} />

          <Text style={styles.loadingText}>Searching foods...</Text>
        </View>
      )}

      {/* No results */}
      {!isSearchingFoods && hasSearch && !hasResults && (
        <View style={styles.emptySearch}>
          <Ionicons name="search-outline" size={32} color={colors.textMuted} />

          <Text style={styles.emptySearchTitle}>No matching food found</Text>

          <Text style={styles.emptySearchText}>
            Can't find this food in the database? Create a custom entry.
          </Text>

          <TouchableOpacity
            style={styles.customFoodButton}
            onPress={() => onCreateCustomFood(foodSearch.trim())}
          >
            <Ionicons name="add" size={18} color={colors.background} />

            <Text style={styles.customFoodButtonText}>Create Custom Food</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {!isSearchingFoods && hasResults && (
        <View style={styles.resultsContainer}>
          {foodResults.map((food) => {
            const calories =
              food.calories_per_serving != null
                ? Math.round(food.calories_per_serving)
                : 0;

            const protein =
              food.protein_per_serving != null
                ? Number(food.protein_per_serving).toFixed(1)
                : "0";

            const carbs =
              food.carbs_per_serving != null
                ? Number(food.carbs_per_serving).toFixed(1)
                : "0";

            const fat =
              food.fat_per_serving != null
                ? Number(food.fat_per_serving).toFixed(1)
                : "0";

            return (
              <TouchableOpacity
                key={food.id}
                style={styles.foodResult}
                onPress={() => onSelectFood(food)}
                activeOpacity={0.7}
              >
                <View style={styles.foodResultContent}>
                  <View style={styles.foodNameRow}>
                    <Text style={styles.foodResultName} numberOfLines={1}>
                      {food.name}
                    </Text>

                    {food.aliases && (
                      <Text style={styles.hindiName} numberOfLines={1}>
                        ({food.aliases})
                      </Text>
                    )}
                  </View>

                  <Text style={styles.foodResultMeta}>
                    {protein}g P • {carbs}g C • {fat}g F
                  </Text>

                  {food.default_serving_unit && (
                    <Text style={styles.foodResultServing}>
                      Serving: {food.default_serving_unit}
                    </Text>
                  )}
                </View>

                <Text style={styles.calorieText}>{calories} kcal</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    gap: 12,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },

  searchLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  emptySearch: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 8,
  },

  emptySearchTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },

  emptySearchText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },

  customFoodButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 6,
  },

  customFoodButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "800",
  },

  resultsContainer: {
    gap: 8,
  },

  foodResult: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 14,
  },

  foodResultContent: {
    flex: 1,
    gap: 2,
  },

  foodNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  foodResultName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  hindiName: {
    color: colors.textSecondary,
    fontSize: 13,
    flexShrink: 1,
  },

  foodResultMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  foodResultServing: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  calorieText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.calories,
    marginLeft: 10,
  },
});
