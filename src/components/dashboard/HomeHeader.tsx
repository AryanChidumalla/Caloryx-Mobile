import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.appName}>Caloryx</Text>
        <Text style={styles.tagline}>Health & Fitness Tracker</Text>
      </View>

      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={() => router.push("/profile/settings")}
        activeOpacity={0.7}
        accessibilityLabel="Settings"
        accessibilityRole="button"
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
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "500",
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
