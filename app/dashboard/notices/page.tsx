"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import TableSkeleton from "@/components/ui/TableSkeleton";
import SimpleRichTextEditor from "@/components/ui/SimpleRichTextEditor";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { useLanguage } from "@/components/providers/LanguageProvider";

type Recipients = {
  students: { count: number; emails: string[] };
  trainers: { count: number; emails: string[] };
  guardians: { count: number; emails: string[] };
};

type Campaign = {
  id: string;
  subject: string;
  recipient_count: number;
  sent_at: string;
};

export default function NoticesPage() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";
  const [recipients, setRecipients] = useState<Recipients | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sendToStudents, setSendToStudents] = useState(true);
  const [sendToTrainers, setSendToTrainers] = useState(true);
  const [sendToGuardians, setSendToGuardians] = useState(true);
  const [sendSubject, setSendSubject] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sendMessage, setSendMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [resendLoadingId, setResendLoadingId] = useState<string | null>(null);
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_notices_v1",
    !loadingData && Boolean(profile) && profile?.role === "owner"
  );

  const tourSteps: GuidedTourStep[] = [
    {
      id: "audience",
      title: t("dashboard.noticeEmailsTourAudienceTitle"),
      description: t("dashboard.noticeEmailsTourAudienceDesc"),
      selector: '[data-tour="notices-audience"]',
    },
    {
      id: "composer",
      title: t("dashboard.noticeEmailsTourComposeTitle"),
      description: t("dashboard.noticeEmailsTourComposeDesc"),
      selector: '[data-tour="notices-compose"]',
    },
    {
      id: "history",
      title: t("dashboard.noticeEmailsTourHistoryTitle"),
      description: t("dashboard.noticeEmailsTourHistoryDesc"),
      selector: '[data-tour="notices-history"]',
    },
  ];

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "owner") {
      router.replace("/dashboard");
      return;
    }
    fetchData();
  }, [profile, router]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [recRes, campRes] = await Promise.all([
        fetch("/api/notices/recipients"),
        fetch("/api/newsletter/campaigns"),
      ]);
      if (recRes.ok) {
        const data = await recRes.json();
        setRecipients(data);
      }
      if (campRes.ok) {
        const data = await campRes.json();
        setCampaigns(data.campaigns || []);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendSubject.trim() || !sendBody.trim() || sendBody === "<br>") return;
    setSendStatus("loading");
    setSendMessage("");
    try {
      const res = await fetch("/api/notices/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: sendSubject.trim(),
          bodyHtml: sendBody.trim(),
          sendToStudents,
          sendToTrainers,
          sendToGuardians,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendStatus("success");
        setSendMessage(
          data.sent === 1
            ? t("dashboard.noticeEmailsSentToOne")
            : t("dashboard.noticeEmailsSentToMany", {
                count: String(data.sent ?? 0),
              })
        );
        setSendSubject("");
        setSendBody("");
        fetchData();
      } else {
        setSendStatus("error");
        setSendMessage(data.error || t("dashboard.noticeEmailsSendFailed"));
      }
    } catch {
      setSendStatus("error");
      setSendMessage(t("dashboard.noticeEmailsSomethingWrong"));
    }
  };

  const handleResend = async (campaignId: string) => {
    setResendLoadingId(campaignId);
    setSendMessage("");
    try {
      const res = await fetch("/api/notices/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          sendToStudents,
          sendToTrainers,
          sendToGuardians,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendStatus("success");
        setSendMessage(
          data.sent === 1
            ? t("dashboard.noticeEmailsSentToOne")
            : t("dashboard.noticeEmailsSentToMany", { count: String(data.sent ?? 0) })
        );
        fetchData();
      } else {
        setSendStatus("error");
        setSendMessage(data.error || t("dashboard.noticeEmailsSendFailed"));
      }
    } catch {
      setSendStatus("error");
      setSendMessage(t("dashboard.noticeEmailsSomethingWrong"));
    } finally {
      setResendLoadingId(null);
    }
  };

  if (loading || !profile || profile.role !== "owner") {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
          {t("dashboard.noticesTitle")}
        </h1>
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  const selectedEmails = recipients
    ? [
        ...(sendToStudents ? recipients.students.emails : []),
        ...(sendToTrainers ? recipients.trainers.emails : []),
        ...(sendToGuardians ? recipients.guardians.emails : []),
      ]
    : [];
  const uniqueCount = [...new Set(selectedEmails)].length;
  const hasOverlap = selectedEmails.length > uniqueCount;

  return (
    <div className="space-y-10">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
          {t("dashboard.noticeEmailsTitle")}
        </h1>
        <p className="text-black/60 mt-2 text-sm">
          {t("dashboard.noticeEmailsLead")}
        </p>
      </div>

      {loadingData ? (
        <TableSkeleton rows={6} cols={4} />
      ) : (
        <>
          {/* Audience sections */}
          <section data-tour="notices-audience">
            <h2 className="font-serif text-xl text-black mb-4">
              {t("dashboard.noticeEmailsAudienceHeading")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-black/10 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToStudents}
                    onChange={(e) => setSendToStudents(e.target.checked)}
                    className="w-4 h-4 rounded border-black/30 bg-base text-black focus:ring-black/50"
                  />
                  <span className="font-medium text-black">
                    {t("dashboard.noticeEmailsLabelStudents")}
                  </span>
                </label>
                <p className="mt-2 text-black/50 text-sm">
                  {(recipients?.students.count ?? 0) === 1
                    ? t("dashboard.noticeEmailsRidersWithEmailOne")
                    : t("dashboard.noticeEmailsRidersWithEmail", {
                        count: String(recipients?.students.count ?? 0),
                      })}
                </p>
              </div>
              <div className="border border-black/10 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToTrainers}
                    onChange={(e) => setSendToTrainers(e.target.checked)}
                    className="w-4 h-4 rounded border-black/30 bg-base text-black focus:ring-black/50"
                  />
                  <span className="font-medium text-black">
                    {t("dashboard.noticeEmailsLabelTrainers")}
                  </span>
                </label>
                <p className="mt-2 text-black/50 text-sm">
                  {(recipients?.trainers.count ?? 0) === 1
                    ? t("dashboard.noticeEmailsTrainersWithEmailOne")
                    : t("dashboard.noticeEmailsTrainersWithEmail", {
                        count: String(recipients?.trainers.count ?? 0),
                      })}
                </p>
              </div>
              <div className="border border-black/10 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToGuardians}
                    onChange={(e) => setSendToGuardians(e.target.checked)}
                    className="w-4 h-4 rounded border-black/30 bg-base text-black focus:ring-black/50"
                  />
                  <span className="font-medium text-black">
                    {t("dashboard.noticeEmailsLabelGuardians")}
                  </span>
                </label>
                <p className="mt-2 text-black/50 text-sm">
                  {(recipients?.guardians.count ?? 0) === 1
                    ? t("dashboard.noticeEmailsGuardiansWithEmailOne")
                    : t("dashboard.noticeEmailsGuardiansWithEmail", {
                        count: String(recipients?.guardians.count ?? 0),
                      })}
                </p>
              </div>
            </div>
          </section>

          {/* Send notice */}
          <section data-tour="notices-compose">
            <h2 className="font-serif text-xl text-black mb-4">
              {t("dashboard.noticeEmailsSendHeading")}
            </h2>
            <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm text-black/60 mb-1">
                  {t("dashboard.noticeEmailsSubjectLabel")}
                </label>
                <input
                  type="text"
                  value={sendSubject}
                  onChange={(e) => setSendSubject(e.target.value)}
                  placeholder={t("dashboard.noticeEmailsSubjectPlaceholder")}
                  required
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/20 text-black placeholder:text-black/40 text-sm focus:outline-none focus:border-black/40"
                />
              </div>
              <div>
                <label className="block text-sm text-black/60 mb-1">
                  {t("dashboard.noticeEmailsBodyLabel")}
                </label>
                <SimpleRichTextEditor
                  value={sendBody}
                  onChange={setSendBody}
                  placeholder={t("dashboard.noticeEmailsBodyPlaceholder")}
                  ariaLabel={t("dashboard.noticeEmailsBodyLabel")}
                />
                <p className="text-black/40 text-xs mt-1">
                  {t("dashboard.noticeEmailsBodyHintRich")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  disabled={!sendSubject.trim() || !sendBody.trim() || sendBody === "<br>"}
                  className="px-4 py-2.5 border border-black/15 text-black text-sm uppercase tracking-wider hover:bg-black/[0.04] disabled:opacity-50 dark:border-white/20 dark:text-white"
                >
                  {t("dashboard.noticeEmailsPreview")}
                </button>
                <button
                  type="submit"
                  disabled={
                    sendStatus === "loading" ||
                    (!sendToStudents && !sendToTrainers && !sendToGuardians) ||
                    uniqueCount === 0
                  }
                  className="px-6 py-2.5 bg-accent text-white font-medium hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendStatus === "loading"
                    ? t("dashboard.noticeEmailsSending")
                    : uniqueCount === 1
                      ? t("dashboard.noticeEmailsSendToOne")
                      : t("dashboard.noticeEmailsSendToMany", {
                          count: String(uniqueCount),
                        })}
                </button>
              </div>
            </form>
            {sendMessage && (
              <p className={`text-sm mt-4 ${sendStatus === "success" ? "text-black/80" : "text-red-400"}`}>
                {sendMessage}
              </p>
            )}
            {hasOverlap && (
              <p className="text-black/40 text-xs mt-1">
                {t("dashboard.noticeEmailsDuplicateHint")}
              </p>
            )}
          </section>

          {/* Sent notices history */}
          <section data-tour="notices-history">
            <h2 className="font-serif text-xl text-black mb-4">
              {t("dashboard.noticeEmailsHistoryHeading")}
            </h2>
            {campaigns.length === 0 ? (
              <p className="text-black/50 text-sm">
                {t("dashboard.noticeEmailsNoHistory")}
              </p>
            ) : (
              <div className="border border-black/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/10">
                      <th className="text-left px-4 py-3 text-black/60 font-medium">
                        {t("dashboard.noticeEmailsColSubject")}
                      </th>
                      <th className="text-left px-4 py-3 text-black/60 font-medium">
                        {t("dashboard.noticeEmailsColRecipients")}
                      </th>
                      <th className="text-left px-4 py-3 text-black/60 font-medium dark:text-white/60">
                        {t("dashboard.noticeEmailsColSent")}
                      </th>
                      <th className="text-right px-4 py-3 text-black/60 font-medium dark:text-white/60">
                        {t("dashboard.noticeEmailsColActions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-black/5">
                        <td className="px-4 py-3 text-black">{c.subject}</td>
                        <td className="px-4 py-3 text-black/60">{c.recipient_count}</td>
                        <td className="px-4 py-3 text-black/50 text-xs dark:text-white/50">
                          {new Date(c.sent_at).toLocaleString(dateLocale)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleResend(c.id)}
                            disabled={resendLoadingId === c.id}
                            className="text-black/70 hover:text-black text-xs uppercase tracking-wider underline disabled:opacity-50 dark:text-white/70 dark:hover:text-white"
                          >
                            {resendLoadingId === c.id
                              ? t("dashboard.noticeEmailsResending")
                              : t("dashboard.noticeEmailsResend")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {showPreview ? (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPreview(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-base border border-black/10 w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 dark:border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="font-serif text-xl text-black dark:text-white">
                {t("dashboard.noticeEmailsPreviewTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-black/50 text-sm uppercase tracking-wider dark:text-white/50"
              >
                {t("common.close")}
              </button>
            </div>
            <p className="text-xs uppercase tracking-widest text-black/50 mb-1 dark:text-white/50">
              {t("dashboard.noticeEmailsSubjectLabel")}
            </p>
            <p className="font-medium text-black mb-4 dark:text-white">{sendSubject}</p>
            <div
              className="prose prose-sm max-w-none text-black border border-black/10 p-4 dark:text-white dark:border-white/15 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: sendBody }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
