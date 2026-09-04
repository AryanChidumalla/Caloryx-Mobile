import { useNutrition } from "@/context/NutritionContext";
import { colors } from "@/styles/global";
import { formatDateForDisplay } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DateNavigator() {
  const { selectedDate, goToPreviousDay, goToNextDay } = useNutrition();

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToPreviousDay();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToNextDay();
  };

  return (
    <View style={styles.container}>
      {/* Previous Day */}
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={handlePrev}
        hitSlop={12}
        activeOpacity={0.6}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </TouchableOpacity>

      {/* Selected Date */}
      <View style={styles.centerSection}>
        <Text style={styles.dateText}>
          {formatDateForDisplay(selectedDate)}
        </Text>
      </View>

      {/* Next Day */}
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={handleNext}
        hitSlop={12}
        activeOpacity={0.6}
      >
        <Ionicons name="chevron-forward" size={22} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },

  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },

  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  dateText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.2,
  },
});
