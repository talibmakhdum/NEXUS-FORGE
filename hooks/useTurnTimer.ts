import { useEffect, useRef, useState, useCallback } from 'react';
import { logError, logInfo } from '../lib/error-logger';

const DEFAULT_TURN_TIME = 90; // seconds
const WARNING_THRESHOLD = 15; // seconds — turn red

interface UseTurnTimerOptions {
  initialTime?: number;
  isActive: boolean;
  onTimeUp?: () => void;
  onWarning?: (timeLeft: number) => void;
}

/**
 * Turn timer hook enforcing 90 seconds per turn.
 * Counts down while active, triggers callbacks at warning threshold and on expiry.
 */
export function useTurnTimer({
  initialTime = DEFAULT_TURN_TIME,
  isActive,
  onTimeUp,
  onWarning,
}: UseTurnTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasWarnedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(initialTime);
    setIsWarning(false);
    hasWarnedRef.current = false;
    startTimeRef.current = Date.now();
  }, [initialTime, clearTimer]);

  // Main countdown effect
  useEffect(() => {
    if (!isActive) {
      clearTimer();
      return;
    }

    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, initialTime - elapsed);

      setTimeLeft(remaining);

      // Warning threshold
      if (remaining <= WARNING_THRESHOLD && !hasWarnedRef.current) {
        hasWarnedRef.current = true;
        setIsWarning(true);
        onWarning?.(remaining);
      }

      // Time's up
      if (remaining === 0) {
        clearTimer();
        logInfo('Turn timer expired', 'useTurnTimer', { initialTime });
        onTimeUp?.();
      }
    }, 1000);

    return clearTimer;
  }, [isActive, initialTime, onTimeUp, onWarning, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    timeLeft,
    isWarning,
    resetTimer,
    formattedTime: `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`,
  };
}
