import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type GoalsAccountCardProps = {
  displayName: string;
  email: string;
  isGuest: boolean;
};

export default function GoalsAccountCard({
  displayName,
  email,
  isGuest,
}: GoalsAccountCardProps) {
  return (
    <View style={styles.accountCard}>
      <View style={styles.accountRow}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </View>

        <View style={styles.accountDetails}>
          <Text style={styles.accountName}>{displayName}</Text>
          <Text style={styles.accountEmail}>{email}</Text>
        </View>

        <View
          style={[
            styles.accountBadge,
            isGuest ? styles.guestBadge : styles.authBadge,
          ]}
        >
          <Text
            style={[
              styles.accountBadgeText,
              isGuest ? styles.guestBadgeText : styles.authBadgeText,
            ]}
          >
            {isGuest ? "Guest" : "Synced"}
          </Text>
        </View>
      </View>

      {isGuest && (
        <View style={styles.guestActions}>
          <TouchableOpacity
            style={styles.createAccountBtn}
            onPress={() => router.push("/auth/register")}
            activeOpacity={0.75}
          >
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push("/auth/login")}
            activeOpacity={0.75}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
    marginBottom: 16,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  accountEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accountBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  authBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  guestBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  accountBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  authBadgeText: {
    color: colors.primary,
  },
  guestBadgeText: {
    color: colors.warning,
  },
  guestActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 12,
  },
  createAccountBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  createAccountText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.background,
  },
  signInBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 10,
    alignItems: "center",
  },
  signInText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
});
