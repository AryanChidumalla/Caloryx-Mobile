import { Exercise, WorkoutRoutine, WorkoutSession } from "@/types/workout";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const WORKOUT_STORAGE_KEYS = {
  ROUTINES: "@caloryx/workout_routines_v1",
  SESSIONS: "@caloryx/workout_sessions_v1",
  CUSTOM_EXERCISES: "@caloryx/custom_exercises_v1",
  ACTIVE_WORKOUT: "@caloryx/active_workout_v1",
};

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  {
    id: "ex-1",
    name: "Barbell Bench Press",
    category: "chest",
    equipment: "barbell",
  },
  {
    id: "ex-2",
    name: "Incline Dumbbell Press",
    category: "chest",
    equipment: "dumbbell",
  },
  {
    id: "ex-3",
    name: "Chest Dips",
    category: "chest",
    equipment: "bodyweight",
  },
  {
    id: "ex-4",
    name: "Cable Crossover",
    category: "chest",
    equipment: "cable",
  },
  { id: "ex-5", name: "Push-Ups", category: "chest", equipment: "bodyweight" },

  // Back
  {
    id: "ex-6",
    name: "Barbell Deadlift",
    category: "back",
    equipment: "barbell",
  },
  { id: "ex-7", name: "Pull-Ups", category: "back", equipment: "bodyweight" },
  { id: "ex-8", name: "Lat Pulldown", category: "back", equipment: "cable" },
  {
    id: "ex-9",
    name: "Seated Cable Row",
    category: "back",
    equipment: "cable",
  },
  {
    id: "ex-10",
    name: "Bent Over Barbell Row",
    category: "back",
    equipment: "barbell",
  },

  // Legs
  {
    id: "ex-11",
    name: "Barbell Back Squat",
    category: "legs",
    equipment: "barbell",
  },
  {
    id: "ex-12",
    name: "Romanian Deadlift",
    category: "legs",
    equipment: "barbell",
  },
  { id: "ex-13", name: "Leg Press", category: "legs", equipment: "machine" },
  {
    id: "ex-14",
    name: "Leg Extension",
    category: "legs",
    equipment: "machine",
  },
  {
    id: "ex-15",
    name: "Hamstring Leg Curl",
    category: "legs",
    equipment: "machine",
  },
  {
    id: "ex-16",
    name: "Standing Calf Raises",
    category: "legs",
    equipment: "machine",
  },

  // Shoulders
  {
    id: "ex-17",
    name: "Overhead Barbell Press",
    category: "shoulders",
    equipment: "barbell",
  },
  {
    id: "ex-18",
    name: "Dumbbell Shoulder Press",
    category: "shoulders",
    equipment: "dumbbell",
  },
  {
    id: "ex-19",
    name: "Dumbbell Lateral Raise",
    category: "shoulders",
    equipment: "dumbbell",
  },
  { id: "ex-20", name: "Face Pull", category: "shoulders", equipment: "cable" },
  {
    id: "ex-21",
    name: "Reverse Pec Deck Fly",
    category: "shoulders",
    equipment: "machine",
  },

  // Arms
  {
    id: "ex-22",
    name: "Barbell Bicep Curl",
    category: "arms",
    equipment: "barbell",
  },
  {
    id: "ex-23",
    name: "Dumbbell Hammer Curl",
    category: "arms",
    equipment: "dumbbell",
  },
  {
    id: "ex-24",
    name: "Incline Dumbbell Curl",
    category: "arms",
    equipment: "dumbbell",
  },
  {
    id: "ex-25",
    name: "Triceps Rope Pushdown",
    category: "arms",
    equipment: "cable",
  },
  {
    id: "ex-26",
    name: "Skull Crushers",
    category: "arms",
    equipment: "barbell",
  },

  // Core
  {
    id: "ex-27",
    name: "Hanging Leg Raise",
    category: "core",
    equipment: "bodyweight",
  },
  { id: "ex-28", name: "Plank", category: "core", equipment: "bodyweight" },
  {
    id: "ex-29",
    name: "Ab Wheel Rollout",
    category: "core",
    equipment: "other",
  },
  {
    id: "ex-30",
    name: "Cable Woodchoppers",
    category: "core",
    equipment: "cable",
  },

  // Cardio
  {
    id: "ex-31",
    name: "Treadmill Run",
    category: "cardio",
    equipment: "machine",
  },
  {
    id: "ex-32",
    name: "Stationary Bike",
    category: "cardio",
    equipment: "machine",
  },
  { id: "ex-33", name: "Jump Rope", category: "cardio", equipment: "other" },
];

export const DEFAULT_ROUTINES: WorkoutRoutine[] = [];

// export const DEFAULT_ROUTINES: WorkoutRoutine[] = [
//   {
//     id: "default-push",
//     name: "Push Day",
//     description: "Chest, Shoulders & Triceps strength and hypertrophy",
//     createdAt: "2026-01-01T00:00:00.000Z",
//     updatedAt: "2026-01-01T00:00:00.000Z",
//     exercises: [
//       {
//         id: "re-1",
//         exerciseId: "ex-1",
//         exerciseName: "Barbell Bench Press",
//         category: "chest",
//         orderIndex: 0,
//         targetSets: 4,
//         targetReps: "8-10",
//         targetWeightKg: 60,
//       },
//       {
//         id: "re-2",
//         exerciseId: "ex-2",
//         exerciseName: "Incline Dumbbell Press",
//         category: "chest",
//         orderIndex: 1,
//         targetSets: 3,
//         targetReps: "10-12",
//         targetWeightKg: 22,
//       },
//       {
//         id: "re-3",
//         exerciseId: "ex-18",
//         exerciseName: "Dumbbell Shoulder Press",
//         category: "shoulders",
//         orderIndex: 2,
//         targetSets: 3,
//         targetReps: "10-12",
//         targetWeightKg: 18,
//       },
//       {
//         id: "re-4",
//         exerciseId: "ex-19",
//         exerciseName: "Dumbbell Lateral Raise",
//         category: "shoulders",
//         orderIndex: 3,
//         targetSets: 4,
//         targetReps: "12-15",
//         targetWeightKg: 10,
//       },
//       {
//         id: "re-5",
//         exerciseId: "ex-25",
//         exerciseName: "Triceps Rope Pushdown",
//         category: "arms",
//         orderIndex: 4,
//         targetSets: 3,
//         targetReps: "12-15",
//         targetWeightKg: 20,
//       },
//     ],
//   },
//   {
//     id: "default-pull",
//     name: "Pull Day",
//     description: "Back, Rear Delts & Biceps pulling volume",
//     createdAt: "2026-01-01T00:00:00.000Z",
//     updatedAt: "2026-01-01T00:00:00.000Z",
//     exercises: [
//       {
//         id: "re-6",
//         exerciseId: "ex-6",
//         exerciseName: "Barbell Deadlift",
//         category: "back",
//         orderIndex: 0,
//         targetSets: 3,
//         targetReps: "6-8",
//         targetWeightKg: 100,
//       },
//       {
//         id: "re-7",
//         exerciseId: "ex-8",
//         exerciseName: "Lat Pulldown",
//         category: "back",
//         orderIndex: 1,
//         targetSets: 3,
//         targetReps: "10-12",
//         targetWeightKg: 50,
//       },
//       {
//         id: "re-8",
//         exerciseId: "ex-9",
//         exerciseName: "Seated Cable Row",
//         category: "back",
//         orderIndex: 2,
//         targetSets: 3,
//         targetReps: "10-12",
//         targetWeightKg: 45,
//       },
//       {
//         id: "re-9",
//         exerciseId: "ex-20",
//         exerciseName: "Face Pull",
//         category: "shoulders",
//         orderIndex: 3,
//         targetSets: 3,
//         targetReps: "15",
//         targetWeightKg: 15,
//       },
//       {
//         id: "re-10",
//         exerciseId: "ex-22",
//         exerciseName: "Barbell Bicep Curl",
//         category: "arms",
//         orderIndex: 4,
//         targetSets: 3,
//         targetReps: "10-12",
//         targetWeightKg: 25,
//       },
//     ],
//   },
//   {
//     id: "default-legs",
//     name: "Leg Day",
//     description: "Quads, Hamstrings & Calves lower body focus",
//     createdAt: "2026-01-01T00:00:00.000Z",
//     updatedAt: "2026-01-01T00:00:00.000Z",
//     exercises: [
//       {
//         id: "re-11",
//         exerciseId: "ex-11",
//         exerciseName: "Barbell Back Squat",
//         category: "legs",
//         orderIndex: 0,
//         targetSets: 4,
//         targetReps: "8-10",
//         targetWeightKg: 80,
//       },
//       {
//         id: "re-12",
//         exerciseId: "ex-12",
//         exerciseName: "Romanian Deadlift",
//         category: "legs",
//         orderIndex: 1,
//         targetSets: 3,
//         targetReps: "10-12",
//         targetWeightKg: 60,
//       },
//       {
//         id: "re-13",
//         exerciseId: "ex-13",
//         exerciseName: "Leg Press",
//         category: "legs",
//         orderIndex: 2,
//         targetSets: 3,
//         targetReps: "12-15",
//         targetWeightKg: 120,
//       },
//       {
//         id: "re-14",
//         exerciseId: "ex-14",
//         exerciseName: "Leg Extension",
//         category: "legs",
//         orderIndex: 3,
//         targetSets: 3,
//         targetReps: "12-15",
//         targetWeightKg: 40,
//       },
//       {
//         id: "re-15",
//         exerciseId: "ex-16",
//         exerciseName: "Standing Calf Raises",
//         category: "legs",
//         orderIndex: 4,
//         targetSets: 4,
//         targetReps: "15",
//         targetWeightKg: 50,
//       },
//     ],
//   },
//   {
//     id: "default-fullbody",
//     name: "Full Body Essentials",
//     description: "Efficient compound movements across all major muscle groups",
//     createdAt: "2026-01-01T00:00:00.000Z",
//     updatedAt: "2026-01-01T00:00:00.000Z",
//     exercises: [
//       {
//         id: "re-16",
//         exerciseId: "ex-11",
//         exerciseName: "Barbell Back Squat",
//         category: "legs",
//         orderIndex: 0,
//         targetSets: 3,
//         targetReps: "8-10",
//         targetWeightKg: 70,
//       },
//       {
//         id: "re-17",
//         exerciseId: "ex-1",
//         exerciseName: "Barbell Bench Press",
//         category: "chest",
//         orderIndex: 1,
//         targetSets: 3,
//         targetReps: "8-10",
//         targetWeightKg: 60,
//       },
//       {
//         id: "re-18",
//         exerciseId: "ex-8",
//         exerciseName: "Lat Pulldown",
//         category: "back",
//         orderIndex: 2,
//         targetSets: 3,
//         targetReps: "10-12",
//         targetWeightKg: 50,
//       },
//       {
//         id: "re-19",
//         exerciseId: "ex-18",
//         exerciseName: "Dumbbell Shoulder Press",
//         category: "shoulders",
//         orderIndex: 3,
//         targetSets: 3,
//         targetReps: "10-12",
//         targetWeightKg: 18,
//       },
//       {
//         id: "re-20",
//         exerciseId: "ex-28",
//         exerciseName: "Plank",
//         category: "core",
//         orderIndex: 4,
//         targetSets: 3,
//         targetReps: "60s",
//         targetDurationSeconds: 60,
//       },
//     ],
//   },
// ];

// -----------------------------------------------------------------------------
// Routine Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredRoutines(): Promise<WorkoutRoutine[]> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_STORAGE_KEYS.ROUTINES);
    if (!raw) {
      await AsyncStorage.setItem(
        WORKOUT_STORAGE_KEYS.ROUTINES,
        JSON.stringify(DEFAULT_ROUTINES),
      );
      return DEFAULT_ROUTINES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ROUTINES;
  } catch (err) {
    console.error("Failed to load routines from storage:", err);
    return DEFAULT_ROUTINES;
  }
}

export async function saveStoredRoutines(
  routines: WorkoutRoutine[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      WORKOUT_STORAGE_KEYS.ROUTINES,
      JSON.stringify(routines),
    );
  } catch (err) {
    console.error("Failed to save routines to storage:", err);
  }
}

export async function addStoredRoutine(
  routine: Omit<WorkoutRoutine, "id" | "createdAt" | "updatedAt">,
): Promise<WorkoutRoutine> {
  const routines = await getStoredRoutines();
  const now = new Date().toISOString();
  const newRoutine: WorkoutRoutine = {
    ...routine,
    id: `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
    isCustom: true,
  };
  const updated = [newRoutine, ...routines];
  await saveStoredRoutines(updated);
  return newRoutine;
}

export async function updateStoredRoutine(
  routine: WorkoutRoutine,
): Promise<WorkoutRoutine> {
  const routines = await getStoredRoutines();
  const updatedList = routines.map((r) =>
    r.id === routine.id
      ? { ...routine, updatedAt: new Date().toISOString() }
      : r,
  );
  await saveStoredRoutines(updatedList);
  return routine;
}

export async function deleteStoredRoutine(id: string): Promise<void> {
  const routines = await getStoredRoutines();
  const filtered = routines.filter((r) => r.id !== id);
  await saveStoredRoutines(filtered);
}

// -----------------------------------------------------------------------------
// Workout Session History Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredSessions(): Promise<WorkoutSession[]> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load sessions from storage:", err);
    return [];
  }
}

export async function saveStoredSessions(
  sessions: WorkoutSession[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      WORKOUT_STORAGE_KEYS.SESSIONS,
      JSON.stringify(sessions),
    );
  } catch (err) {
    console.error("Failed to save sessions to storage:", err);
  }
}

export async function addStoredSession(
  session: WorkoutSession,
): Promise<WorkoutSession> {
  const sessions = await getStoredSessions();
  const updated = [session, ...sessions];
  await saveStoredSessions(updated);
  return session;
}

export async function updateStoredSession(
  session: WorkoutSession,
): Promise<WorkoutSession> {
  const sessions = await getStoredSessions();
  const updated = sessions.map((s) => (s.id === session.id ? session : s));
  await saveStoredSessions(updated);
  return session;
}

export async function deleteStoredSession(id: string): Promise<void> {
  const sessions = await getStoredSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  await saveStoredSessions(filtered);
}

// -----------------------------------------------------------------------------
// Custom Exercises Storage Methods
// -----------------------------------------------------------------------------

export async function getStoredCustomExercises(): Promise<Exercise[]> {
  try {
    const raw = await AsyncStorage.getItem(
      WORKOUT_STORAGE_KEYS.CUSTOM_EXERCISES,
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load custom exercises:", err);
    return [];
  }
}

export async function addStoredCustomExercise(
  exercise: Omit<Exercise, "id">,
): Promise<Exercise> {
  const current = await getStoredCustomExercises();
  const newEx: Exercise = {
    ...exercise,
    id: `custom-ex-${Date.now()}`,
    isCustom: true,
  };
  await AsyncStorage.setItem(
    WORKOUT_STORAGE_KEYS.CUSTOM_EXERCISES,
    JSON.stringify([newEx, ...current]),
  );
  return newEx;
}

// -----------------------------------------------------------------------------
// Active Workout Session Cache (Recovery)
// -----------------------------------------------------------------------------

export async function getActiveWorkoutCache(): Promise<WorkoutSession | null> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_STORAGE_KEYS.ACTIVE_WORKOUT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setActiveWorkoutCache(
  session: WorkoutSession | null,
): Promise<void> {
  try {
    if (!session) {
      await AsyncStorage.removeItem(WORKOUT_STORAGE_KEYS.ACTIVE_WORKOUT);
    } else {
      await AsyncStorage.setItem(
        WORKOUT_STORAGE_KEYS.ACTIVE_WORKOUT,
        JSON.stringify(session),
      );
    }
  } catch (err) {
    console.warn("Failed to cache active workout:", err);
  }
}
