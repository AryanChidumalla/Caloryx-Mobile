import { useAuth } from "@/context/AuthContext";
import {
  getTodaySteps,
  initializeHealthConnect,
  requestStepPermission,
} from "@/lib/healthConnect";
import {
  fetchAllUserDailyActivities,
  fetchAllUserWaterLogs,
  fetchUserDailyActivity,
  fetchUserWaterForDate,
  upsertUserDailyActivity,
  upsertUserWater,
} from "@/services/healthSync";
import {
  DEFAULT_STEP_GOAL,
  DEFAULT_WATER_GOAL_ML,
  getAllStoredActivityLogs,
  getAllStoredWaterLogs,
  getStoredActivityForDate,
  getStoredStepGoal,
  getStoredWaterForDate,
  getStoredWaterGoal,
  getStoredWeightLogs,
  recordStoredWeight,
  setStoredActivityForDate,
  setStoredStepGoal,
  setStoredWaterForDate,
  setStoredWaterGoal,
} from "@/storage/healthStorage";
import { DailyActivity, HealthConnectStatus } from "@/types/health";
import { getTodayDateString } from "@/utils/date";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

type HealthContextType = {
  // Water
  waterIntake: number;
  waterGoal: number;
  waterHistory: Record<string, number>;
  addWater: (amountMl: number, dateStr?: string) => Promise<number>;
  removeWater: (amountMl: number, dateStr?: string) => Promise<number>;
  updateWaterGoal: (newGoalMl: number) => Promise<void>;

  // Steps & Activity
  todaySteps: number;
  stepGoal: number;
  distanceMeters: number;
  caloriesBurned: number;
  activityHistory: Record<string, DailyActivity>;
  healthStatus: HealthConnectStatus;
  isConnectingHealth: boolean;
  connectHealthConnect: () => Promise<boolean>;
  refreshSteps: () => Promise<void>;
  updateStepGoal: (newGoal: number) => Promise<void>;

  // Weight History
  weightHistory: Record<string, number>;
  recordWeight: (weight: number, dateStr?: string) => Promise<void>;

  refreshHealth: () => Promise<void>;
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { session, mode } = useAuth();
  const userId = session?.user?.id ?? null;

  // Water State
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [waterGoal, setWaterGoal] = useState<number>(DEFAULT_WATER_GOAL_ML);
  const [waterHistory, setWaterHistory] = useState<Record<string, number>>({});

  // Steps & Activity State
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [stepGoal, setStepGoal] = useState<number>(DEFAULT_STEP_GOAL);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [activityHistory, setActivityHistory] = useState<
    Record<string, DailyActivity>
  >({});

  // Weight History State
  const [weightHistory, setWeightHistory] = useState<Record<string, number>>({});

  const [healthStatus, setHealthStatus] = useState<HealthConnectStatus>({
    isAvailable: Platform.OS === "android",
    isConnected: false,
    hasPermission: false,
    lastCheckedAt: new Date().toISOString(),
  });
  const [isConnectingHealth, setIsConnectingHealth] = useState(false);

  // Load initial water, activity & weight history
  const refreshHealth = useCallback(async () => {
    const today = getTodayDateString();

    // 1. Load water & water history
    try {
      const [storedGoal, storedWater, allWater] = await Promise.all([
        getStoredWaterGoal(),
        getStoredWaterForDate(today),
        getAllStoredWaterLogs(),
      ]);
      setWaterGoal(storedGoal);
      setWaterIntake(storedWater);
      setWaterHistory(allWater);

      if (mode === "authenticated" && userId) {
        const [cloudWater, cloudAllWater] = await Promise.all([
          fetchUserWaterForDate(userId, today),
          fetchAllUserWaterLogs(userId),
        ]);
        if (cloudWater !== null) {
          setWaterIntake(cloudWater);
          await setStoredWaterForDate(cloudWater, today);
        }
        if (Object.keys(cloudAllWater).length > 0) {
          setWaterHistory((prev) => ({ ...prev, ...cloudAllWater }));
        }
      }
    } catch (err) {
      console.warn("Failed to load water:", err);
    }

    // 2. Load step goal, cached activity & activity history
    try {
      const [storedStepGoal, storedActivity, allActivity] = await Promise.all([
        getStoredStepGoal(),
        getStoredActivityForDate(today),
        getAllStoredActivityLogs(),
      ]);
      setStepGoal(storedStepGoal);
      setActivityHistory(allActivity);

      if (storedActivity) {
        setTodaySteps(storedActivity.stepCount);
        setDistanceMeters(storedActivity.distanceMeters || 0);
        setCaloriesBurned(storedActivity.caloriesBurned || 0);
      }

      if (mode === "authenticated" && userId) {
        const [cloudActivity, cloudAllActivity] = await Promise.all([
          fetchUserDailyActivity(userId, today),
          fetchAllUserDailyActivities(userId),
        ]);
        if (cloudActivity) {
          setTodaySteps(cloudActivity.stepCount);
          setStepGoal(cloudActivity.stepGoal);
          setDistanceMeters(cloudActivity.distanceMeters || 0);
          setCaloriesBurned(cloudActivity.caloriesBurned || 0);
          await setStoredActivityForDate(cloudActivity);
        }
        if (Object.keys(cloudAllActivity).length > 0) {
          setActivityHistory((prev) => ({ ...prev, ...cloudAllActivity }));
        }
      }
    } catch (err) {
      console.warn("Failed to load activity:", err);
    }

    // 3. Load weight history
    try {
      const storedWeights = await getStoredWeightLogs();
      setWeightHistory(storedWeights);
    } catch (err) {
      console.warn("Failed to load weight history:", err);
    }
  }, [mode, userId]);

  // Attempt Health Connect connection & read
  const connectHealthConnect = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== "android") {
      setHealthStatus((prev) => ({
        ...prev,
        isAvailable: false,
        isConnected: false,
        lastCheckedAt: new Date().toISOString(),
      }));
      return false;
    }

    setIsConnectingHealth(true);
    try {
      const isInit = await initializeHealthConnect();
      if (!isInit) {
        setHealthStatus({
          isAvailable: false,
          isConnected: false,
          hasPermission: false,
          lastCheckedAt: new Date().toISOString(),
        });
        return false;
      }

      const hasPerm = await requestStepPermission();
      if (!hasPerm) {
        setHealthStatus({
          isAvailable: true,
          isConnected: false,
          hasPermission: false,
          lastCheckedAt: new Date().toISOString(),
        });
        return false;
      }

      // Read steps
      const steps = await getTodaySteps();
      const safeSteps = Math.max(0, steps);
      const estDistance = Math.round(safeSteps * 0.762); // ~0.762m per step
      const estCalories = Math.round(safeSteps * 0.04); // ~0.04 kcal per step

      setTodaySteps(safeSteps);
      setDistanceMeters(estDistance);
      setCaloriesBurned(estCalories);

      setHealthStatus({
        isAvailable: true,
        isConnected: true,
        hasPermission: true,
        lastCheckedAt: new Date().toISOString(),
      });

      const today = getTodayDateString();
      const activityData: DailyActivity = {
        date: today,
        stepCount: safeSteps,
        stepGoal,
        distanceMeters: estDistance,
        caloriesBurned: estCalories,
      };

      await setStoredActivityForDate(activityData);
      setActivityHistory((prev) => ({ ...prev, [today]: activityData }));

      if (mode === "authenticated" && userId) {
        await upsertUserDailyActivity(userId, activityData);
      }

      return true;
    } catch (err) {
      console.warn("Health Connect initialization/read notice:", err);
      setHealthStatus((prev) => ({
        ...prev,
        isConnected: false,
        lastCheckedAt: new Date().toISOString(),
      }));
      return false;
    } finally {
      setIsConnectingHealth(false);
    }
  }, [stepGoal, mode, userId]);

  // Refresh steps
  const refreshSteps = useCallback(async () => {
    if (Platform.OS === "android") {
      await connectHealthConnect();
    } else {
      await refreshHealth();
    }
  }, [connectHealthConnect, refreshHealth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshHealth();
    if (Platform.OS === "android") {
      connectHealthConnect();
    }
  }, [refreshHealth, connectHealthConnect]);

  // ---------------------------------------------------------------------------
  // Water Actions
  // ---------------------------------------------------------------------------

  const addWater = useCallback(
    async (amountMl: number, dateStr?: string): Promise<number> => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const targetDate = dateStr || getTodayDateString();
      const currentIntake =
        waterHistory[targetDate] ??
        (targetDate === getTodayDateString() ? waterIntake : 0);
      const nextAmount = currentIntake + Math.max(0, amountMl);

      if (targetDate === getTodayDateString()) {
        setWaterIntake(nextAmount);
      }
      setWaterHistory((prev) => ({ ...prev, [targetDate]: nextAmount }));
      await setStoredWaterForDate(nextAmount, targetDate);

      if (mode === "authenticated" && userId) {
        await upsertUserWater(userId, nextAmount, targetDate);
      }
      return nextAmount;
    },
    [waterIntake, waterHistory, mode, userId],
  );

  const removeWater = useCallback(
    async (amountMl: number, dateStr?: string): Promise<number> => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const targetDate = dateStr || getTodayDateString();
      const currentIntake =
        waterHistory[targetDate] ??
        (targetDate === getTodayDateString() ? waterIntake : 0);
      const nextAmount = Math.max(0, currentIntake - Math.max(0, amountMl));

      if (targetDate === getTodayDateString()) {
        setWaterIntake(nextAmount);
      }
      setWaterHistory((prev) => ({ ...prev, [targetDate]: nextAmount }));
      await setStoredWaterForDate(nextAmount, targetDate);

      if (mode === "authenticated" && userId) {
        await upsertUserWater(userId, nextAmount, targetDate);
      }
      return nextAmount;
    },
    [waterIntake, waterHistory, mode, userId],
  );

  const updateWaterGoal = useCallback(
    async (newGoalMl: number): Promise<void> => {
      const safe = Math.max(500, newGoalMl);
      setWaterGoal(safe);
      await setStoredWaterGoal(safe);
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Step Goal Actions
  // ---------------------------------------------------------------------------

  const updateStepGoal = useCallback(
    async (newGoal: number): Promise<void> => {
      const safe = Math.max(1000, newGoal);
      setStepGoal(safe);
      await setStoredStepGoal(safe);

      const today = getTodayDateString();
      const activityData: DailyActivity = {
        date: today,
        stepCount: todaySteps,
        stepGoal: safe,
        distanceMeters,
        caloriesBurned,
      };

      await setStoredActivityForDate(activityData);
      setActivityHistory((prev) => ({ ...prev, [today]: activityData }));

      if (mode === "authenticated" && userId) {
        await upsertUserDailyActivity(userId, activityData);
      }
    },
    [todaySteps, distanceMeters, caloriesBurned, mode, userId],
  );

  // ---------------------------------------------------------------------------
  // Weight Actions
  // ---------------------------------------------------------------------------

  const recordWeight = useCallback(
    async (weightKg: number, dateStr?: string): Promise<void> => {
      const date = dateStr || getTodayDateString();
      const safeWeight = Math.max(20, Math.min(300, weightKg));
      setWeightHistory((prev) => ({ ...prev, [date]: safeWeight }));
      await recordStoredWeight(safeWeight, date);
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      waterIntake,
      waterGoal,
      waterHistory,
      addWater,
      removeWater,
      updateWaterGoal,
      todaySteps,
      stepGoal,
      distanceMeters,
      caloriesBurned,
      activityHistory,
      healthStatus,
      isConnectingHealth,
      connectHealthConnect,
      refreshSteps,
      updateStepGoal,
      weightHistory,
      recordWeight,
      refreshHealth,
    }),
    [
      waterIntake,
      waterGoal,
      waterHistory,
      addWater,
      removeWater,
      updateWaterGoal,
      todaySteps,
      stepGoal,
      distanceMeters,
      caloriesBurned,
      activityHistory,
      healthStatus,
      isConnectingHealth,
      connectHealthConnect,
      refreshSteps,
      updateStepGoal,
      weightHistory,
      recordWeight,
      refreshHealth,
    ],
  );

  return (
    <HealthContext.Provider value={contextValue}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth(): HealthContextType {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
}
