import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

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
 * Uses wall-clock timestamps so that elapsed time remains accurate
 * across background/foreground app transitions and device sleep.
 */
export function useWorkoutTimer(): WorkoutTimerState {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStartTimeRef = useRef<number>(0);
  const accumulatedSecondsRef = useRef<number>(0);

  const clearTimerInterval = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const calculateElapsed = useCallback(() => {
    if (!isRunning || isPaused) {
      return accumulatedSecondsRef.current;
    }
    const additional = Math.floor(
      (Date.now() - lastStartTimeRef.current) / 1000,
    );
    return accumulatedSecondsRef.current + Math.max(0, additional);
  }, [isRunning, isPaused]);

  const startTimer = useCallback(
    (initialSeconds = 0) => {
      clearTimerInterval();
      accumulatedSecondsRef.current = Math.max(0, initialSeconds);
      lastStartTimeRef.current = Date.now();
      setElapsedSeconds(accumulatedSecondsRef.current);
      setIsPaused(false);
      setIsRunning(true);
    },
    [clearTimerInterval],
  );

  const pauseTimer = useCallback(() => {
    if (isRunning && !isPaused) {
      const additional = Math.floor(
        (Date.now() - lastStartTimeRef.current) / 1000,
      );
      accumulatedSecondsRef.current += Math.max(0, additional);
      setElapsedSeconds(accumulatedSecondsRef.current);
    }
    setIsPaused(true);
  }, [isRunning, isPaused]);

  const resumeTimer = useCallback(() => {
    lastStartTimeRef.current = Date.now();
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimerInterval();
    accumulatedSecondsRef.current = 0;
    lastStartTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsRunning(false);
  }, [clearTimerInterval]);

  // Keep internal state aligned if an external consumer directly modifies elapsedSeconds
  const setElapsedSecondsWrapped: React.Dispatch<
    React.SetStateAction<number>
  > = useCallback((action) => {
    setElapsedSeconds((prev) => {
      const nextVal = typeof action === "function" ? action(prev) : action;
      accumulatedSecondsRef.current = Math.max(0, nextVal);
      lastStartTimeRef.current = Date.now();
      return nextVal;
    });
  }, []);

  // Interval execution effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(calculateElapsed());
      }, 1000);
    } else {
      clearTimerInterval();
    }

    return () => {
      clearTimerInterval();
    };
  }, [isRunning, isPaused, calculateElapsed, clearTimerInterval]);

  // Sync immediately when returning from background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isRunning && !isPaused) {
        setElapsedSeconds(calculateElapsed());
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [isRunning, isPaused, calculateElapsed]);

  return {
    elapsedSeconds,
    isPaused,
    isRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setElapsedSeconds: setElapsedSecondsWrapped,
    setIsPaused,
  };
}
