import {
  deleteUserRoutine,
  deleteUserWorkoutSession,
  fetchUserRoutines,
  fetchUserWorkoutSessions,
  isUUID,
  saveUserWorkoutSession,
  syncUserRoutine,
  updateCloudWorkoutSession,
} from "@/services/workoutSync";
import {
  DEFAULT_ROUTINES,
  addStoredCustomExercise,
  addStoredRoutine,
  addStoredSession,
  deleteStoredRoutine,
  deleteStoredSession,
  getActiveWorkoutCache,
  getStoredCustomExercises,
  getStoredRoutines,
  getStoredSessions,
  migrateLegacyWorkoutStorage,
  saveStoredSessions,
  setActiveWorkoutCache,
  updateStoredRoutine,
  updateStoredSession,
} from "@/storage/workoutStorage";
import { Exercise, WorkoutRoutine, WorkoutSession } from "@/types/workout";

export type WorkoutAuthContext = {
  userId: string | null;
  isAuthenticated: boolean;
};

export type InitialWorkoutData = {
  routines: WorkoutRoutine[];
  sessions: WorkoutSession[];
  customExercises: Exercise[];
  cachedActive: WorkoutSession | null;
};

/**
 * Checks if two workout session timestamps refer to the same logged workout
 * (allowing a small clock variance of up to 5 seconds).
 */
function isMatchingSession(a: WorkoutSession, b: WorkoutSession): boolean {
  // If both sessions have a userId and they don't match, they NEVER match
  if (a.userId && b.userId && a.userId !== b.userId) {
    return false;
  }
  if (a.id === b.id) return true;
  if (!a.startedAt || !b.startedAt) return false;
  if (a.startedAt === b.startedAt) return true;
  const timeA = new Date(a.startedAt).getTime();
  const timeB = new Date(b.startedAt).getTime();
  return !isNaN(timeA) && !isNaN(timeB) && Math.abs(timeA - timeB) < 5000;
}

/**
 * Loads all workout data: custom exercises, active workout cache,
 * and user routines/sessions according to authentication status.
 */
export async function loadWorkoutData(
  auth: WorkoutAuthContext,
): Promise<InitialWorkoutData> {
  // Run one-time non-destructive migration of legacy unpartitioned storage
  await migrateLegacyWorkoutStorage();

  const currentUserId =
    auth.isAuthenticated && auth.userId ? auth.userId : null;

  const [customExercises, cachedActive] = await Promise.all([
    getStoredCustomExercises(currentUserId),
    getActiveWorkoutCache(currentUserId),
  ]);

  if (auth.isAuthenticated && auth.userId) {
    const userId = auth.userId;
    const [cloudRoutines, cloudSessions, localSessions, localRoutines] =
      await Promise.all([
        fetchUserRoutines(userId),
        fetchUserWorkoutSessions(userId),
        getStoredSessions(userId),
        getStoredRoutines(userId),
      ]);

    // Reconcile user routines: cloud routines + local partitioned routines
    const customLocalRoutines = localRoutines.filter(
      (lr) =>
        (!lr.userId || lr.userId === userId) &&
        !cloudRoutines.some((cr) => cr.id === lr.id || cr.name === lr.name),
    );
    const allUserRoutines = [...cloudRoutines, ...customLocalRoutines];

    // Merge routines with default templates (if not already present)
    const combinedRoutines = [
      ...allUserRoutines,
      ...DEFAULT_ROUTINES.filter(
        (def) => !allUserRoutines.some((ur) => ur.name === def.name),
      ),
    ];

    // Filter local sessions: only allow sessions that belong to this user (or unowned in this user's store)
    const validLocalSessions = localSessions.filter(
      (ls) => !ls.userId || ls.userId === userId,
    );

    // Self-healing / reconciliation:
    // If any cloud session has 0 exercises (e.g. from an earlier sync issue),
    // hydrate its exercises from local storage if available.
    const enrichedSessions = cloudSessions.map((cs) => {
      if (cs.exercises.length === 0) {
        const matchingLocal = validLocalSessions.find((ls) =>
          isMatchingSession(cs, ls),
        );
        if (matchingLocal && matchingLocal.exercises.length > 0) {
          return {
            ...cs,
            exercises: matchingLocal.exercises,
          };
        }
      }
      return cs;
    });

    // Also include any local sessions belonging to this user not yet in cloud
    const unsyncedLocal = validLocalSessions
      .filter((ls) => !cloudSessions.some((cs) => isMatchingSession(cs, ls)))
      .map((ls) => ({ ...ls, userId }));

    const mergedSessions = [...enrichedSessions, ...unsyncedLocal];

    // Update the user's local mirror cache with the reconciled sessions
    await saveStoredSessions(mergedSessions, userId);

    return {
      routines: combinedRoutines,
      sessions: mergedSessions,
      customExercises,
      cachedActive,
    };
  }

  // Offline / Guest mode: retrieve from guest partition (null userId)
  const [localRoutines, localSessions] = await Promise.all([
    getStoredRoutines(null),
    getStoredSessions(null),
  ]);

  // Guest sessions must not include any session tagged with an authenticated user's ID
  const guestOnlySessions = localSessions.filter(
    (s) => !s.userId || s.userId === "guest",
  );

  return {
    routines: localRoutines,
    sessions: guestOnlySessions,
    customExercises,
    cachedActive,
  };
}

/**
 * Saves a completed workout session to Supabase if authenticated,
 * with guaranteed local persistence mirroring and fallback.
 * Also clears the active workout cache.
 */
export async function saveCompletedWorkoutSession(
  session: WorkoutSession,
  auth: WorkoutAuthContext,
): Promise<WorkoutSession> {
  const currentUserId =
    auth.isAuthenticated && auth.userId ? auth.userId : null;

  const sessionWithUser: WorkoutSession = {
    ...session,
    userId: currentUserId || session.userId,
  };

  try {
    if (auth.isAuthenticated && auth.userId) {
      // 1. Save to Supabase (Supabase generates UUID if session.id is not a UUID)
      const saved = await saveUserWorkoutSession(auth.userId, sessionWithUser);
      // 2. Persist the saved session (with its assigned UUID and userId) to user's local storage
      await addStoredSession(saved, auth.userId);
      // 3. Clean up any temporary session stored under the pre-save local ID
      if (session.id !== saved.id) {
        await deleteStoredSession(session.id, auth.userId);
      }
      return saved;
    }

    // Guest mode: save strictly into guest partition
    return await addStoredSession(sessionWithUser, null);
  } catch (err) {
    console.warn(
      "Failed to persist finished workout to cloud, falling back to local storage:",
      err,
    );
    return await addStoredSession(sessionWithUser, currentUserId);
  } finally {
    await setActiveWorkoutCache(null, currentUserId);
  }
}

/**
 * Updates an existing completed workout session in cloud and local storage.
 */
export async function updateWorkoutSession(
  session: WorkoutSession,
  auth: WorkoutAuthContext,
): Promise<void> {
  const currentUserId =
    auth.isAuthenticated && auth.userId ? auth.userId : null;

  // Strict ownership check:
  // If session belongs to user A, user B cannot update it.
  if (session.userId && currentUserId && session.userId !== currentUserId) {
    console.warn(
      "Unauthorized attempt to update another user's workout session!",
    );
    return;
  }

  const updatedWithUser: WorkoutSession = {
    ...session,
    userId: currentUserId || session.userId,
  };

  if (isUUID(session.id) && auth.isAuthenticated && auth.userId) {
    await updateCloudWorkoutSession(auth.userId, updatedWithUser);
  }

  await updateStoredSession(updatedWithUser, currentUserId);
}

/**
 * Deletes a completed workout session from cloud and local storage.
 */
export async function deleteWorkoutSession(
  sessionId: string,
  auth: WorkoutAuthContext,
): Promise<void> {
  const currentUserId =
    auth.isAuthenticated && auth.userId ? auth.userId : null;

  // 1. If it's a cloud UUID and user is authenticated, delete from Supabase
  if (isUUID(sessionId) && auth.isAuthenticated && auth.userId) {
    await deleteUserWorkoutSession(auth.userId, sessionId);
  }

  // 2. Always delete from user's local storage partition as well
  await deleteStoredSession(sessionId, currentUserId);
}

/**
 * Creates a new routine in cloud or local storage.
 */
export async function createWorkoutRoutine(
  routineData: Omit<WorkoutRoutine, "id" | "createdAt" | "updatedAt">,
  auth: WorkoutAuthContext,
): Promise<WorkoutRoutine> {
  const currentUserId =
    auth.isAuthenticated && auth.userId ? auth.userId : null;

  if (auth.isAuthenticated && auth.userId) {
    const full: WorkoutRoutine = {
      ...routineData,
      id: `routine-${Date.now()}`,
      userId: auth.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
    };

    try {
      const saved = await syncUserRoutine(auth.userId, full);
      await addStoredRoutine(saved, currentUserId);
      return saved;
    } catch (err) {
      console.warn(
        "Failed to persist routine to cloud, saving locally:",
        err,
      );
      return await addStoredRoutine(full, currentUserId);
    }
  }

  return await addStoredRoutine(routineData, null);
}

/**
 * Updates an existing workout routine in cloud or local storage.
 */
export async function updateWorkoutRoutine(
  routine: WorkoutRoutine,
  auth: WorkoutAuthContext,
): Promise<WorkoutRoutine> {
  const currentUserId =
    auth.isAuthenticated && auth.userId ? auth.userId : null;

  if (auth.isAuthenticated && auth.userId) {
    try {
      const saved = await syncUserRoutine(auth.userId, routine);
      await updateStoredRoutine(saved, currentUserId);
      return saved;
    } catch (err) {
      console.warn(
        "Failed to update routine in cloud, updating locally:",
        err,
      );
      await updateStoredRoutine(routine, currentUserId);
      return routine;
    }
  }

  return await updateStoredRoutine(routine, null);
}

/**
 * Deletes a workout routine from cloud or local storage.
 */
export async function deleteWorkoutRoutine(
  routineId: string,
  auth: WorkoutAuthContext,
): Promise<void> {
  const currentUserId =
    auth.isAuthenticated && auth.userId ? auth.userId : null;

  // 1. If it's a cloud UUID and user is authenticated, delete from Supabase
  if (isUUID(routineId) && auth.isAuthenticated && auth.userId) {
    try {
      await deleteUserRoutine(auth.userId, routineId);
    } catch (err) {
      console.warn("Failed to delete routine from cloud:", err);
    }
  }

  // 2. Always delete from local storage as well
  await deleteStoredRoutine(routineId, currentUserId);
}

/**
 * Saves a new custom exercise to local storage.
 */
export async function saveCustomExercise(
  exerciseData: Omit<Exercise, "id">,
  auth?: WorkoutAuthContext,
): Promise<Exercise> {
  const currentUserId =
    auth?.isAuthenticated && auth?.userId ? auth.userId : null;
  return await addStoredCustomExercise(exerciseData, currentUserId);
}

/**
 * Persists the current active workout session to recovery cache (or removes if null).
 */
export async function syncActiveWorkoutCache(
  session: WorkoutSession | null,
  auth?: WorkoutAuthContext,
): Promise<void> {
  const currentUserId =
    auth?.isAuthenticated && auth?.userId ? auth.userId : null;
  await setActiveWorkoutCache(session, currentUserId);
}
