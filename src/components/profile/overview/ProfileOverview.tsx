import {
  ActivityGoalCard,
  PersonalInfoCard,
  PersonalPlanCard,
} from "@/components/profile";
import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ProfileOverviewProps = {
  profile: any;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  waterGoal: number;
  stepGoal: number;
};

export default function ProfileOverview({
  profile,
  goals,
  waterGoal,
  stepGoal,
}: ProfileOverviewProps) {
  return (
    <View style={styles.container}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Plan</Text>
          <Text style={styles.subtitle}>
            Your personal information, goals, and daily targets.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/profile/goals")}
          activeOpacity={0.75}
        >
          <Ionicons name="create-outline" size={14} color={colors.background} />
          <Text style={styles.editButtonText}>Edit Plan</Text>
        </TouchableOpacity>
      </View>

      <PersonalInfoCard
        age={profile?.age}
        gender={profile?.sex}
        height={profile?.height}
        weight={profile?.weight}
      />

      <ActivityGoalCard
        activityLevel={profile?.activity_level}
        goal={profile?.primary_goal}
      />

      <PersonalPlanCard
        calories={goals.calories}
        protein={goals.protein}
        carbs={goals.carbs}
        fat={goals.fat}
        water={waterGoal}
        steps={stepGoal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 20,
  },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 12,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.background,
  },
});
