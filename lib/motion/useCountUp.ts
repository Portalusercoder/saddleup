"use client";

import { useEffect, useRef, useState } from "react";

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function useCountUp(end: number, duration = 800, enabled = true): number {
  const [value, setValue] = useState(enabled ? 0 : end);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      setValue(end);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(easeOutQuart(progress) * end));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, enabled]);

  return value;
}
