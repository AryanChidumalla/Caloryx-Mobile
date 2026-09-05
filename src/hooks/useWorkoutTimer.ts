import { useCallback, useEffect, useRef, useState } from "react";

export type WorkoutTimerState = {
  elapsedSeconds: number;
  isPaused: boolean;
  isRunning: boolean;
  startTimer: (initialSeconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  setElapsedSeconds: React.Dispatch<React.SetStateAction<number>>;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Custom hook for managing the active workout timer.
 * Encapsulates the interval runner, pause/resume state, and cleanup.
 */
export function useWorkoutTimer(): WorkoutTimerState {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (initialSeconds = 0) => {
      clearTimerInterval();
      setElapsedSeconds(initialSeconds);
      setIsPaused(false);
      setIsRunning(true);
    },
    [clearTimerInterval],
  );

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimerInterval();
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsRunning(false);
  }, [clearTimerInterval]);

  // Interval execution effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearTimerInterval();
    }

    return () => {
      clearTimerInterval();
    };
  }, [isRunning, isPaused, clearTimerInterval]);

  return {
    elapsedSeconds,
    isPaused,
    isRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setElapsedSeconds,
    setIsPaused,
  };
}
