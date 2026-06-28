"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

type IndicatorRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const EMPTY: IndicatorRect = { top: 0, left: 0, width: 0, height: 0 };

export function useSlidingIndicator<T extends HTMLElement>(
  activeKey: string,
  axis: "vertical" | "horizontal" = "vertical"
) {
  const containerRef = useRef<T>(null);
  const [indicator, setIndicator] = useState<IndicatorRect>(EMPTY);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const active = container.querySelector<HTMLElement>('[data-nav-active="true"]');
    if (!active) {
      setIndicator(EMPTY);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    if (axis === "vertical") {
      setIndicator({
        top: activeRect.top - containerRect.top + container.scrollTop,
        left: 0,
        width: 3,
        height: activeRect.height,
      });
    } else {
      setIndicator({
        top: 0,
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
        height: activeRect.height,
      });
    }
  }, [axis]);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    window.addEventListener("resize", measure);
    container?.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      container?.removeEventListener("scroll", measure);
    };
  }, [activeKey, measure]);

  return { containerRef, indicator };
}
