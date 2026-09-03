import { useAuth } from "@/context/AuthContext";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { mode, session, profile, signOut } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isGuest = mode === "guest";

  const displayName =
    profile?.username ||
    session?.user?.email?.split("@")[0] ||
    (isGuest ? "Guest User" : "Caloryx User");

  const email = isGuest
    ? "Local storage only"
    : session?.user?.email || "Authenticated account";

  const handleToggleNotifications = (value: boolean) => {
    Haptics.selectionAsync();
    setNotificationsEnabled(value);
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert("Sign Out", "Are you sure you want to sign out of Caloryx?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setIsSigningOut(true);

            await signOut();

            router.replace("/auth/welcome");
          } catch (error: any) {
            console.error("Sign out error:", error);

            setIsSigningOut(false);

            Alert.alert(
              "Unable to sign out",
              error?.message || "Something went wrong. Please try again.",
            );
          }
        },
      },
    ]);
  };

  const handleGuestSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    router.push("/auth/login");
  };

  const handleCreateAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    router.push("/auth/register");
  };

  return (
    <View
      style={[
        globalStyles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={21} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Manage your account and app preferences.
            </Text>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          <View style={styles.card}>
            <View style={styles.accountRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={21} color={colors.primary} />
              </View>

              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{displayName}</Text>

                <Text style={styles.accountEmail}>{email}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isGuest ? styles.guestBadge : styles.syncedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isGuest ? styles.guestText : styles.syncedText,
                  ]}
                >
                  {isGuest ? "Guest" : "Synced"}
                </Text>
              </View>
            </View>

            {isGuest && (
              <View style={styles.guestActions}>
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={handleCreateAccount}
                  activeOpacity={0.75}
                >
                  <Text style={styles.primaryActionText}>Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={handleGuestSignIn}
                  activeOpacity={0.75}
                >
                  <Text style={styles.secondaryActionText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={colors.text}
                />
              </View>

              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Notifications</Text>

                <Text style={styles.settingDescription}>
                  Receive reminders and daily updates.
                </Text>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{
                  false: colors.surfaceBorder,
                  true: colors.primary,
                }}
                thumbColor={
                  notificationsEnabled
                    ? colors.background
                    : colors.textSecondary
                }
              />
            </View>
          </View>
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APP</Text>

          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <View style={styles.settingIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={colors.text}
                />
              </View>

              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>About Caloryx</Text>

                <Text style={styles.settingDescription}>
                  Your personal health and nutrition tracker.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={17}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons
                  name="code-slash-outline"
                  size={18}
                  color={colors.text}
                />
              </View>

              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Version</Text>

                <Text style={styles.settingDescription}>Caloryx</Text>
              </View>

              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Account Action */}
        {!isGuest && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACCOUNT ACTIONS</Text>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              disabled={isSigningOut}
              activeOpacity={0.75}
            >
              {isSigningOut ? (
                <ActivityIndicator size="small" color={colors.alert} />
              ) : (
                <Ionicons
                  name="log-out-outline"
                  size={19}
                  color={colors.alert}
                />
              )}

              <Text style={styles.signOutText}>
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.signOutHint}>
              You can sign back in anytime using your account.
            </Text>
          </View>
        )}

        {/* Guest notice */}
        {isGuest && (
          <View style={styles.guestNotice}>
            <Ionicons
              name="cloud-offline-outline"
              size={17}
              color={colors.warning}
            />

            <View style={styles.guestNoticeContent}>
              <Text style={styles.guestNoticeTitle}>
                You're using Guest Mode
              </Text>

              <Text style={styles.guestNoticeDescription}>
                Your data is stored locally on this device. Create an account to
                keep your data synced.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.6,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    marginTop: 3,
  },

  section: {
    gap: 8,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 2,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  accountEmail: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  guestBadge: {
    backgroundColor: colors.warningBg,
  },

  syncedBadge: {
    backgroundColor: colors.successBg,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  guestText: {
    color: colors.warning,
  },

  syncedText: {
    color: colors.success,
  },

  guestActions: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    paddingTop: 0,
  },

  primaryAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
  },

  primaryActionText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "800",
  },

  secondaryAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingVertical: 10,
  },

  secondaryActionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },

  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
  },

  settingDescription: {
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginLeft: 60,
  },

  versionText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },

  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.alertBg,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    borderRadius: 13,
    paddingVertical: 13,
  },

  signOutText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.alert,
  },

  signOutHint: {
    fontSize: 10,
    lineHeight: 15,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  guestNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 13,
    padding: 13,
  },

  guestNoticeContent: {
    flex: 1,
  },

  guestNoticeTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.warning,
  },

  guestNoticeDescription: {
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
    marginTop: 3,
  },
});
