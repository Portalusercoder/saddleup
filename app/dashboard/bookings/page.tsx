"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import { HorseAvatar } from "@/components/HorseAvatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TableSkeleton from "@/components/ui/TableSkeleton";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { trackEvent } from "@/lib/analytics/mixpanel-client";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  declinedNotes?: string | null;
  horse: { id: string; name: string; photoUrl?: string | null } | null;
  rider: { id: string; name: string } | null;
  trainer: { id: string; fullName: string | null } | null;
}

interface Horse {
  id: string;
  name: string;
  photoUrl?: string | null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const { profile } = useProfile();
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState<Booking | null>(null);
  const [declineNotes, setDeclineNotes] = useState("");
  const [createForm, setCreateForm] = useState({
    horseId: "",
    bookingDate: "",
    startTime: "09:00",
    endTime: "09:45",
    notes: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_bookings_v1",
    !loading
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/horses").then((r) => r.json()),
    ]).then(([b, h]) => {
      setBookings(Array.isArray(b) ? b : []);
      setHorses(Array.isArray(h) ? h : []);
      setLoading(false);
    });
  }, []);

  const isStudent = profile?.role === "student";
  const isTrainerOrOwner =
    profile?.role === "trainer" || profile?.role === "owner";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(dateLocale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const formatTime = (t: string) => {
    if (typeof t !== "string") return t;
    const [h, m] = t.split(":");
    return `${h}:${m || "00"}`;
  };

  const handleCreate = async () => {
    if (!createForm.horseId || !createForm.bookingDate) return;
    setCreateLoading(true);
    trackEvent("booking_request_attempted", { horse_id: createForm.horseId });
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horseId: createForm.horseId,
          bookingDate: createForm.bookingDate,
          startTime: createForm.startTime,
          endTime: createForm.endTime,
          notes: createForm.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      trackEvent("booking_request_succeeded", {
        horse_id: createForm.horseId,
        status: data.status ?? "pending",
      });
      setBookings((prev) => [
        ...prev,
        {
          id: data.id,
          bookingDate: data.bookingDate,
          startTime: data.startTime,
          endTime: data.endTime,
          status: data.status,
          horse: horses.find((h) => h.id === createForm.horseId)
            ? { id: createForm.horseId, name: horses.find((h) => h.id === createForm.horseId)!.name, photoUrl: null }
            : null,
          rider: null,
          trainer: null,
        },
      ]);
      setShowCreate(false);
      setCreateForm({ horseId: "", bookingDate: "", startTime: "09:00", endTime: "09:45", notes: "" });
    } catch (err) {
      trackEvent("booking_request_failed", { horse_id: createForm.horseId });
      alert((err as Error).message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleApprove = async (b: Booking) => {
    trackEvent("booking_approve_attempted", { booking_id: b.id, horse_id: b.horse?.id ?? null });
    try {
      const res = await fetch(`/api/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setBookings((prev) =>
        prev.map((x) => (x.id === b.id ? { ...x, status: "scheduled" } : x))
      );
      trackEvent("booking_approved", { booking_id: b.id, horse_id: b.horse?.id ?? null });
    } catch (err) {
      trackEvent("booking_approve_failed", { booking_id: b.id, horse_id: b.horse?.id ?? null });
      alert((err as Error).message);
    }
  };

  const handleDecline = async () => {
    if (!showDeclineModal) return;
    trackEvent("booking_decline_attempted", {
      booking_id: showDeclineModal.id,
      horse_id: showDeclineModal.horse?.id ?? null,
    });
    try {
      const res = await fetch(`/api/bookings/${showDeclineModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline", declinedNotes: declineNotes || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setBookings((prev) =>
        prev.map((x) =>
          x.id === showDeclineModal.id
            ? { ...x, status: "declined", declinedNotes: declineNotes || null }
            : x
        )
      );
      setShowDeclineModal(null);
      setDeclineNotes("");
      trackEvent("booking_declined", {
        booking_id: showDeclineModal.id,
        horse_id: showDeclineModal.horse?.id ?? null,
      });
    } catch (err) {
      trackEvent("booking_decline_failed", {
        booking_id: showDeclineModal.id,
        horse_id: showDeclineModal.horse?.id ?? null,
      });
      alert((err as Error).message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm(t("dashboard.bookingsConfirmCancel"))) return;
    trackEvent("booking_cancel_attempted", { booking_id: id });
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
      trackEvent("booking_cancelled", { booking_id: id });
    } catch (err) {
      trackEvent("booking_cancel_failed", { booking_id: id });
      alert((err as Error).message);
    }
  };

  const pending = bookings.filter(
    (b) =>
      b.status === "pending" &&
      new Date(b.bookingDate) >= new Date(new Date().toDateString())
  );
  const upcoming = bookings.filter(
    (b) =>
      b.status === "scheduled" &&
      new Date(b.bookingDate) >= new Date(new Date().toDateString())
  );
  const myUpcomingPending = bookings.filter(
    (b) =>
      b.status === "pending" &&
      new Date(b.bookingDate) >= new Date(new Date().toDateString())
  );
  const past = bookings.filter(
    (b) =>
      b.status !== "cancelled" &&
      b.status !== "declined" &&
      new Date(b.bookingDate) < new Date(new Date().toDateString())
  );
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const declined = bookings.filter((b) => b.status === "declined");

  const formInput =
    "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
  const btnPrimary =
    "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
  const btnSecondary =
    "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition";

  const tourSteps: GuidedTourStep[] = [
    {
      id: "create",
      title: t("dashboard.bookingsTourCreateTitle"),
      description: t("dashboard.bookingsTourCreateDesc"),
      selector: '[data-tour="bookings-create"]',
    },
    {
      id: "pending",
      title: t("dashboard.bookingsTourPendingTitle"),
      description: t("dashboard.bookingsTourPendingDesc"),
      selector: '[data-tour="bookings-pending"]',
    },
    {
      id: "upcoming",
      title: t("dashboard.bookingsTourUpcomingTitle"),
      description: t("dashboard.bookingsTourUpcomingDesc"),
      selector: '[data-tour="bookings-upcoming"]',
    },
  ];

  return (
    <div className="space-y-8">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
          {isStudent ? t("dashboard.bookingsTitleStudent") : t("dashboard.bookingsTitleStaff")}
        </h1>
        {isStudent && horses.length > 0 && (
          <button onClick={() => setShowCreate(true)} className={btnPrimary} data-tour="bookings-create">
            {t("dashboard.bookingsRequestLesson")}
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : (
        <>
          {isTrainerOrOwner && pending.length > 0 && (
            <div className="border border-black/20 p-6" data-tour="bookings-pending">
              <h2 className="font-serif text-lg text-black mb-2">
                {t("dashboard.bookingsPendingTitle")}
              </h2>
              <p className="text-black/50 text-sm mb-4">
                {t("dashboard.bookingsPendingLead")}
              </p>
              <div className="space-y-3">
                {pending.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-black/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <HorseAvatar
                        photoUrl={b.horse?.photoUrl}
                        name={b.horse?.name ?? "—"}
                        size="sm"
                      />
                      <div>
                        <span className="font-medium text-black">
                          {b.horse?.name ?? "—"}
                        </span>
                        <span className="text-black/50 text-sm ml-2">
                          {formatDate(b.bookingDate)} • {formatTime(b.startTime)}–{formatTime(b.endTime)}
                        </span>
                        {b.rider && (
                          <span className="text-black/40 text-xs block">
                            {b.rider.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(b)}
                        className="px-3 py-1.5 bg-accent text-white text-xs font-medium uppercase tracking-wider hover:opacity-95"
                      >
                        {t("dashboard.bookingsApprove")}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeclineModal(b);
                          setDeclineNotes("");
                        }}
                        className="px-3 py-1.5 border border-black/30 text-black/80 text-xs uppercase tracking-wider hover:border-black/50"
                      >
                        {t("dashboard.bookingsDecline")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(upcoming.length > 0 || (isStudent && myUpcomingPending.length > 0)) && (
            <div className="border border-black/10 p-6" data-tour="bookings-upcoming">
              <h2 className="font-serif text-lg text-black mb-4">
                {isStudent
                  ? t("dashboard.bookingsUpcomingStudent")
                  : t("dashboard.bookingsUpcomingStaff")}
              </h2>
              <div className="space-y-3">
                {(isStudent ? [...myUpcomingPending, ...upcoming] : upcoming).map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-black/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <HorseAvatar
                        photoUrl={b.horse?.photoUrl}
                        name={b.horse?.name ?? "—"}
                        size="sm"
                      />
                      <div>
                        <span className="font-medium text-black">
                          {b.horse?.name ?? "—"}
                        </span>
                        <span className="text-black/50 text-sm ml-2">
                          {formatDate(b.bookingDate)} • {formatTime(b.startTime)}–{formatTime(b.endTime)}
                        </span>
                        {b.status === "pending" && (
                          <span className="text-black/60 text-xs block">
                            {t("dashboard.bookingsPendingApproval")}
                          </span>
                        )}
                        {b.trainer?.fullName && (
                          <span className="text-black/40 text-xs block">
                            {t("dashboard.bookingsTrainerLine", {
                              name: b.trainer.fullName,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    {isStudent && b.status === "scheduled" && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="text-black/60 hover:text-black text-xs uppercase tracking-wider"
                      >
                        {t("dashboard.bookingsCancel")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isStudent && declined.length > 0 && (
            <div className="border border-black/10 p-6">
              <h2 className="font-serif text-lg text-black mb-4">
                {t("dashboard.bookingsDeclinedTitle")}
              </h2>
              <div className="space-y-3">
                {declined.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between border border-black/10 px-4 py-3 opacity-75"
                  >
                    <div className="flex items-center gap-4">
                      <HorseAvatar
                        photoUrl={b.horse?.photoUrl}
                        name={b.horse?.name ?? "—"}
                        size="sm"
                      />
                      <div>
                        <span className="font-medium text-black">
                          {b.horse?.name ?? "—"}
                        </span>
                        <span className="text-black/50 text-sm ml-2">
                          {formatDate(b.bookingDate)} • {formatTime(b.startTime)}–{formatTime(b.endTime)}
                        </span>
                        {b.declinedNotes && (
                          <span className="text-black/60 text-xs block mt-1">
                            {t("dashboard.bookingsReasonLine", {
                              reason: b.declinedNotes,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-black/50 text-xs uppercase">
                      {t("dashboard.bookingsDeclinedBadge")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="border border-black/10 p-6">
              <h2 className="font-serif text-lg text-black mb-4">
                {t("dashboard.bookingsPastSessions")}
              </h2>
              <div className="space-y-3">
                {past.slice(0, 10).map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-black/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <HorseAvatar
                        photoUrl={b.horse?.photoUrl}
                        name={b.horse?.name ?? "—"}
                        size="sm"
                      />
                      <div>
                        <span className="font-medium text-black">
                          {b.horse?.name ?? "—"}
                        </span>
                        <span className="text-black/50 text-sm ml-2">
                          {formatDate(b.bookingDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length === 0 && past.length === 0 && cancelled.length === 0 && declined.length === 0 && pending.length === 0 && (
            <div className="border border-black/10 p-8 text-center">
              <p className="text-black/60">
                {isStudent
                  ? t("dashboard.bookingsEmptyStudent")
                  : t("dashboard.bookingsEmptyStaff")}
              </p>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto sm:items-center"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-base border border-black/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-black mb-4">
              {t("dashboard.bookingsModalTitle")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                  {t("dashboard.bookingsLabelHorse")}
                </label>
                <select
                  value={createForm.horseId}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, horseId: e.target.value }))
                  }
                  className={formInput}
                >
                  <option value="">{t("dashboard.bookingsSelectHorse")}</option>
                  {horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                  {t("dashboard.bookingsLabelDate")}
                </label>
                <input
                  type="date"
                  value={createForm.bookingDate}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, bookingDate: e.target.value }))
                  }
                  className={formInput}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                    {t("dashboard.bookingsLabelStart")}
                  </label>
                  <input
                    type="time"
                    value={createForm.startTime}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                    className={formInput}
                  />
                </div>
                <div>
                  <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                    {t("dashboard.bookingsLabelEnd")}
                  </label>
                  <input
                    type="time"
                    value={createForm.endTime}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                    className={formInput}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                  {t("dashboard.bookingsLabelNotes")}
                </label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={2}
                  className={`${formInput} resize-none`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className={`flex-1 ${btnSecondary}`}
              >
                {t("dashboard.bookingsCancel")}
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading}
                className={`flex-1 ${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {createLoading ? (
                  <>
                    <LoadingSpinner size={16} className="text-black" />
                    {t("dashboard.bookingsRequesting")}
                  </>
                ) : (
                  t("dashboard.bookingsRequest")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeclineModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto sm:items-center"
          onClick={() => setShowDeclineModal(null)}
        >
          <div
            className="bg-base border border-black/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-black mb-2">
              {t("dashboard.bookingsDeclineModalTitle")}
            </h2>
            <p className="text-black/60 text-sm mb-4">
              {showDeclineModal.horse?.name} • {formatDate(showDeclineModal.bookingDate)} • {formatTime(showDeclineModal.startTime)}
            </p>
            <div className="mb-4">
              <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                {t("dashboard.bookingsDeclineReasonLabel")}
              </label>
              <textarea
                value={declineNotes}
                onChange={(e) => setDeclineNotes(e.target.value)}
                placeholder={t("dashboard.bookingsDeclinePlaceholder")}
                rows={3}
                className={`${formInput} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(null)}
                className={`flex-1 ${btnSecondary}`}
              >
                {t("dashboard.bookingsCancel")}
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2.5 border border-red-500/50 text-red-400 text-sm uppercase tracking-wider hover:border-red-500/80"
              >
                {t("dashboard.bookingsDecline")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
