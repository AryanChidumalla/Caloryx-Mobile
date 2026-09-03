import { useWorkout } from "@/context/WorkoutContext";
import { colors } from "@/styles/global";
import { Exercise, MuscleGroup } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ExerciseSelectorModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  title?: string;
};

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

export default function ExerciseSelectorModal({
  visible,
  onClose,
  onSelectExercise,
  title = "Select Exercise",
}: ExerciseSelectorModalProps) {
  const { exercises, createCustomExercise } = useWorkout();
  const router = useRouter();

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
    onSelectExercise(ex);
    setSearch("");
    onClose();
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
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseLeft}>
        {item.image ? (
          <Image
            source={{
              uri: `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${item.image}`,
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
            {item.name}
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
      </View>

      <View style={styles.itemActions}>
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

        <TouchableOpacity
          onPress={() => handleSelect(item)}
          style={styles.addIconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add-circle" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
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

        {/* Muscle Category Filters */}
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

          {/* Equipment Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chipsScroll, { marginTop: 6 }]}
          >
            {EQUIPMENT_FILTERS.map((eq) => {
              const active = selectedEquipment === eq.key;
              return (
                <TouchableOpacity
                  key={eq.key}
                  style={[
                    styles.chipEquip,
                    active && styles.chipEquipActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedEquipment(eq.key);
                  }}
                >
                  <Text
                    style={[
                      styles.chipEquipText,
                      active && styles.chipEquipTextActive,
                    ]}
                  >
                    {eq.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Custom Exercise Creator Form */}
        {isCreatingCustom ? (
          <View style={styles.customBox}>
            <Text style={styles.customBoxTitle}>Create Custom Exercise</Text>
            <TextInput
              style={styles.customInput}
              placeholder="Exercise name (e.g. Incline Cable Flyes)"
              placeholderTextColor={colors.textMuted}
              value={customName}
              onChangeText={setCustomName}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6, marginVertical: 4 }}
            >
              {CATEGORIES.filter((c) => c.key !== "all").map((cat) => {
                const active = customCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.chipEquip, active && styles.chipEquipActive]}
                    onPress={() => setCustomCategory(cat.key as MuscleGroup)}
                  >
                    <Text
                      style={[
                        styles.chipEquipText,
                        active && styles.chipEquipTextActive,
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
                style={styles.customSave}
                onPress={handleCreateCustom}
              >
                <Text style={styles.customSaveText}>Add & Select</Text>
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
      </SafeAreaView>
    </Modal>
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
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
  chipEquip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  chipEquipActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  chipEquipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  chipEquipTextActive: {
    color: colors.text,
    fontWeight: "700",
  },
  createPromptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  createPromptText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  customBox: {
    marginHorizontal: 16,
    marginTop: 10,
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
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
  },
  exerciseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  exerciseImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  exerciseImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
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
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoBtn: {
    padding: 4,
  },
  addIconBtn: {
    padding: 2,
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
