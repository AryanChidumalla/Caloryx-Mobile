export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "cardio"
  | "full_body"
  | "other";

export type SetType = "warmup" | "regular" | "drop" | "failure";

export type Exercise = {
  id: string;
  name: string;
  category: MuscleGroup | string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  muscleGroup?: string;
  secondaryMuscles?: string[];
  instructions?: string;
  instructionSteps?: string[];
  image?: string;
  gifUrl?: string;
  mediaId?: string;
  attribution?: string;
  notes?: string;
  isCustom?: boolean;
};

export type RoutineExercise = {
  id: string;
  routineId?: string;
  exerciseId?: string;
  exerciseName: string;
  category?: MuscleGroup | string;
  orderIndex: number;
  targetSets: number;
  targetReps: string; // e.g. "8-12" or "10"
  targetWeightKg?: number;
  targetDurationSeconds?: number;
  notes?: string;
};

export type WorkoutRoutine = {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
  isCustom?: boolean;
};

export type ExerciseSet = {
  id: string;
  sessionExerciseId?: string;
  setNumber: number;
  setType: SetType;
  weightKg: number;
  reps: number;
  durationSeconds?: number;
  completed: boolean;
};

export type SessionExercise = {
  id: string;
  sessionId?: string;
  exerciseId?: string;
  exerciseName: string;
  category?: MuscleGroup | string;
  orderIndex: number;
  notes?: string;
  sets: ExerciseSet[];
};

export type WorkoutSession = {
  id: string;
  userId?: string;
  routineId?: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  totalVolumeKg: number;
  notes?: string;
  exercises: SessionExercise[];
  createdAt: string;
};

export type ActiveWorkoutState = {
  session: WorkoutSession;
  elapsedSeconds: number;
  isPaused: boolean;
};
