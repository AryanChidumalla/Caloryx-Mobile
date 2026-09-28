import { StyleSheet } from "react-native";

export const colors = {
  background: "#0A0A0A", // Deep black background
  header: "#141414",
  surface: "#141414", // Dark card surface
  surfaceLight: "#1E1E1E", // Lighter container
  surfaceBorder: "#262626", // Subtle clean border
  surfaceBorderLight: "#333333",
  card: "#141414",

  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primaryMuted: "rgba(59, 130, 246, 0.12)",

  // Macro-specific color tokens (restrained & clean)
  calories: "#FFFFFF",
  caloriesMuted: "rgba(255, 255, 255, 0.1)",

  protein: "#34D399", // Emerald green for protein
  proteinMuted: "rgba(52, 211, 153, 0.12)",

  carbs: "#FBBF24", // Warm amber for carbs
  carbsMuted: "rgba(251, 191, 36, 0.12)",

  fat: "#F87171", // Coral red for fats
  fatMuted: "rgba(248, 113, 113, 0.12)",

  // Health pillars
  steps: "#F59E0B", // Amber gold for steps
  stepsMuted: "rgba(245, 158, 11, 0.12)",

  hydration: "#38BDF8", // Clean sky blue for water
  hydrationMuted: "rgba(56, 189, 248, 0.12)",

  sleep: "#818CF8", // Indigo lavender for sleep
  sleepMuted: "rgba(129, 140, 248, 0.12)",

  // Neutrals & Status
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  textMuted: "#555555",

  alert: "#F87171",
  alertBg: "rgba(239, 68, 68, 0.15)",

  warning: "#F59E0B",
  warningBg: "rgba(245, 158, 11, 0.15)",

  success: "#10B981",
  successBg: "rgba(16, 185, 129, 0.15)",

  // Accent
  accent: "#3B82F6",
  accentMuted: "rgba(59, 130, 246, 0.12)",
  accentDark: "#2563EB",

  overWarning: "#F87171",
  overWarningMuted: "rgba(251, 191, 36, 0.12)",

  overDanger: "#F87171",
  overDangerMuted: "rgba(248, 113, 113, 0.12)",

  // Workout
  workout: "#8B5CF6", // Purple
  workoutMuted: "rgba(139, 92, 246, 0.12)",

  strength: "#60A5FA", // Blue
  cardio: "#FB7185", // Pink/coral
  mobility: "#A78BFA", // Light purple

  // Progress
  progressTrack: "#262626",
  progressFill: "#FFFFFF",
  progressComplete: "#34D399",

  error: "#EF4444",
  errorBg: "rgba(239, 68, 68, 0.15)",

  info: "#60A5FA",
  infoBg: "rgba(96, 165, 250, 0.15)",

  // Interaction
  focus: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.70)",
};

export const typography = {
  h1: {
    fontSize: 26,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    color: colors.text,
  },
  h2: {
    fontSize: 20,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
    color: colors.text,
  },
  h3: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text,
  },
  body: {
    fontSize: 14,
    color: colors.text,
  },
  bodySecondary: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 11,
    color: colors.textMuted,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 0.8,
    color: colors.textSecondary,
    textTransform: "uppercase" as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
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
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  greetingBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  jumpTodayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  jumpTodayText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
