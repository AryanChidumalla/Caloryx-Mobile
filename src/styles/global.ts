import { StyleSheet } from "react-native";

export const colors = {
  background: "#0A0A0A", // Deep black background
  header: "#141414",
  surface: "#141414", // Dark card surface
  surfaceLight: "#1E1E1E", // Lighter container
  surfaceBorder: "#262626", // Subtle clean border
  card: "#141414",

  primary: "#FFFFFF", // High contrast crisp white
  primaryDark: "#E5E5E5",
  primaryMuted: "rgba(255, 255, 255, 0.08)",

  // Macro-specific color tokens (restrained & clean)
  calories: "#FFFFFF",
  caloriesMuted: "rgba(255, 255, 255, 0.1)",

  protein: "#34D399", // Emerald green for protein
  proteinMuted: "rgba(52, 211, 153, 0.12)",

  carbs: "#FBBF24", // Warm amber for carbs
  carbsMuted: "rgba(251, 191, 36, 0.12)",

  fat: "#F87171", // Coral red for fats
  fatMuted: "rgba(248, 113, 113, 0.12)",

  // Neutrals & Status
  text: "#FFFFFF",
  textSecondary: "#888888",
  textMuted: "#555555",

  alert: "#EF4444",
  alertBg: "rgba(239, 68, 68, 0.15)",

  warning: "#F59E0B",
  warningBg: "rgba(245, 158, 11, 0.15)",

  success: "#10B981",
  successBg: "rgba(16, 185, 129, 0.15)",
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentPadding: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
  },
});
