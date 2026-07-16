"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const SIZE_CLASS = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
} as const;

export type ModalOverlayProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: keyof typeof SIZE_CLASS;
};

/** Full-viewport modal with blurred backdrop; portals to body to escape page layout transforms. */
export default function ModalOverlay({
  open,
  onClose,
  children,
  size = "md",
}: ModalOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="dashboard-modal-overlay modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`dashboard-modal-panel modal-enter bg-card border border-white/10 rounded-control p-4 sm:p-6 w-full ${SIZE_CLASS[size]}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
