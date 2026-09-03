import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type PersonalPlanCardProps = {
  calories?: number | string | null;
  protein?: number | string | null;
  carbs?: number | string | null;
  fat?: number | string | null;
  water?: number | string | null;
  steps?: number | string | null;
};

export default function PersonalPlanCard({
  calories,
  protein,
  carbs,
  fat,
  water,
  steps,
}: PersonalPlanCardProps) {
  const formatValue = (value?: number | string | null, fallback = "—") =>
    value !== null && value !== undefined && value !== ""
      ? String(value)
      : fallback;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.sectionTitle}>Personal Plan</Text>
          <Text style={styles.sectionSubtitle}>Your current daily targets</Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
        </View>
      </View>

      <View style={styles.content}>
        {/* Primary Calorie Target */}
        <View style={styles.primaryTarget}>
          <View style={styles.primaryIcon}>
            <Ionicons name="flame-outline" size={21} color={colors.primary} />
          </View>

          <View>
            <Text style={styles.primaryLabel}>Daily Calories</Text>
            <Text style={styles.primaryValue}>
              {formatValue(calories)} kcal
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Macro & Activity Targets */}
        <View style={styles.grid}>
          <PlanItem
            icon="fitness-outline"
            label="Protein"
            value={`${formatValue(protein)} g`}
          />

          <PlanItem
            icon="leaf-outline"
            label="Carbs"
            value={`${formatValue(carbs)} g`}
          />

          <PlanItem
            icon="water-outline"
            label="Water"
            value={`${formatValue(water)} ml`}
          />

          <PlanItem
            icon="walk-outline"
            label="Steps"
            value={formatValue(steps)}
          />
        </View>

        <View style={styles.divider} />

        <PlanItem
          icon="nutrition-outline"
          label="Fat"
          value={`${formatValue(fat)} g`}
        />
      </View>
    </View>
  );
}

type PlanItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function PlanItem({ icon, label, value }: PlanItemProps) {
  return (
    <View style={styles.planItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={17} color={colors.primary} />
      </View>

      <View style={styles.planItemContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
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
    paddingBottom: 8,
  },

  primaryTarget: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },

  primaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryMuted,
    marginRight: 12,
  },

  primaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  primaryValue: {
    fontSize: 21,
    fontWeight: "900",
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  planItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryMuted,
    marginRight: 10,
  },

  planItemContent: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
});
