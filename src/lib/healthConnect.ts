import {
  initialize,
  readRecords,
  requestPermission,
} from "react-native-health-connect";

export async function initializeHealthConnect(): Promise<boolean> {
  const initialized = await initialize();
  return initialized;
}

export async function requestStepPermission(): Promise<boolean> {
  const permissions = await requestPermission([
    {
      accessType: "read",
      recordType: "Steps",
    },
  ]);

  return permissions.some(
    (permission) =>
      permission.accessType === "read" && permission.recordType === "Steps",
  );
}

export async function getTodaySteps(): Promise<number> {
  const now = new Date();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const { records } = await readRecords("Steps", {
    timeRangeFilter: {
      operator: "between",
      startTime: startOfDay.toISOString(),
      endTime: now.toISOString(),
    },
  });

  return records.reduce((total, record) => total + record.count, 0);
}
