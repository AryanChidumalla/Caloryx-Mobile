import { supabase } from "@/lib/supabase";
import { WorkoutRoutine, WorkoutSession } from "@/types/workout";

/**
 * Fetches all workout routines and their configured exercises for a user from Supabase.
 */
export async function fetchUserRoutines(
  userId: string,
): Promise<WorkoutRoutine[]> {
  try {
    const { data: routinesData, error: routinesError } = await supabase
      .from("workout_routines")
      .select("*, routine_exercises(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (routinesError) {
      console.warn("Error fetching routines from Supabase:", routinesError);
      return [];
    }

    if (!routinesData || !Array.isArray(routinesData)) {
      return [];
    }

    return routinesData.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      description: r.description || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      isCustom: true,
      exercises: Array.isArray(r.routine_exercises)
        ? r.routine_exercises
            .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((re: any) => ({
              id: re.id,
              routineId: re.routine_id,
              exerciseId: re.exercise_id || undefined,
              exerciseName: re.exercise_name,
              category: re.category || undefined,
              orderIndex: re.order_index,
              targetSets: re.target_sets ?? 3,
              targetReps: re.target_reps ?? "10",
              targetWeightKg: re.target_weight_kg ? Number(re.target_weight_kg) : 0,
              targetDurationSeconds: re.target_duration_seconds ?? undefined,
              notes: re.notes || undefined,
            }))
        : [],
    }));
  } catch (err) {
    console.warn("fetchUserRoutines error:", err);
    return [];
  }
}

/**
 * Saves or updates a workout routine and its exercises in Supabase.
 */
export async function syncUserRoutine(
  userId: string,
  routine: WorkoutRoutine,
): Promise<WorkoutRoutine> {
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      routine.id,
    );

  const routinePayload: any = {
    user_id: userId,
    name: routine.name.trim(),
    description: routine.description?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (isUUID) {
    routinePayload.id = routine.id;
  }

  const { data: savedRoutine, error: rError } = await supabase
    .from("workout_routines")
    .upsert(routinePayload)
    .select()
    .single();

  if (rError) {
    throw rError;
  }

  const actualRoutineId = savedRoutine.id;

  // Clear existing routine_exercises and reinsert
  await supabase
    .from("routine_exercises")
    .delete()
    .eq("routine_id", actualRoutineId);

  if (routine.exercises && routine.exercises.length > 0) {
    const exercisesPayload = routine.exercises.map((re, idx) => ({
      routine_id: actualRoutineId,
      exercise_id:
        re.exerciseId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          re.exerciseId,
        )
          ? re.exerciseId
          : null,
      exercise_name: re.exerciseName,
      category: re.category || null,
      order_index: idx,
      target_sets: re.targetSets || 3,
      target_reps: String(re.targetReps || "10"),
      target_weight_kg: Number(re.targetWeightKg || 0),
      target_duration_seconds: re.targetDurationSeconds ?? null,
      notes: re.notes || null,
    }));

    await supabase.from("routine_exercises").insert(exercisesPayload);
  }

  return {
    ...routine,
    id: actualRoutineId,
    userId,
  };
}

/**
 * Deletes a routine from Supabase.
 */
export async function deleteUserRoutine(
  userId: string,
  routineId: string,
): Promise<void> {
  const { error } = await supabase
    .from("workout_routines")
    .delete()
    .eq("id", routineId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

/**
 * Saves a completed workout session with its exercises and sets into Supabase.
 */
export async function saveUserWorkoutSession(
  userId: string,
  session: WorkoutSession,
): Promise<WorkoutSession> {
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      session.id,
    );

  const sessionPayload: any = {
    user_id: userId,
    routine_id:
      session.routineId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        session.routineId,
      )
        ? session.routineId
        : null,
    name: session.name,
    started_at: session.startedAt,
    completed_at: session.completedAt || new Date().toISOString(),
    duration_seconds: session.durationSeconds || 0,
    total_volume_kg: session.totalVolumeKg || 0,
    notes: session.notes || null,
    created_at: session.createdAt || new Date().toISOString(),
  };

  if (isUUID) {
    sessionPayload.id = session.id;
  }

  const { data: savedSession, error: sError } = await supabase
    .from("workout_sessions")
    .insert(sessionPayload)
    .select()
    .single();

  if (sError) {
    throw sError;
  }

  const actualSessionId = savedSession.id;

  // Insert session exercises and sets
  for (let i = 0; i < session.exercises.length; i++) {
    const se = session.exercises[i];
    const { data: savedSe, error: seError } = await supabase
      .from("session_exercises")
      .insert({
        session_id: actualSessionId,
        exercise_id:
          se.exerciseId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            se.exerciseId,
          )
            ? se.exerciseId
            : null,
        exercise_name: se.exerciseName,
        category: se.category || null,
        order_index: i,
        notes: se.notes || null,
      })
      .select()
      .single();

    if (!seError && savedSe && se.sets && se.sets.length > 0) {
      const setsPayload = se.sets.map((set, setIdx) => ({
        session_exercise_id: savedSe.id,
        set_number: set.setNumber || setIdx + 1,
        set_type: set.setType || "regular",
        weight_kg: Number(set.weightKg || 0),
        reps: Number(set.reps || 0),
        duration_seconds: set.durationSeconds ?? null,
        completed: Boolean(set.completed),
      }));

      await supabase.from("exercise_sets").insert(setsPayload);
    }
  }

  return {
    ...session,
    id: actualSessionId,
    userId,
  };
}

/**
 * Fetches all past workout sessions for the user from Supabase.
 */
export async function fetchUserWorkoutSessions(
  userId: string,
): Promise<WorkoutSession[]> {
  try {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*, session_exercises(*, exercise_sets(*))")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) {
      console.warn("Error fetching workout sessions from Supabase:", error);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      routineId: s.routine_id || undefined,
      name: s.name,
      startedAt: s.started_at,
      completedAt: s.completed_at || undefined,
      durationSeconds: s.duration_seconds || 0,
      totalVolumeKg: Number(s.total_volume_kg || 0),
      notes: s.notes || undefined,
      createdAt: s.created_at,
      exercises: Array.isArray(s.session_exercises)
        ? s.session_exercises
            .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((se: any) => ({
              id: se.id,
              sessionId: se.session_id,
              exerciseId: se.exercise_id || undefined,
              exerciseName: se.exercise_name,
              category: se.category || undefined,
              orderIndex: se.order_index,
              notes: se.notes || undefined,
              sets: Array.isArray(se.exercise_sets)
                ? se.exercise_sets
                    .sort((a: any, b: any) => (a.set_number ?? 0) - (b.set_number ?? 0))
                    .map((st: any) => ({
                      id: st.id,
                      sessionExerciseId: st.session_exercise_id,
                      setNumber: st.set_number,
                      setType: st.set_type || "regular",
                      weightKg: Number(st.weight_kg || 0),
                      reps: Number(st.reps || 0),
                      durationSeconds: st.duration_seconds ?? undefined,
                      completed: Boolean(st.completed),
                    }))
                : [],
            }))
        : [],
    }));
  } catch (err) {
    console.warn("fetchUserWorkoutSessions error:", err);
    return [];
  }
}

/**
 * Deletes a session from Supabase.
 */
export async function deleteUserWorkoutSession(
  userId: string,
  sessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

/**
 * Updates an existing completed workout session in Supabase.
 */
export async function updateCloudWorkoutSession(
  userId: string,
  session: WorkoutSession,
): Promise<void> {
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      session.id,
    );

  if (!isUUID) {
    return;
  }

  try {
    // 1. Update the parent workout_session record
    await supabase
      .from("workout_sessions")
      .update({
        name: session.name,
        completed_at: session.completedAt || new Date().toISOString(),
        duration_seconds: session.durationSeconds || 0,
        total_volume_kg: session.totalVolumeKg || 0,
        notes: session.notes || null,
      })
      .eq("id", session.id)
      .eq("user_id", userId);

    // 2. Clear previous session_exercises (cascades to sets)
    await supabase
      .from("session_exercises")
      .delete()
      .eq("session_id", session.id);

    // 3. Re-insert updated exercises & sets
    for (let i = 0; i < session.exercises.length; i++) {
      const se = session.exercises[i];
      const { data: savedSe, error: seError } = await supabase
        .from("session_exercises")
        .insert({
          session_id: session.id,
          exercise_id:
            se.exerciseId &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              se.exerciseId,
            )
              ? se.exerciseId
              : null,
          exercise_name: se.exerciseName,
          category: se.category || null,
          order_index: i,
          notes: se.notes || null,
        })
        .select()
        .single();

      if (!seError && savedSe && se.sets && se.sets.length > 0) {
        const setsPayload = se.sets.map((set, setIdx) => ({
          session_exercise_id: savedSe.id,
          set_number: set.setNumber || setIdx + 1,
          set_type: set.setType || "regular",
          weight_kg: Number(set.weightKg || 0),
          reps: Number(set.reps || 0),
          duration_seconds: set.durationSeconds ?? null,
          completed: Boolean(set.completed),
        }));

        await supabase.from("exercise_sets").insert(setsPayload);
      }
    }
  } catch (err) {
    console.warn("updateCloudWorkoutSession error:", err);
  }
}
