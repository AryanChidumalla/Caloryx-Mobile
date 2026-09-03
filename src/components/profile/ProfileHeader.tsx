import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ProfileHeaderProps = {
  displayName: string;
  subtitle: string;
  isGuest: boolean;
};

export default function ProfileHeader({
  displayName,
  subtitle,
  isGuest,
}: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <View
              style={[
                styles.badge,
                isGuest ? styles.guestBadge : styles.authBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isGuest ? styles.guestBadgeText : styles.authBadgeText,
                ]}
              >
                {isGuest ? "Guest" : "Synced"}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={() => router.push("/profile/settings")}
        activeOpacity={0.7}
        accessibilityLabel="Edit Goals"
      >
        <Ionicons name="settings-outline" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  guestBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.12)",
  },
  authBadge: {
    backgroundColor: "rgba(52, 211, 153, 0.12)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  guestBadgeText: {
    color: colors.warning,
  },
  authBadgeText: {
    color: colors.protein,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
});
