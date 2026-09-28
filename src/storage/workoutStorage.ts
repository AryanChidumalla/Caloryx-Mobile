import {
  Exercise,
  SessionExercise,
  WorkoutRoutine,
  WorkoutSession,
} from "@/types/workout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getJsonStorageItem,
  removeStorageItem,
  setJsonStorageItem,
} from "./asyncStorageUtils";

export const WORKOUT_STORAGE_KEYS = {
  ROUTINES_BASE: "@caloryx/workout_routines_v1",
  SESSIONS_BASE: "@caloryx/workout_sessions_v1",
  CUSTOM_EXERCISES_BASE: "@caloryx/custom_exercises_v1",
  ACTIVE_WORKOUT_BASE: "@caloryx/active_workout_v1",
  LEGACY_MIGRATED: "@caloryx/workout_storage_v2_migrated",
  LEGACY_BACKUP_SESSIONS: "@caloryx/workout_sessions_v1_legacy_backup",
  // Deprecated unpartitioned keys retained for backwards-compatibility:
  ROUTINES: "@caloryx/workout_routines_v1",
  SESSIONS: "@caloryx/workout_sessions_v1",
  CUSTOM_EXERCISES: "@caloryx/custom_exercises_v1",
  ACTIVE_WORKOUT: "@caloryx/active_workout_v1",
};

export function getWorkoutSessionsKey(userId?: string | null): string {
  const scope =
    userId && typeof userId === "string" && userId.trim().length > 0
      ? userId.trim()
      : "guest";
  return `${WORKOUT_STORAGE_KEYS.SESSIONS_BASE}:${scope}`;
}

export function getWorkoutRoutinesKey(userId?: string | null): string {
  const scope =
    userId && typeof userId === "string" && userId.trim().length > 0
      ? userId.trim()
      : "guest";
  return `${WORKOUT_STORAGE_KEYS.ROUTINES_BASE}:${scope}`;
}

export function getActiveWorkoutKey(userId?: string | null): string {
  const scope =
    userId && typeof userId === "string" && userId.trim().length > 0
      ? userId.trim()
      : "guest";
  return `${WORKOUT_STORAGE_KEYS.ACTIVE_WORKOUT_BASE}:${scope}`;
}

export function getCustomExercisesKey(userId?: string | null): string {
  const scope =
    userId && typeof userId === "string" && userId.trim().length > 0
      ? userId.trim()
      : "guest";
  return `${WORKOUT_STORAGE_KEYS.CUSTOM_EXERCISES_BASE}:${scope}`;
}

export const DEFAULT_ROUTINES: WorkoutRoutine[] = [];

// -----------------------------------------------------------------------------
// Legacy Storage Migration (One-time, non-destructive migration)
// -----------------------------------------------------------------------------

export async function migrateLegacyWorkoutStorage(): Promise<void> {
  try {
    const isMigrated = await AsyncStorage.getItem(
      WORKOUT_STORAGE_KEYS.LEGACY_MIGRATED,
    );
    if (isMigrated === "true") {
      return;
    }

    const legacySessionsRaw = await AsyncStorage.getItem(
      WORKOUT_STORAGE_KEYS.SESSIONS_BASE,
    );

    if (legacySessionsRaw) {
      // 1. Preserve an emergency backup of the legacy data
      await AsyncStorage.setItem(
        WORKOUT_STORAGE_KEYS.LEGACY_BACKUP_SESSIONS,
        legacySessionsRaw,
      );

      let parsed: any[] = [];
      try {
        parsed = JSON.parse(legacySessionsRaw);
      } catch {
        parsed = [];
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        // Group sessions by ownership:
        // - Workouts with a valid string userId belong to that user's partition.
        // - Workouts without a userId (including older local workouts)
        //   are preserved conservatively in the guest partition.
        const guestSessions: WorkoutSession[] = [];
        const userBuckets: Record<string, WorkoutSession[]> = {};

        for (const item of parsed) {
          const s: WorkoutSession = {
            ...item,
            totalVolumeKg: Number(item.totalVolumeKg || 0),
            durationSeconds: Number(item.durationSeconds || 0),
            exercises: Array.isArray(item.exercises)
              ? item.exercises.map((e: SessionExercise) => ({
                  ...e,
                  sets: Array.isArray(e.sets) ? e.sets : [],
                }))
              : [],
          };

          if (s.userId && typeof s.userId === "string" && s.userId.trim().length > 0) {
            const uid = s.userId.trim();
            if (!userBuckets[uid]) userBuckets[uid] = [];
            userBuckets[uid].push(s);
          } else {
            guestSessions.push(s);
          }
        }

        // Save guest partition
        if (guestSessions.length > 0) {
          const guestKey = getWorkoutSessionsKey(null);
          const existingGuest = await getJsonStorageItem<WorkoutSession[]>(
            guestKey,
            [],
          );
          const mergedGuest = [...existingGuest];
          for (const gs of guestSessions) {
            if (!mergedGuest.some((mg) => mg.id === gs.id)) {
              mergedGuest.push(gs);
            }
          }
          await setJsonStorageItem(guestKey, mergedGuest);
        }

        // Save user partitions
        for (const [uid, uSessions] of Object.entries(userBuckets)) {
          const userKey = getWorkoutSessionsKey(uid);
          const existingUser = await getJsonStorageItem<WorkoutSession[]>(
            userKey,
            [],
          );
          const mergedUser = [...existingUser];
          for (const us of uSessions) {
            if (!mergedUser.some((mu) => mu.id === us.id)) {
              mergedUser.push(us);
            }
          }
          await setJsonStorageItem(userKey, mergedUser);
        }
      }
      // Clean up legacy unpartitioned sessions key now that it is safely backed up and migrated
      await removeStorageItem(WORKOUT_STORAGE_KEYS.SESSIONS_BASE);
    }

    // Migrate legacy routines if unpartitioned
    const legacyRoutinesRaw = await AsyncStorage.getItem(
      WORKOUT_STORAGE_KEYS.ROUTINES_BASE,
    );
    if (legacyRoutinesRaw) {
      try {
        const guestRoutinesKey = getWorkoutRoutinesKey(null);
        const existingRoutines = await AsyncStorage.getItem(guestRoutinesKey);
        if (!existingRoutines) {
          await AsyncStorage.setItem(guestRoutinesKey, legacyRoutinesRaw);
        }
        await removeStorageItem(WORKOUT_STORAGE_KEYS.ROUTINES_BASE);
      } catch {}
    }

    // Migrate legacy custom exercises if unpartitioned
    const legacyCustomRaw = await AsyncStorage.getItem(
      WORKOUT_STORAGE_KEYS.CUSTOM_EXERCISES_BASE,
    );
    if (legacyCustomRaw) {
      try {
        const guestCustomKey = getCustomExercisesKey(null);
        const existingCustom = await AsyncStorage.getItem(guestCustomKey);
        if (!existingCustom) {
          await AsyncStorage.setItem(guestCustomKey, legacyCustomRaw);
        }
        await removeStorageItem(WORKOUT_STORAGE_KEYS.CUSTOM_EXERCISES_BASE);
      } catch {}
    }

    await AsyncStorage.setItem(WORKOUT_STORAGE_KEYS.LEGACY_MIGRATED, "true");
  } catch (err) {
    console.warn("migrateLegacyWorkoutStorage error:", err);
  }
}

// -----------------------------------------------------------------------------
// Routine Storage Methods (User Isolated)
// -----------------------------------------------------------------------------

export async function getStoredRoutines(
  userId?: string | null,
): Promise<WorkoutRoutine[]> {
  const key = getWorkoutRoutinesKey(userId);
  const routines = await getJsonStorageItem<WorkoutRoutine[] | null>(key, null);
  if (!routines) {
    await setJsonStorageItem(key, DEFAULT_ROUTINES);
    return DEFAULT_ROUTINES;
  }
  return Array.isArray(routines) ? routines : DEFAULT_ROUTINES;
}

export async function saveStoredRoutines(
  routines: WorkoutRoutine[],
  userId?: string | null,
): Promise<void> {
  const key = getWorkoutRoutinesKey(userId);
  await setJsonStorageItem(key, routines);
}

export async function addStoredRoutine(
  routine: Omit<WorkoutRoutine, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    userId?: string;
  },
  userId?: string | null,
): Promise<WorkoutRoutine> {
  const routines = await getStoredRoutines(userId);
  const now = new Date().toISOString();
  const newRoutine: WorkoutRoutine = {
    ...routine,
    id:
      routine.id ||
      `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || routine.userId || undefined,
    createdAt: routine.createdAt || now,
    updatedAt: routine.updatedAt || now,
    isCustom: true,
  };
  const updated = [newRoutine, ...routines];
  await saveStoredRoutines(updated, userId);
  return newRoutine;
}

export async function updateStoredRoutine(
  routine: WorkoutRoutine,
  userId?: string | null,
): Promise<WorkoutRoutine> {
  const routines = await getStoredRoutines(userId);
  const updatedList = routines.map((r) =>
    r.id === routine.id
      ? { ...routine, updatedAt: new Date().toISOString() }
      : r,
  );
  await saveStoredRoutines(updatedList, userId);
  return routine;
}

export async function deleteStoredRoutine(
  id: string,
  userId?: string | null,
): Promise<void> {
  const routines = await getStoredRoutines(userId);
  const filtered = routines.filter((r) => r.id !== id);
  await saveStoredRoutines(filtered, userId);
}

// -----------------------------------------------------------------------------
// Workout Session History Storage Methods (User Isolated)
// -----------------------------------------------------------------------------

export async function getStoredSessions(
  userId?: string | null,
): Promise<WorkoutSession[]> {
  const key = getWorkoutSessionsKey(userId);
  const parsed = await getJsonStorageItem<unknown[]>(key, []);
  if (!Array.isArray(parsed)) return [];

  return parsed.map((s: any) => ({
    ...s,
    totalVolumeKg: Number(s.totalVolumeKg || 0),
    durationSeconds: Number(s.durationSeconds || 0),
    exercises: Array.isArray(s.exercises)
      ? s.exercises.map((e: any) => ({
          ...e,
          sets: Array.isArray(e.sets) ? e.sets : [],
        }))
      : [],
  }));
}

export async function saveStoredSessions(
  sessions: WorkoutSession[],
  userId?: string | null,
): Promise<void> {
  const key = getWorkoutSessionsKey(userId);
  await setJsonStorageItem(key, sessions);
}

export async function addStoredSession(
  session: WorkoutSession,
  userId?: string | null,
): Promise<WorkoutSession> {
  const targetUserId = userId !== undefined ? userId : session.userId ?? null;
  const sessions = await getStoredSessions(targetUserId);
  const updated = [session, ...sessions];
  await saveStoredSessions(updated, targetUserId);
  return session;
}

export async function updateStoredSession(
  session: WorkoutSession,
  userId?: string | null,
): Promise<WorkoutSession> {
  const targetUserId = userId !== undefined ? userId : session.userId ?? null;
  const sessions = await getStoredSessions(targetUserId);
  const updated = sessions.map((s) => (s.id === session.id ? session : s));
  await saveStoredSessions(updated, targetUserId);
  return session;
}

export async function deleteStoredSession(
  id: string,
  userId?: string | null,
): Promise<void> {
  const sessions = await getStoredSessions(userId);
  const filtered = sessions.filter((s) => s.id !== id);
  await saveStoredSessions(filtered, userId);
}

// -----------------------------------------------------------------------------
// Custom Exercises Storage Methods (User Isolated)
// -----------------------------------------------------------------------------

export async function getStoredCustomExercises(
  userId?: string | null,
): Promise<Exercise[]> {
  const key = getCustomExercisesKey(userId);
  const parsed = await getJsonStorageItem<Exercise[]>(key, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function addStoredCustomExercise(
  exercise: Omit<Exercise, "id">,
  userId?: string | null,
): Promise<Exercise> {
  const current = await getStoredCustomExercises(userId);
  const newEx: Exercise = {
    ...exercise,
    id: `custom-ex-${Date.now()}`,
    isCustom: true,
  };
  const key = getCustomExercisesKey(userId);
  await setJsonStorageItem(key, [newEx, ...current]);
  return newEx;
}

// -----------------------------------------------------------------------------
// Active Workout Session Cache (Recovery - User Isolated)
// -----------------------------------------------------------------------------

export async function getActiveWorkoutCache(
  userId?: string | null,
): Promise<WorkoutSession | null> {
  const key = getActiveWorkoutKey(userId);
  return getJsonStorageItem<WorkoutSession | null>(key, null);
}

export async function setActiveWorkoutCache(
  session: WorkoutSession | null,
  userId?: string | null,
): Promise<void> {
  const key = getActiveWorkoutKey(userId);
  if (!session) {
    await removeStorageItem(key);
  } else {
    await setJsonStorageItem(key, session);
  }
}
