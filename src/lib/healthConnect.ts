import { Platform } from "react-native";
import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from "react-native-health-connect";

export { openHealthConnectSettings };

/**
 * Checks whether Health Connect SDK is supported and installed on the Android device.
 * Does NOT prompt permissions or UI dialogs.
 */
export async function checkHealthConnectAvailability(): Promise<{
  isAvailable: boolean;
  needsUpdate: boolean;
}> {
  if (Platform.OS !== "android") {
    return { isAvailable: false, needsUpdate: false };
  }

  try {
    const status = await getSdkStatus();
    if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
      return { isAvailable: true, needsUpdate: false };
    }
    if (
      status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
    ) {
      return { isAvailable: false, needsUpdate: true };
    }
    return { isAvailable: false, needsUpdate: false };
  } catch (error) {
    console.warn("Error checking Health Connect SDK status:", error);
    return { isAvailable: false, needsUpdate: false };
  }
}

/**
 * Initializes Health Connect.
 */
export async function initializeHealthConnect(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  try {
    return await initialize();
  } catch (error) {
    console.warn("Failed to initialize Health Connect:", error);
    return false;
  }
}

/**
 * Silently checks if Steps read permission is already granted.
 * Does NOT display any permission dialogs.
 */
export async function hasStepPermission(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  try {
    const granted = await getGrantedPermissions();
    return granted.some(
      (perm) =>
        "accessType" in perm &&
        perm.accessType === "read" &&
        "recordType" in perm &&
        perm.recordType === "Steps",
    );
  } catch (error) {
    console.warn("Error checking granted Health Connect permissions:", error);
    return false;
  }
}

/**
 * Explicitly requests Steps read permission.
 * Displays system permission dialog. Should only be invoked on user action.
 */
export async function requestStepPermission(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  try {
    const permissions = await requestPermission([
      {
        accessType: "read",
        recordType: "Steps",
      },
    ]);

    return permissions.some(
      (permission) =>
        "accessType" in permission &&
        permission.accessType === "read" &&
        "recordType" in permission &&
        permission.recordType === "Steps",
    );
  } catch (error) {
    console.warn("Error requesting Health Connect permission:", error);
    return false;
  }
}

/**
 * Reads aggregated steps for a given start and end date.
 */
export async function getStepsBetween(
  startTime: Date,
  endTime: Date,
): Promise<number> {
  if (Platform.OS !== "android") {
    return 0;
  }

  try {
    const { records } = await readRecords("Steps", {
      timeRangeFilter: {
        operator: "between",
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    });

    return records.reduce((total, record) => total + (record.count || 0), 0);
  } catch (error) {
    console.warn("Error reading Health Connect steps:", error);
    return 0;
  }
}

/**
 * Reads today's cumulative steps from Health Connect.
 */
export async function getTodaySteps(): Promise<number> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return getStepsBetween(startOfDay, now);
}
