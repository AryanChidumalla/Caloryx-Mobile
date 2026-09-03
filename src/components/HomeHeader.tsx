import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type HomeHeaderProps = {
  onOpenGoals?: () => void;
  onOpenAccount?: () => void;
};

export default function HomeHeader({
  onOpenGoals,
  onOpenAccount,
}: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.appName}>Caloryx</Text>
        <Text style={styles.tagline}>Health & Fitness Tracker</Text>
      </View>

      <View style={styles.actions}>
        {onOpenAccount && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onOpenAccount}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="person-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        )}

        {onOpenGoals && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onOpenGoals}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
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
