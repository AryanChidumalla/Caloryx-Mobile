import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { Exercise, MuscleGroup } from "@/types/workout";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "chest", label: "Chest" },
  { key: "back", label: "Back" },
  { key: "legs", label: "Legs" },
  { key: "shoulders", label: "Shoulders" },
  { key: "arms", label: "Arms" },
  { key: "core", label: "Core" },
  { key: "cardio", label: "Cardio" },
];

const EQUIPMENT_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All Equip" },
  { key: "barbell", label: "Barbell" },
  { key: "dumbbell", label: "Dumbbell" },
  { key: "cable", label: "Cable" },
  { key: "machine", label: "Machine" },
  { key: "bodyweight", label: "Bodyweight" },
];

const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";

export default function ExerciseSelectorScreen() {
  const router = useRouter();

  const { replacingIndex } = useLocalSearchParams<{
    replacingIndex?: string;
  }>();

  const {
    exercises,
    createCustomExercise,
    addExerciseToActive,
    replaceExerciseInActive,
  } = useWorkout();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");

  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<MuscleGroup>("chest");

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch =
        !search.trim() ||
        ex.name.toLowerCase().includes(search.toLowerCase().trim());

      const matchCat =
        selectedCategory === "all" ||
        ex.category?.toLowerCase() === selectedCategory;

      const matchEquip =
        selectedEquipment === "all" ||
        ex.equipment?.toLowerCase() === selectedEquipment;

      return matchSearch && matchCat && matchEquip;
    });
  }, [exercises, search, selectedCategory, selectedEquipment]);

  const handleSelect = (ex: Exercise) => {
    Haptics.selectionAsync();

    if (replacingIndex !== undefined) {
      replaceExerciseInActive(Number(replacingIndex), ex);
    } else {
      addExerciseToActive(ex);
    }

    setSearch("");
    router.back();
  };

  const handleOpenDetails = (ex: Exercise) => {
    Haptics.selectionAsync();

    router.push({
      pathname: "/exercise/[id]",
      params: {
        id: ex.id,
      },
    });
  };

  const handleCreateCustom = async () => {
    if (!customName.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const created = await createCustomExercise({
      name: customName.trim(),
      category: customCategory,
      equipment: "other",
    });

    setCustomName("");
    setIsCreatingCustom(false);

    handleSelect(created);
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseItem}>
      <TouchableOpacity
        style={styles.exerciseLeft}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        {item.image ? (
          <Image
            source={{
              uri: `${GITHUB_BASE_URL}${item.image}`,
            }}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.exerciseImagePlaceholder}>
            <Ionicons
              name="barbell-outline"
              size={20}
              color={colors.textMuted}
            />
          </View>
        )}

        <View style={styles.itemContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name
              .toLowerCase()
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </Text>

          <View style={styles.itemMeta}>
            <Text style={styles.itemCategory}>{item.category}</Text>

            {item.equipment && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.itemEquipment}>{item.equipment}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleOpenDetails(item)}
        style={styles.infoBtn}
        hitSlop={{
          top: 8,
          bottom: 8,
          left: 8,
          right: 8,
        }}
      >
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {replacingIndex !== undefined
              ? "Replace Exercise"
              : "Select Exercise"}
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises by name..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters - currently disabled just like the old selector */}
        <View style={styles.filtersSection} />

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="barbell-outline"
                size={32}
                color={colors.textMuted}
              />

              <Text style={styles.emptyText}>No exercises found</Text>

              <Text style={styles.emptySubText}>
                Try adjusting your search or category filters above.
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  closeButton: {
    padding: 4,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 9,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },

  filtersSection: {
    marginTop: 10,
    marginBottom: 4,
  },

  listContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },

  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    paddingVertical: 12,
  },

  exerciseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 100,
    backgroundColor: colors.surfaceLight,
  },

  exerciseImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 100,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },

  itemContent: {
    flex: 1,
  },

  itemName: {
    fontSize: 16,
    color: colors.text,
  },

  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },

  itemCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },

  dot: {
    fontSize: 10,
    color: colors.textMuted,
  },

  itemEquipment: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "capitalize",
  },

  infoBtn: {
    padding: 4,
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  emptySubText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
