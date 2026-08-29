import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(initialSeconds = 7200, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            if (onExpireRef.current) onExpireRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, secondsLeft]);

  const start = useCallback((secs) => {
    if (secs !== undefined) setSecondsLeft(secs);
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback((secs = initialSeconds) => {
    setIsActive(false);
    setIsPaused(false);
    setSecondsLeft(secs);
  }, [initialSeconds]);

  const formatTime = useCallback(() => {
    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [secondsLeft]);

  return {
    secondsLeft,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    reset,
    formatTime,
    setSecondsLeft
  };
}
