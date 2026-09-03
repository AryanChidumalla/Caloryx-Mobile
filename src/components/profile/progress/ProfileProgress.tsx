import {
  ActivityProgressChart,
  CalorieConsistencyChart,
  GoalProgressCard,
  MacroProgressCard,
  ProgressSummaryCards,
  TimeFilterPills,
  UpdateGoalsButton,
  WaterProgressChart,
  WeightProgressChart,
} from "@/components/profile";
import { colors } from "@/styles/global";
import { TimeFilter } from "@/types/health";
import { Text, View } from "react-native";

type ProfileProgressProps = {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  currentWeight: number;
  weightData: any;
  activityData: any;
  waterData: any;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  stepGoal: number;
  waterGoal: number;
  currentGoal: any;
  nutritionData: any;
  daysCount: number;
  deficitOrSurplus: number;
};

export default function ProfileProgress({
  timeFilter,
  onTimeFilterChange,
  currentWeight,
  weightData,
  activityData,
  waterData,
  goals,
  stepGoal,
  waterGoal,
  currentGoal,
  nutritionData,
  daysCount,
  deficitOrSurplus,
}: ProfileProgressProps) {
  return (
    <View>
      {/* Progress Intro */}
      <View style={styles.progressIntro}>
        <Text style={styles.progressTitle}>Your Progress</Text>
        <Text style={styles.progressSubtitle}>
          See how your nutrition, activity, hydration, and weight are trending.
        </Text>
      </View>

      {/* Time Filter Pills */}
      <TimeFilterPills selected={timeFilter} onSelect={onTimeFilterChange} />

      {/* Top Summary Stat Tiles */}
      <ProgressSummaryCards
        currentWeight={currentWeight}
        weightDelta={weightData.deltaKg}
        calorieTarget={goals.calories}
        proteinTarget={goals.protein}
        stepGoal={stepGoal}
        waterGoal={waterGoal}
      />

      {/* Goal Progress Section */}
      <GoalProgressCard
        goal={currentGoal}
        calorieTarget={goals.calories}
        averageCalories={nutritionData.summary.averageCalories}
        consistencyPercent={nutritionData.summary.consistencyPercent}
        daysLogged={nutritionData.summary.daysLogged}
        totalDays={daysCount}
        deficitOrSurplus={deficitOrSurplus}
      />

      {/* 1. Calorie Consistency Chart */}
      <CalorieConsistencyChart
        points={nutritionData.points}
        targetCalories={goals.calories}
        averageCalories={nutritionData.summary.averageCalories}
        trend={nutritionData.trend}
      />

      {/* 2. Macronutrient Progress */}
      <MacroProgressCard summary={nutritionData.summary} goals={goals} />

      {/* 3. Steps & Activity Chart */}
      <ActivityProgressChart
        points={activityData.points}
        stepGoal={stepGoal}
        averageSteps={activityData.average}
        trend={activityData.trend}
      />

      {/* 4. Water & Hydration Chart */}
      <WaterProgressChart
        points={waterData.points}
        waterGoal={waterGoal}
        averageWater={waterData.average}
        trend={waterData.trend}
      />

      {/* 5. Weight Progression Chart */}
      <WeightProgressChart
        entries={weightData.entries}
        currentWeight={currentWeight}
        deltaKg={weightData.deltaKg}
        trend={weightData.trend}
        minWeight={weightData.minWeight}
        maxWeight={weightData.maxWeight}
      />

      {/* Prominent Update Goals Call To Action */}
      <UpdateGoalsButton />
    </View>
  );
}

const styles = {
  progressIntro: {
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: "900" as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  progressSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
};
