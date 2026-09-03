import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type ActivityGoalCardProps = {
  activityLevel?: string | null;
  goal?: string | null;
};

export default function ActivityGoalCard({
  activityLevel,
  goal,
}: ActivityGoalCardProps) {
  const formatValue = (value?: string | null) => {
    if (!value) return "Not set";

    const labels: Record<string, string> = {
      sedentary: "Sedentary",
      light: "Lightly Active",
      moderate: "Moderate",
      heavy: "Very Active",
      lose_fat: "Lose Fat",
      maintain: "Maintain Weight",
      build_muscle: "Build Muscle",
    };

    return labels[value] ?? value;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.sectionTitle}>Activity & Goal</Text>
          <Text style={styles.sectionSubtitle}>
            How you want to approach your fitness
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="fitness-outline" size={16} color={colors.primary} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="fitness-outline" size={17} color={colors.primary} />
          </View>

          <View style={styles.rowContent}>
            <Text style={styles.label}>Activity Level</Text>
            <Text style={styles.value}>{formatValue(activityLevel)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="flag-outline" size={17} color={colors.primary} />
          </View>

          <View style={styles.rowContent}>
            <Text style={styles.label}>Primary Goal</Text>
            <Text style={styles.value}>
              {goal ? formatValue(goal) : "Not set yet"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },

  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  rowContent: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 3,
  },

  value: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
});
