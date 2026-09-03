-- ==============================================================================
-- Supabase Schema Migration: Workout, Water & Daily Activity Tracking
-- Version: 20260902_workout_water_activity
-- ==============================================================================

-- 1. Exercises Table (Public system exercises + User custom exercises)
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g. 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'
  equipment TEXT,        -- e.g. 'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'
  notes TEXT,
  gif_url TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for searching exercises
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON public.exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_name ON public.exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);

-- Enable RLS for exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Allow users to read system exercises (user_id IS NULL) and their own custom exercises
CREATE POLICY "Users can view system and own exercises"
  ON public.exercises FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own custom exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom exercises"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom exercises"
  ON public.exercises FOR DELETE
  USING (auth.uid() = user_id);


-- 2. Workout Routines (Reusable Workout Templates)
CREATE TABLE IF NOT EXISTS public.workout_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_routines_user_id ON public.workout_routines(user_id);

ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines"
  ON public.workout_routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON public.workout_routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON public.workout_routines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
  ON public.workout_routines FOR DELETE
  USING (auth.uid() = user_id);


-- 3. Routine Exercises (Exercises configured inside a Routine template)
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.workout_routines(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  target_sets INTEGER DEFAULT 3,
  target_reps TEXT DEFAULT '10',
  target_weight_kg NUMERIC(6,2) DEFAULT 0,
  target_duration_seconds INTEGER,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON public.routine_exercises(routine_id);

ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage exercises of their routines"
  ON public.routine_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_routines
      WHERE public.workout_routines.id = public.routine_exercises.routine_id
        AND public.workout_routines.user_id = auth.uid()
    )
  );


-- 4. Workout Sessions (Recorded Workout History)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES public.workout_routines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  total_volume_kg NUMERIC(8,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON public.workout_sessions(started_at);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON public.workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
  ON public.workout_sessions FOR DELETE
  USING (auth.uid() = user_id);


-- 5. Session Exercises (Exercises performed in an active/recorded session)
CREATE TABLE IF NOT EXISTS public.session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_session_exercises_session_id ON public.session_exercises(session_id);

ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage exercises of their workout sessions"
  ON public.session_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions
      WHERE public.workout_sessions.id = public.session_exercises.session_id
        AND public.workout_sessions.user_id = auth.uid()
    )
  );


-- 6. Exercise Sets (Sets performed for a session exercise)
CREATE TABLE IF NOT EXISTS public.exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id UUID NOT NULL REFERENCES public.session_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  set_type TEXT DEFAULT 'regular', -- 'warmup', 'regular', 'drop', 'failure'
  weight_kg NUMERIC(6,2) DEFAULT 0,
  reps INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_exercise_sets_session_exercise_id ON public.exercise_sets(session_exercise_id);

ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sets of their session exercises"
  ON public.exercise_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises
      JOIN public.workout_sessions ON public.workout_sessions.id = public.session_exercises.session_id
      WHERE public.session_exercises.id = public.exercise_sets.session_exercise_id
        AND public.workout_sessions.user_id = auth.uid()
    )
  );


-- 7. Water Logs (Daily Water Intake)
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_user_date_water UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs(user_id, date);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water logs"
  ON public.water_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own water logs"
  ON public.water_logs FOR ALL
  USING (auth.uid() = user_id);


-- 8. Daily Activity (Daily Steps & Health Connect metrics)
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  step_count INTEGER NOT NULL DEFAULT 0,
  step_goal INTEGER DEFAULT 10000,
  distance_meters NUMERIC(8,2) DEFAULT 0,
  calories_burned NUMERIC(8,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_user_date_activity UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, date);

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily activity"
  ON public.daily_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own daily activity"
  ON public.daily_activity FOR ALL
  USING (auth.uid() = user_id);
