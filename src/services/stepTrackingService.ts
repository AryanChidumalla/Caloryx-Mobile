import {
  checkHealthConnectAvailability,
  getStepsBetween,
  hasStepPermission,
  initializeHealthConnect,
  requestStepPermission,
} from "@/lib/healthConnect";
import { StepTrackingSource } from "@/types/health";
import { isToday } from "@/utils/date";
import { Pedometer } from "expo-sensors";
import { Platform } from "react-native";

export type StepProviderState = {
  source: StepTrackingSource;
  isAvailable: boolean;
  hasPermission: boolean;
  isDenied?: boolean;
  error?: string | null;
};

/**
 * Detects the best available step tracking source without displaying any permission prompts.
 * Android: Health Connect is preferred; Pedometer is fallback.
 * iOS: Pedometer is the primary native step source.
 */
export async function detectStepProvider(): Promise<StepProviderState> {
  // 1. Android: Check Health Connect availability first
  if (Platform.OS === "android") {
    try {
      const hcStatus = await checkHealthConnectAvailability();
      if (hcStatus.isAvailable) {
        const initialized = await initializeHealthConnect();
        if (initialized) {
          const hasPerm = await hasStepPermission();
          return {
            source: "health_connect",
            isAvailable: true,
            hasPermission: hasPerm,
          };
        }
      }
    } catch (err) {
      console.warn("Health Connect detection warning:", err);
    }
  }

  // 2. iOS or Android Fallback: Check Pedometer availability
  try {
    const isPedometerAvailable = await Pedometer.isAvailableAsync();
    if (isPedometerAvailable) {
      const permResponse = await Pedometer.getPermissionsAsync();
      const hasPerm = permResponse.granted;
      const isDenied = !permResponse.canAskAgain && !permResponse.granted;

      return {
        source: "pedometer",
        isAvailable: true,
        hasPermission: hasPerm,
        isDenied,
      };
    }
  } catch (err) {
    console.warn("Pedometer detection warning:", err);
  }

  // 3. Neither hardware/sensor provider available
  return {
    source: "none",
    isAvailable: false,
    hasPermission: false,
  };
}

/**
 * Silently checks if permissions are granted for the given provider.
 * Does not show system dialogs.
 */
export async function checkStepPermissions(
  source: StepTrackingSource,
): Promise<boolean> {
  if (source === "health_connect" && Platform.OS === "android") {
    return await hasStepPermission();
  }

  if (source === "pedometer") {
    const perm = await Pedometer.getPermissionsAsync();
    return perm.granted;
  }

  return false;
}

/**
 * Explicitly requests permissions for the given provider.
 * Displays system permission dialog. Should only be called on user action.
 */
export async function requestStepPermissions(
  source: StepTrackingSource,
): Promise<boolean> {
  if (source === "health_connect" && Platform.OS === "android") {
    await initializeHealthConnect();
    return await requestStepPermission();
  }

  if (source === "pedometer") {
    const perm = await Pedometer.requestPermissionsAsync();
    return perm.granted;
  }

  return false;
}

/**
 * Fetches step count for a given date from the active hardware provider.
 */
export async function readStepsFromProvider(
  source: StepTrackingSource,
  dateStr: string,
): Promise<number> {
  const isCurrentDate = isToday(dateStr);
  const [year, month, day] = dateStr.split("-").map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = isCurrentDate
    ? new Date()
    : new Date(year, month - 1, day, 23, 59, 59, 999);

  if (source === "health_connect" && Platform.OS === "android") {
    try {
      return await getStepsBetween(startOfDay, endOfDay);
    } catch (err) {
      console.warn("Error reading Health Connect steps:", err);
      return 0;
    }
  }

  if (source === "pedometer") {
    try {
      if (Platform.OS === "ios") {
        const result = await Pedometer.getStepCountAsync(startOfDay, endOfDay);
        return Math.max(0, result.steps || 0);
      }
      // On Android without Health Connect, Pedometer.getStepCountAsync is not supported by hardware;
      // return 0 and rely on watchStepCount if active.
      return 0;
    } catch (err) {
      console.warn("Error reading Pedometer steps:", err);
      return 0;
    }
  }

  return 0;
}
