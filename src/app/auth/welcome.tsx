import { useAuth } from "@/context/AuthContext";
import { colors } from "@/styles/global";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  const { continueAsGuest } = useAuth();

  async function handleGuest() {
    Haptics.selectionAsync();
    await continueAsGuest();
    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>CALORYX</Text>

        <Text style={styles.title}>Track your nutrition.</Text>

        <Text style={styles.subtitle}>
          Keep track of your calories and macros, calculate personalized targets,
          and hit your daily nutrition goals.
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/auth/register");
            }}
          >
            <Text style={styles.primaryText}>Create an Account</Text>
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
          </Pressable>
        </View>
      </View>

      <Text style={styles.footer}>Your nutrition. Your data. Your choice.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  logo: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 3,
    color: colors.text,
    marginBottom: 32,
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 36,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 6,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  orText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  guestButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  guestText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    color: colors.textMuted,
    fontSize: 12,
  },
});
