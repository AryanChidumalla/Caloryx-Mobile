import { useAuth } from "@/context/AuthContext";
import { getGuestProfile } from "@/storage/nutritionStorage";
import { colors } from "@/styles/global";
import { GuestProfile } from "@/types/nutrition";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { mode, session, profile, signOut } = useAuth();
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);

  const isGuest = mode === "guest";

  useEffect(() => {
    if (isGuest) {
      getGuestProfile().then(setGuestProfile);
    }
  }, [isGuest]);

  async function handleSignOut() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Sign Out", "Are you sure you want to sign out of Caloryx?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/auth/welcome");
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert(
              "Unable to sign out",
              "Something went wrong. Please try again.",
            );
          }
        },
      },
    ]);
  }

  if (mode === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.logo}>CALORYX</Text>

        <Text style={styles.title}>
          {isGuest ? "Guest Mode" : "Your Account"}
        </Text>

        {isGuest ? (
          <>
            <Text style={styles.subtitle}>
              You are currently using Caloryx in local guest mode. Create an
              account to sync your nutrition history to the cloud.
            </Text>

            {guestProfile && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>LOCAL BODY STATS & TARGETS</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Daily Target</Text>
                    <Text style={styles.statValue}>
                      {guestProfile.target_calorie ?? 2000} kcal
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Weight</Text>
                    <Text style={styles.statValue}>
                      {guestProfile.weight ? `${guestProfile.weight} kg` : "—"}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Height</Text>
                    <Text style={styles.statValue}>
                      {guestProfile.height ? `${guestProfile.height} cm` : "—"}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Activity</Text>
                    <Text style={styles.statValue}>
                      {guestProfile.activity_level ?? "moderate"}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.editTargetButton}
                  onPress={() => router.push("/auth/profile-setup")}
                >
                  <Text style={styles.editTargetButtonText}>
                    Update Profile & Target Goals
                  </Text>
                </Pressable>
              </View>
            )}

            {!guestProfile && (
              <Pressable
                style={styles.editTargetButton}
                onPress={() => router.push("/auth/profile-setup")}
              >
                <Text style={styles.editTargetButtonText}>
                  Calculate Daily Calorie Target
                </Text>
              </Pressable>
            )}

            <View style={styles.actions}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => router.push("/auth/register")}
              >
                <Text style={styles.primaryText}>Create an Account</Text>
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push("/auth/login")}
              >
                <Text style={styles.secondaryText}>Sign In</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Manage your profile, target calories, and account settings.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardHeader}>ACCOUNT</Text>
              <Text style={styles.emailText}>
                {session?.user.email ?? "Unknown"}
              </Text>
            </View>

            {profile && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>BODY STATS & TARGETS</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Daily Target</Text>
                    <Text style={styles.statValue}>
                      {profile.target_calorie ?? 2000} kcal
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Weight</Text>
                    <Text style={styles.statValue}>
                      {profile.weight ? `${profile.weight} kg` : "—"}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Height</Text>
                    <Text style={styles.statValue}>
                      {profile.height ? `${profile.height} cm` : "—"}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Activity</Text>
                    <Text style={styles.statValue}>
                      {profile.activity_level ?? "moderate"}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.editTargetButton}
                  onPress={() => router.push("/auth/profile-setup")}
                >
                  <Text style={styles.editTargetButtonText}>
                    Update Profile & Target Goals
                  </Text>
                </Pressable>
              </View>
            )}

            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  logo: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 3,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  emailText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    width: "48%",
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 10,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
    textTransform: "capitalize",
  },
  editTargetButton: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  editTargetButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
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
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  signOutText: {
    color: colors.alert,
    fontSize: 16,
    fontWeight: "800",
  },
});
