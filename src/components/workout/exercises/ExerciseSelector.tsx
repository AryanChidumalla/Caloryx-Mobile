import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { Exercise, MuscleGroup } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";

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

export type ExerciseSelectorProps = {
  title?: string;
  onSelectExercise: (exercise: Exercise) => void;
  onClose?: () => void;
  headerRight?: React.ReactNode;
};

export default function ExerciseSelector({
  title = "Select Exercise",
  onSelectExercise,
  onClose,
  headerRight,
}: ExerciseSelectorProps) {
  const router = useRouter();
  const { exercises, createCustomExercise } = useWorkout();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Custom exercise creation state
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<MuscleGroup>("chest");
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  const filteredExercises = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchSearch = !trimmed || ex.name.toLowerCase().includes(trimmed);
      const matchCat =
        selectedCategory === "all" ||
        ex.category?.toLowerCase() === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [exercises, search, selectedCategory]);

  const handleSelect = (exercise: Exercise) => {
    Haptics.selectionAsync();
    onSelectExercise(exercise);
  };

  const handleOpenDetails = (exercise: Exercise) => {
    Haptics.selectionAsync();
    router.push({
      pathname: "/exercise/[id]",
      params: { id: exercise.id },
    });
  };

  const handleCreateCustom = async () => {
    const trimmedName = customName.trim();
    if (!trimmedName || isSubmittingCustom) return;

    try {
      setIsSubmittingCustom(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const created = await createCustomExercise({
        name: trimmedName,
        category: customCategory,
        equipment: "other",
      });
      setCustomName("");
      setIsCreatingCustom(false);
      handleSelect(created);
    } finally {
      setIsSubmittingCustom(false);
    }
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
            source={{ uri: `${GITHUB_BASE_URL}${item.image}` }}
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
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerActions}>
          {headerRight}
          {onClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Input */}
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
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Muscle Group Filter Pills */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(cat.key);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Custom Exercise Creator */}
      {isCreatingCustom ? (
        <View style={styles.customBox}>
          <Text style={styles.customBoxTitle}>Create Custom Exercise</Text>
          <TextInput
            style={styles.customInput}
            placeholder="Exercise name (e.g. Incline Cable Flyes)"
            placeholderTextColor={colors.textMuted}
            value={customName}
            onChangeText={setCustomName}
            autoFocus
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.customCatScroll}
          >
            {CATEGORIES.filter((c) => c.key !== "all").map((cat) => {
              const active = customCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => setCustomCategory(cat.key as MuscleGroup)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      active && styles.catChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.customActions}>
            <TouchableOpacity
              style={styles.customCancel}
              onPress={() => setIsCreatingCustom(false)}
            >
              <Text style={styles.customCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.customSave,
                (!customName.trim() || isSubmittingCustom) &&
                  styles.customSaveDisabled,
              ]}
              onPress={handleCreateCustom}
              disabled={!customName.trim() || isSubmittingCustom}
            >
              <Text style={styles.customSaveText}>
                {isSubmittingCustom ? "Adding..." : "Add & Select"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.createPromptButton}
          onPress={() => {
            setCustomName(search.trim());
            setIsCreatingCustom(true);
          }}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.createPromptText}>Create Custom Exercise</Text>
        </TouchableOpacity>
      )}

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="barbell-outline"
              size={32}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubText}>
              Try adjusting your search or category filters above, or create a
              custom exercise.
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.background,
    fontWeight: "800",
  },
  createPromptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  createPromptText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  customBox: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 10,
  },
  customBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  customInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  customCatScroll: {
    gap: 6,
    marginVertical: 4,
  },
  catChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  catChipActive: {
    backgroundColor: colors.primary,
  },
  catChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  catChipTextActive: {
    color: colors.background,
    fontWeight: "700",
  },
  customActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  customCancel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  customCancelText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  customSave: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  customSaveDisabled: {
    opacity: 0.5,
  },
  customSaveText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.background,
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
