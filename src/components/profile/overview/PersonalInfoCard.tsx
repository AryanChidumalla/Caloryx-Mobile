import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type PersonalInfoCardProps = {
  age?: number | string | null;
  gender?: string | null;
  height?: number | string | null;
  weight?: number | string | null;
};

export default function PersonalInfoCard({
  age,
  gender,
  height,
  weight,
}: PersonalInfoCardProps) {
  const formatValue = (
    value: number | string | null | undefined,
    fallback = "Not set",
  ) => {
    return value !== undefined && value !== null && value !== ""
      ? String(value)
      : fallback;
  };

  const items = [
    {
      icon: "calendar-outline" as const,
      label: "Age",
      value: age ? `${age} years` : "Not set",
    },
    {
      icon: "person-outline" as const,
      label: "Gender",
      value: formatValue(gender),
    },
    {
      icon: "resize-outline" as const,
      label: "Height",
      value: height ? `${height} cm` : "Not set",
    },
    {
      icon: "scale-outline" as const,
      label: "Weight",
      value: weight ? `${weight} kg` : "Not set",
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.sectionSubtitle}>Your basic profile details</Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="person-outline" size={16} color={colors.primary} />
        </View>
      </View>

      <View style={styles.infoList}>
        {items.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.infoRow,
              index < items.length - 1 && styles.rowBorder,
            ]}
          >
            <View style={styles.labelContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={16} color={colors.primary} />
              </View>

              <Text style={styles.label}>{item.label}</Text>
            </View>

            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
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

  infoList: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },

  infoRow: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },

  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  value: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
  },
});
