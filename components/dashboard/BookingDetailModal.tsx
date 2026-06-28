"use client";

import Link from "next/link";
import { HorseAvatar } from "@/components/HorseAvatar";
import type { BookingCardData } from "@/components/dashboard/BookingCard";

type BookingDetailModalProps = {
  booking: BookingCardData;
  formatDate: (d: string) => string;
  formatTime: (t: string) => string;
  onClose: () => void;
  labels: {
    title: string;
    close: string;
    horse: string;
    rider: string;
    trainer: string;
    date: string;
    time: string;
    status: string;
    notes: string;
    declinedReason: string;
    logNotes: string;
    none: string;
  };
  statusText: string;
};

export default function BookingDetailModal({
  booking,
  formatDate,
  formatTime,
  onClose,
  labels,
  statusText,
}: BookingDetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-detail-title"
    >
      <div
        className="bg-base border border-black/10 p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto dark:border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <HorseAvatar
              photoUrl={booking.horse?.photoUrl}
              name={booking.horse?.name ?? "—"}
              size="md"
            />
            <div>
              <h2 id="booking-detail-title" className="font-serif text-xl text-black dark:text-white">
                {labels.title}
              </h2>
              <p className="text-black/60 text-sm dark:text-white/60">
                {booking.horse?.name ?? labels.none}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-black/50 hover:text-black text-sm uppercase tracking-wider dark:text-white/50 dark:hover:text-white"
          >
            {labels.close}
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-black/5 pb-2 dark:border-white/10">
            <dt className="text-black/50 dark:text-white/50">{labels.date}</dt>
            <dd className="text-black dark:text-white">{formatDate(booking.bookingDate)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-black/5 pb-2 dark:border-white/10">
            <dt className="text-black/50 dark:text-white/50">{labels.time}</dt>
            <dd className="text-black dark:text-white">
              {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-black/5 pb-2 dark:border-white/10">
            <dt className="text-black/50 dark:text-white/50">{labels.status}</dt>
            <dd className="text-black capitalize dark:text-white">{statusText}</dd>
          </div>
          {booking.rider ? (
            <div className="flex justify-between gap-4 border-b border-black/5 pb-2 dark:border-white/10">
              <dt className="text-black/50 dark:text-white/50">{labels.rider}</dt>
              <dd className="text-black dark:text-white">{booking.rider.name}</dd>
            </div>
          ) : null}
          {booking.trainer?.fullName ? (
            <div className="flex justify-between gap-4 border-b border-black/5 pb-2 dark:border-white/10">
              <dt className="text-black/50 dark:text-white/50">{labels.trainer}</dt>
              <dd className="text-black dark:text-white">{booking.trainer.fullName}</dd>
            </div>
          ) : null}
          {booking.notes ? (
            <div>
              <dt className="text-black/50 dark:text-white/50 mb-1">{labels.notes}</dt>
              <dd className="text-black/80 whitespace-pre-wrap dark:text-white/80">{booking.notes}</dd>
            </div>
          ) : null}
          {booking.declinedNotes ? (
            <div>
              <dt className="text-black/50 dark:text-white/50 mb-1">{labels.declinedReason}</dt>
              <dd className="text-black/80 whitespace-pre-wrap dark:text-white/80">
                {booking.declinedNotes}
              </dd>
            </div>
          ) : null}
        </dl>

        {booking.horse?.id ? (
          <Link
            href={`/dashboard/horses/${booking.horse.id}`}
            className="mt-6 inline-flex w-full items-center justify-center px-4 py-2.5 bg-accent text-white text-sm font-medium uppercase tracking-wider hover:opacity-95 transition"
          >
            {labels.logNotes}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
