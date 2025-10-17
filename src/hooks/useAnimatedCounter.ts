import { useState, useEffect } from 'react';

interface UseAnimatedCounterOptions {
  start?: number;
  end: number;
  duration?: number;
  enabled?: boolean;
}

export function useAnimatedCounter({
  start = 0,
  end,
  duration = 1000,
  enabled = true
}: UseAnimatedCounterOptions) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!enabled) {
      setCount(end);
      return;
    }

    let startTime: number | null = null;
    const startValue = start;
    const endValue = end;
    const difference = endValue - startValue;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + difference * easeOut);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [start, end, duration, enabled]);

  return count;
}