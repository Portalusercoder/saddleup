"use client";

import { useEffect, useState } from "react";

export function usePageTour(storageKey: string, enabled: boolean) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      const seen = localStorage.getItem(storageKey);
      if (seen !== "done") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [enabled, storageKey]);

  const complete = () => {
    try {
      localStorage.setItem(storageKey, "done");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return { open, complete };
}
