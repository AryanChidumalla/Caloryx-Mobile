import { useAuth } from "@/context/AuthContext";
import {
  fetchAllUserDailyActivities,
  fetchAllUserWaterLogs,
  fetchUserDailyActivity,
  fetchUserWaterForDate,
  upsertUserDailyActivity,
  upsertUserWater,
} from "@/services/healthSync";
import {
  detectStepProvider,
  readStepsFromProvider,
  requestStepPermissions,
} from "@/services/stepTrackingService";
import {
  DEFAULT_SLEEP_GOAL_MINUTES,
  DEFAULT_STEP_GOAL,
  DEFAULT_WATER_GOAL_ML,
  getAllStoredActivityLogs,
  getAllStoredSleepLogs,
  getAllStoredWaterLogs,
  getStoredActivityForDate,
  getStoredSleepGoal,
  getStoredStepGoal,
  getStoredWaterForDate,
  getStoredWaterGoal,
  getStoredWeightLogs,
  recordStoredWeight,
  setStoredActivityForDate,
  setStoredSleepForDate,
  setStoredSleepGoal,
  setStoredStepGoal,
  setStoredWaterForDate,
  setStoredWaterGoal,
} from "@/storage/healthStorage";
import { DailyActivity, HealthConnectStatus, SleepLog, SleepQuality } from "@/types/health";
import { getTodayDateString } from "@/utils/date";
import {
  estimateCaloriesBurned,
  estimateDistanceMeters,
  getSleepQualityLabel,
} from "@/utils/healthCalculations";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

type HealthContextType = {
  // Water
  waterIntake: number;
  waterGoal: number;
  waterHistory: Record<string, number>;
  addWater: (amountMl: number, dateStr?: string) => Promise<number>;
  removeWater: (amountMl: number, dateStr?: string) => Promise<number>;
  setWater: (amountMl: number, dateStr?: string) => Promise<number>;
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

  // Sleep
  todaySleepMinutes: number;
  sleepGoalMinutes: number;
  sleepQuality?: SleepQuality;
  sleepHistory: Record<string, SleepLog>;
  recordSleep: (
    durationMinutes: number,
    quality?: SleepQuality,
    dateStr?: string,
    notes?: string,
  ) => Promise<void>;
  updateSleepGoal: (newGoalMinutes: number) => Promise<void>;

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

  // Sleep State
  const [sleepGoalMinutes, setSleepGoalMinutes] = useState<number>(DEFAULT_SLEEP_GOAL_MINUTES);
  const [sleepHistory, setSleepHistory] = useState<Record<string, SleepLog>>({});

  // Hardware / Step Provider Status
  const [healthStatus, setHealthStatus] = useState<HealthConnectStatus>({
    source: Platform.OS === "android" ? "health_connect" : "pedometer",
    isAvailable: true,
    isConnected: false,
    hasPermission: false,
    lastCheckedAt: new Date().toISOString(),
  });
  const [isConnectingHealth, setIsConnectingHealth] = useState(false);

  // Track active date to detect midnight transitions
  const activeDateRef = useRef(getTodayDateString());

  // ---------------------------------------------------------------------------
  // Load initial health state (scoped to user)
  // ---------------------------------------------------------------------------
  const refreshHealth = useCallback(async () => {
    const today = getTodayDateString();
    activeDateRef.current = today;

    // 1. Load water data
    try {
      const [storedGoal, storedWater, allWater] = await Promise.all([
        getStoredWaterGoal(userId),
        getStoredWaterForDate(today, userId),
        getAllStoredWaterLogs(userId),
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
          await setStoredWaterForDate(cloudWater, today, userId);
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
        getStoredStepGoal(userId),
        getStoredActivityForDate(today, userId),
        getAllStoredActivityLogs(userId),
      ]);
      setStepGoal(storedStepGoal);
      setActivityHistory(allActivity);

      if (storedActivity) {
        setTodaySteps(storedActivity.stepCount);
        setDistanceMeters(
          storedActivity.distanceMeters ??
            estimateDistanceMeters(storedActivity.stepCount),
        );
        setCaloriesBurned(
          storedActivity.caloriesBurned ??
            estimateCaloriesBurned(storedActivity.stepCount),
        );
      }

      if (mode === "authenticated" && userId) {
        const [cloudActivity, cloudAllActivity] = await Promise.all([
          fetchUserDailyActivity(userId, today),
          fetchAllUserDailyActivities(userId),
        ]);
        if (cloudActivity) {
          setTodaySteps(cloudActivity.stepCount);
          setStepGoal(cloudActivity.stepGoal);
          setDistanceMeters(
            cloudActivity.distanceMeters ??
              estimateDistanceMeters(cloudActivity.stepCount),
          );
          setCaloriesBurned(
            cloudActivity.caloriesBurned ??
              estimateCaloriesBurned(cloudActivity.stepCount),
          );
          await setStoredActivityForDate(cloudActivity, userId);
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
      const storedWeights = await getStoredWeightLogs(userId);
      setWeightHistory(storedWeights);
    } catch (err) {
      console.warn("Failed to load weight history:", err);
    }

    // 4. Load sleep history & goal
    try {
      const [storedSleepGoal, allSleep] = await Promise.all([
        getStoredSleepGoal(userId),
        getAllStoredSleepLogs(userId),
      ]);
      setSleepGoalMinutes(storedSleepGoal);
      setSleepHistory(allSleep);
    } catch (err) {
      console.warn("Failed to load sleep history:", err);
    }
  }, [mode, userId]);

  // ---------------------------------------------------------------------------
  // Step Reading & Syncing from Hardware Provider
  // ---------------------------------------------------------------------------
  const syncStepsFromHardware = useCallback(
    async (source: HealthConnectStatus["source"]): Promise<boolean> => {
      const today = getTodayDateString();
      try {
        const steps = await readStepsFromProvider(source, today);
        const safeSteps = Math.max(0, steps);
        const estDistance = estimateDistanceMeters(safeSteps);
        const estCalories = estimateCaloriesBurned(safeSteps);

        setTodaySteps(safeSteps);
        setDistanceMeters(estDistance);
        setCaloriesBurned(estCalories);

        const activityData: DailyActivity = {
          date: today,
          stepCount: safeSteps,
          stepGoal,
          distanceMeters: estDistance,
          caloriesBurned: estCalories,
        };

        await setStoredActivityForDate(activityData, userId);
        setActivityHistory((prev) => ({ ...prev, [today]: activityData }));

        if (mode === "authenticated" && userId) {
          await upsertUserDailyActivity(userId, activityData);
        }

        return true;
      } catch (err) {
        console.warn("Error reading hardware steps:", err);
        return false;
      }
    },
    [stepGoal, mode, userId],
  );

  // ---------------------------------------------------------------------------
  // Explicit Permission Request on User Action (Tap "Connect" / "Sync")
  // ---------------------------------------------------------------------------
  const connectHealthConnect = useCallback(async (): Promise<boolean> => {
    setIsConnectingHealth(true);
    try {
      const providerState = await detectStepProvider();
      if (!providerState.isAvailable) {
        setHealthStatus({
          source: providerState.source,
          isAvailable: false,
          isConnected: false,
          hasPermission: false,
          error: "Hardware step sensors not available on this device",
          lastCheckedAt: new Date().toISOString(),
        });
        return false;
      }

      const granted = await requestStepPermissions(providerState.source);
      if (!granted) {
        setHealthStatus({
          source: providerState.source,
          isAvailable: true,
          isConnected: false,
          hasPermission: false,
          isDenied: true,
          error: "Permission was denied",
          lastCheckedAt: new Date().toISOString(),
        });
        return false;
      }

      await syncStepsFromHardware(providerState.source);

      setHealthStatus({
        source: providerState.source,
        isAvailable: true,
        isConnected: true,
        hasPermission: true,
        isDenied: false,
        error: null,
        lastCheckedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.warn("Step tracking connection error:", err);
      setHealthStatus((prev) => ({
        ...prev,
        isConnected: false,
        error: "Failed to connect step tracking",
        lastCheckedAt: new Date().toISOString(),
      }));
      return false;
    } finally {
      setIsConnectingHealth(false);
    }
  }, [syncStepsFromHardware]);

  // ---------------------------------------------------------------------------
  // Refresh Steps (Silent if already permitted; loads cached if not)
  // ---------------------------------------------------------------------------
  const refreshSteps = useCallback(async () => {
    if (healthStatus.hasPermission && healthStatus.isAvailable) {
      await syncStepsFromHardware(healthStatus.source);
    } else {
      await refreshHealth();
    }
  }, [healthStatus, syncStepsFromHardware, refreshHealth]);

  // ---------------------------------------------------------------------------
  // Silent Initialization on Mount (NO permission dialogs)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;

    async function initProvider() {
      await refreshHealth();

      const providerState = await detectStepProvider();
      if (isCancelled) return;

      if (providerState.hasPermission) {
        // Silently sync steps if permission was already granted previously
        await syncStepsFromHardware(providerState.source);
        if (isCancelled) return;

        setHealthStatus({
          source: providerState.source,
          isAvailable: providerState.isAvailable,
          isConnected: true,
          hasPermission: true,
          isDenied: false,
          lastCheckedAt: new Date().toISOString(),
        });
      } else {
        // Passive status update without requesting permissions
        setHealthStatus({
          source: providerState.source,
          isAvailable: providerState.isAvailable,
          isConnected: false,
          hasPermission: false,
          isDenied: providerState.isDenied,
          lastCheckedAt: new Date().toISOString(),
        });
      }
    }

    initProvider();

    return () => {
      isCancelled = true;
    };
  }, [refreshHealth, syncStepsFromHardware]);

  // ---------------------------------------------------------------------------
  // AppState Listener (Foreground Refresh & Midnight Rollover)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        const currentDate = getTodayDateString();
        if (activeDateRef.current !== currentDate) {
          // Midnight rollover occurred
          activeDateRef.current = currentDate;
          refreshHealth();
        } else {
          refreshSteps();
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [refreshHealth, refreshSteps]);

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
      await setStoredWaterForDate(nextAmount, targetDate, userId);

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
      await setStoredWaterForDate(nextAmount, targetDate, userId);

      if (mode === "authenticated" && userId) {
        await upsertUserWater(userId, nextAmount, targetDate);
      }
      return nextAmount;
    },
    [waterIntake, waterHistory, mode, userId],
  );

  const setWater = useCallback(
    async (amountMl: number, dateStr?: string): Promise<number> => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const targetDate = dateStr || getTodayDateString();
      const nextAmount = Math.max(0, amountMl);

      if (targetDate === getTodayDateString()) {
        setWaterIntake(nextAmount);
      }
      setWaterHistory((prev) => ({ ...prev, [targetDate]: nextAmount }));
      await setStoredWaterForDate(nextAmount, targetDate, userId);

      if (mode === "authenticated" && userId) {
        await upsertUserWater(userId, nextAmount, targetDate);
      }
      return nextAmount;
    },
    [mode, userId],
  );

  const updateWaterGoal = useCallback(
    async (newGoalMl: number): Promise<void> => {
      const safe = Math.max(500, newGoalMl);
      setWaterGoal(safe);
      await setStoredWaterGoal(safe, userId);
    },
    [userId],
  );

  // ---------------------------------------------------------------------------
  // Step Goal Actions
  // ---------------------------------------------------------------------------
  const updateStepGoal = useCallback(
    async (newGoal: number): Promise<void> => {
      const safe = Math.max(1000, newGoal);
      setStepGoal(safe);
      await setStoredStepGoal(safe, userId);

      const today = getTodayDateString();
      const activityData: DailyActivity = {
        date: today,
        stepCount: todaySteps,
        stepGoal: safe,
        distanceMeters,
        caloriesBurned,
      };

      await setStoredActivityForDate(activityData, userId);
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
      await recordStoredWeight(safeWeight, date, userId);
    },
    [userId],
  );

  // ---------------------------------------------------------------------------
  // Sleep Actions
  // ---------------------------------------------------------------------------
  const recordSleep = useCallback(
    async (
      durationMinutes: number,
      quality?: SleepQuality,
      dateStr?: string,
      notes?: string,
    ): Promise<void> => {
      const date = dateStr || getTodayDateString();
      const safeDuration = Math.max(0, Math.round(durationMinutes));
      const assessedQuality =
        quality ||
        getSleepQualityLabel(safeDuration, sleepGoalMinutes).quality;

      const log: SleepLog = {
        date,
        userId: userId || undefined,
        durationMinutes: safeDuration,
        goalMinutes: sleepGoalMinutes,
        quality: assessedQuality,
        notes: notes?.trim() || undefined,
        source: "manual",
        updatedAt: new Date().toISOString(),
      };

      setSleepHistory((prev) => ({ ...prev, [date]: log }));
      await setStoredSleepForDate(log, userId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [userId, sleepGoalMinutes],
  );

  const updateSleepGoal = useCallback(
    async (newGoalMinutes: number): Promise<void> => {
      const safeGoal = Math.max(180, Math.min(840, newGoalMinutes));
      setSleepGoalMinutes(safeGoal);
      await setStoredSleepGoal(safeGoal, userId);
      Haptics.selectionAsync();
    },
    [userId],
  );

  const todayStr = getTodayDateString();
  const todaySleepLog = sleepHistory[todayStr];
  const todaySleepMinutes = todaySleepLog?.durationMinutes ?? 0;
  const todaySleepQuality = todaySleepLog?.quality;

  const contextValue = useMemo(
    () => ({
      waterIntake,
      waterGoal,
      waterHistory,
      addWater,
      removeWater,
      setWater,
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
      todaySleepMinutes,
      sleepGoalMinutes,
      sleepQuality: todaySleepQuality,
      sleepHistory,
      recordSleep,
      updateSleepGoal,
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
      setWater,
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
      todaySleepMinutes,
      sleepGoalMinutes,
      todaySleepQuality,
      sleepHistory,
      recordSleep,
      updateSleepGoal,
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
