"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(Array.isArray(d) ? d : []))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m-4 0v1a3 3 0 118 0v-1"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[10px] font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto border border-white/10 bg-black z-50">
          <div className="p-3 border-b border-white/10">
            <h3 className="text-sm font-medium text-white uppercase tracking-wider">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-white/50 text-sm">No notifications</p>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`p-4 hover:bg-white/5 ${!n.readAt ? "bg-white/5" : ""}`}
                >
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  {n.body && <p className="text-xs text-white/60 mt-1">{n.body}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    {n.bookingId && (
                      <Link
                        href="/dashboard/bookings"
                        onClick={() => {
                          markRead(n.id);
                          setOpen(false);
                        }}
                        className="text-xs text-white/50 hover:text-white uppercase tracking-wider"
                      >
                        View bookings
                      </Link>
                    )}
                    {!n.readAt && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-xs text-white/40 hover:text-white"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
