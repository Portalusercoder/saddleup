"use client";

import { HorseAvatar } from "@/components/HorseAvatar";

export type BookingCardData = {
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
};

type BookingCardProps = {
  booking: BookingCardData;
  formatDate: (d: string) => string;
  formatTime: (t: string) => string;
  statusLabel?: string;
  trainerLine?: string;
  pendingApprovalLabel?: string;
  viewDetailsLabel: string;
  onViewDetails: () => void;
  actions?: React.ReactNode;
};

export default function BookingCard({
  booking,
  formatDate,
  formatTime,
  statusLabel,
  trainerLine,
  pendingApprovalLabel,
  viewDetailsLabel,
  onViewDetails,
  actions,
}: BookingCardProps) {
  const durationMins = (() => {
    const [sh, sm] = booking.startTime.split(":").map(Number);
    const [eh, em] = booking.endTime.split(":").map(Number);
    if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;
    return eh * 60 + em - (sh * 60 + sm);
  })();

  return (
    <article className="card border border-black/10 px-4 py-3 rounded-control dark:border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-4 min-w-0">
          <HorseAvatar
            photoUrl={booking.horse?.photoUrl}
            name={booking.horse?.name ?? "—"}
            size="sm"
          />
          <div className="min-w-0">
            <p className="font-medium text-black dark:text-white truncate">
              {booking.horse?.name ?? "—"}
            </p>
            <p className="text-black/55 text-sm dark:text-white/55">
              {formatDate(booking.bookingDate)} · {formatTime(booking.startTime)}–
              {formatTime(booking.endTime)}
              {durationMins != null && durationMins > 0 ? ` · ${durationMins} min` : ""}
            </p>
            {booking.rider ? (
              <p className="text-black/45 text-xs mt-1 dark:text-white/45">
                {booking.rider.name}
              </p>
            ) : null}
            {trainerLine ? (
              <p className="text-black/45 text-xs mt-0.5 dark:text-white/45">{trainerLine}</p>
            ) : null}
            {booking.status === "pending" && pendingApprovalLabel ? (
              <p className="text-amber-700 text-xs mt-1 dark:text-amber-400">
                {pendingApprovalLabel}
              </p>
            ) : null}
            {statusLabel ? (
              <span className="inline-block mt-2 text-[0.65rem] uppercase tracking-wider px-2 py-0.5 border border-black/15 text-black/55 dark:border-white/20 dark:text-white/55">
                {statusLabel}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onViewDetails}
            className="px-3 py-1.5 border border-black/15 text-black text-xs uppercase tracking-wider hover:bg-black/[0.04] dark:border-white/20 dark:text-white dark:hover:bg-white/5"
          >
            {viewDetailsLabel}
          </button>
          {actions}
        </div>
      </div>
    </article>
  );
}
