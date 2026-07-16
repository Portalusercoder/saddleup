"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  bookingId: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [badgePop, setBadgePop] = useState(false);
  const prevUnreadRef = useRef(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(Array.isArray(d) ? d : []))
      .catch(() => setNotifications([]));
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  useEffect(() => {
    if (unreadCount > 0 && prevUnreadRef.current === 0) {
      setBadgePop(true);
      const timer = window.setTimeout(() => setBadgePop(false), 450);
      prevUnreadRef.current = unreadCount;
      return () => window.clearTimeout(timer);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const closeDrawer = useCallback(() => {
    if (!open) return;
    setOpen(false);
    setClosing(true);
    window.setTimeout(() => setClosing(false), 200);
  }, [open]);

  const openDrawer = useCallback(() => {
    setClosing(false);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeDrawer]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  const showDrawer = open || closing;

  return (
    <>
      <button
        type="button"
        data-tour="notification-bell"
        onClick={() => (open ? closeDrawer() : openDrawer())}
        className="notification-bell-trigger relative rounded-lg p-2 transition hover:bg-black/10"
        aria-label={t("notifications.ariaLabel")}
        aria-expanded={open}
      >
        <svg
          className="notification-bell-icon h-5 w-5 text-black/80"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m-4 0v1a3 3 0 118 0v-1"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            className={`notification-unread-dot ${badgePop ? "notification-unread-dot-pop" : ""}`}
            aria-hidden
          />
        )}
      </button>

      {showDrawer && (
        <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true">
          <button
            type="button"
            className={`drawer-backdrop absolute inset-0 bg-black/50 ${closing ? "opacity-0 transition-opacity duration-200 ease-in" : ""}`}
            onClick={closeDrawer}
            aria-label={t("notifications.close")}
          />
          <aside
            className={`notification-drawer relative flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-elevated/95 backdrop-blur-[20px] ${closing ? "notification-drawer-exit" : "notification-drawer-enter"}`}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="text-[15px] font-medium text-white">{t("notifications.title")}</h3>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label={t("notifications.close")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-5 text-sm text-white/45">{t("notifications.empty")}</p>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {notifications.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 transition hover:bg-white/[0.04] ${!n.readAt ? "bg-white/[0.03]" : ""}`}
                    >
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      {n.body ? <p className="mt-1 text-xs text-white/55">{n.body}</p> : null}
                      <div className="mt-2 flex items-center gap-3">
                        {n.bookingId ? (
                          <Link
                            href="/dashboard/bookings"
                            onClick={() => {
                              markRead(n.id);
                              closeDrawer();
                            }}
                            className="text-xs text-mist hover:text-mist/80"
                          >
                            {t("notifications.viewBookings")}
                          </Link>
                        ) : null}
                        {!n.readAt ? (
                          <button
                            type="button"
                            onClick={() => markRead(n.id)}
                            className="text-xs text-white/40 hover:text-white/70"
                          >
                            {t("notifications.markRead")}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
