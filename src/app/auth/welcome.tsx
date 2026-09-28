import { useAuth } from "@/context/AuthContext";
import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { continueAsGuest } = useAuth();

  async function handleGuest() {
    Haptics.selectionAsync();
    await continueAsGuest();
    router.replace("/(tabs)");
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Badge */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="flash" size={16} color={colors.primary} />
          </View>
          <Text style={styles.logoText}>CALORYX</Text>
        </View>

        {/* Hero Title & Subtitle */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>
            Health, fitness &{"\n"}nutrition. Unified.
          </Text>
          <Text style={styles.subtitle}>
            Effortless workout logging, intelligent nutrition tracking, and daily wellness — beautifully in sync.
          </Text>
        </View>

        {/* 3 Pillar Features */}
        <View style={styles.pillarsContainer}>
          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconWrap, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}>
              <Ionicons name="barbell" size={18} color={colors.primary} />
            </View>
            <View style={styles.pillarTextWrap}>
              <Text style={styles.pillarTitle}>Workouts & Routines</Text>
              <Text style={styles.pillarDescription}>
                Real-time active logging, set progression, muscle breakdown, and customizable routines.
              </Text>
            </View>
          </View>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconWrap, { backgroundColor: "rgba(249, 115, 22, 0.12)" }]}>
              <Ionicons name="flame" size={18} color={colors.calories} />
            </View>
            <View style={styles.pillarTextWrap}>
              <Text style={styles.pillarTitle}>Nutrition & Macros</Text>
              <Text style={styles.pillarDescription}>
                Fast food search, calculated BMR/TDEE targets, macro breakdowns, and barcode scanning.
              </Text>
            </View>
          </View>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconWrap, { backgroundColor: "rgba(129, 140, 248, 0.12)" }]}>
              <Ionicons name="heart" size={18} color={colors.sleep} />
            </View>
            <View style={styles.pillarTextWrap}>
              <Text style={styles.pillarTitle}>Daily Health & Sleep</Text>
              <Text style={styles.pillarDescription}>
                Hydration tracking, pedometer/Health Connect step syncing, and rest recovery analysis.
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Hierarchy */}
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/auth/register");
            }}
          >
            <Text style={styles.primaryText}>Create an Account</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/auth/login");
            }}
          >
            <Text style={styles.secondaryText}>Sign In</Text>
          </Pressable>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Pressable style={styles.guestButton} onPress={handleGuest}>
            <Text style={styles.guestText}>Continue as Guest</Text>
            <Text style={styles.guestSubtext}>Explore with local device storage</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Private by design. Your data stays yours.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: "center",
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2.5,
    color: colors.text,
  },
  heroSection: {
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    fontWeight: "400",
  },
  pillarsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  pillarCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 14,
  },
  pillarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  pillarTextWrap: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  pillarDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  actions: {
    gap: 10,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  orText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  guestButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  guestText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  guestSubtext: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
});
