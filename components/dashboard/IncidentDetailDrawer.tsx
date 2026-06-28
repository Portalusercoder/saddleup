"use client";

import Link from "next/link";

export type IncidentDetail = {
  id: string;
  incidentDate: string;
  description: string;
  witnesses?: string | null;
  location?: string | null;
  severity?: string | null;
  followUpNotes?: string | null;
  riderName?: string | null;
  horse: { id: string; name: string } | null;
};

type IncidentDetailDrawerProps = {
  report: IncidentDetail;
  formatDate: (d: string) => string;
  severityLabel: (s: string) => string;
  labels: {
    title: string;
    close: string;
    date: string;
    horse: string;
    rider: string;
    location: string;
    severity: string;
    description: string;
    witnesses: string;
    followUp: string;
    edit: string;
    none: string;
  };
  onClose: () => void;
  onEdit?: () => void;
};

export default function IncidentDetailDrawer({
  report,
  formatDate,
  severityLabel,
  labels,
  onClose,
  onEdit,
}: IncidentDetailDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        className="drawer-backdrop absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label={labels.close}
      />
      <aside className="drawer-panel relative w-full max-w-md bg-base border-l border-black/10 h-full overflow-y-auto p-6 dark:border-white/15">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="font-serif text-xl text-black dark:text-white">{labels.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-black/50 hover:text-black text-sm uppercase tracking-wider dark:text-white/50"
          >
            {labels.close}
          </button>
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">
              {labels.date}
            </dt>
            <dd className="text-black mt-1 dark:text-white">{formatDate(report.incidentDate)}</dd>
          </div>
          {report.horse ? (
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">
                {labels.horse}
              </dt>
              <dd className="mt-1">
                <Link
                  href={`/dashboard/horses/${report.horse.id}`}
                  className="text-black hover:underline dark:text-white"
                >
                  {report.horse.name}
                </Link>
              </dd>
            </div>
          ) : null}
          {report.riderName ? (
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">
                {labels.rider}
              </dt>
              <dd className="text-black mt-1 dark:text-white">{report.riderName}</dd>
            </div>
          ) : null}
          {report.severity ? (
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">
                {labels.severity}
              </dt>
              <dd className="text-black mt-1 capitalize dark:text-white">
                {severityLabel(report.severity)}
              </dd>
            </div>
          ) : null}
          {report.location ? (
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">
                {labels.location}
              </dt>
              <dd className="text-black mt-1 dark:text-white">{report.location}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">
              {labels.description}
            </dt>
            <dd className="text-black/85 mt-1 whitespace-pre-wrap dark:text-white/85">
              {report.description}
            </dd>
          </div>
          {report.witnesses ? (
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">
                {labels.witnesses}
              </dt>
              <dd className="text-black/85 mt-1 dark:text-white/85">{report.witnesses}</dd>
            </div>
          ) : null}
          {report.followUpNotes ? (
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">
                {labels.followUp}
              </dt>
              <dd className="text-black/85 mt-1 whitespace-pre-wrap dark:text-white/85">
                {report.followUpNotes}
              </dd>
            </div>
          ) : null}
        </dl>

        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="mt-8 w-full px-4 py-2.5 border border-black/15 text-black text-sm uppercase tracking-wider hover:bg-black/[0.04] dark:border-white/20 dark:text-white"
          >
            {labels.edit}
          </button>
        ) : null}
      </aside>
    </div>
  );
}
