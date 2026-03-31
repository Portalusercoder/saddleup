"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import TableSkeleton from "@/components/ui/TableSkeleton";

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
    if (!sendSubject.trim() || !sendBody.trim()) return;
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
        setSendMessage(`Sent to ${data.sent} recipient${data.sent !== 1 ? "s" : ""}`);
        setSendSubject("");
        setSendBody("");
        fetchData();
      } else {
        setSendStatus("error");
        setSendMessage(data.error || "Could not send");
      }
    } catch {
      setSendStatus("error");
      setSendMessage("Something went wrong");
    }
  };

  if (loading || !profile || profile.role !== "owner") {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
          Notices
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
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
          Notice emails
        </h1>
        <p className="text-black/60 mt-2 text-sm">
          Send holiday closures, schedule changes, or other updates to students (riders), trainers, and guardians. Owner only.
        </p>
      </div>

      {loadingData ? (
        <TableSkeleton rows={6} cols={4} />
      ) : (
        <>
          {/* Audience sections */}
          <section>
            <h2 className="font-serif text-xl text-black mb-4">Who receives notices</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-black/10 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToStudents}
                    onChange={(e) => setSendToStudents(e.target.checked)}
                    className="w-4 h-4 rounded border-black/30 bg-base text-black focus:ring-black/50"
                  />
                  <span className="font-medium text-black">Students (riders)</span>
                </label>
                <p className="mt-2 text-black/50 text-sm">
                  {recipients?.students.count ?? 0} rider{recipients?.students.count !== 1 ? "s" : ""} with email
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
                  <span className="font-medium text-black">Trainers</span>
                </label>
                <p className="mt-2 text-black/50 text-sm">
                  {recipients?.trainers.count ?? 0} trainer{recipients?.trainers.count !== 1 ? "s" : ""} with email
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
                  <span className="font-medium text-black">Guardians</span>
                </label>
                <p className="mt-2 text-black/50 text-sm">
                  {recipients?.guardians.count ?? 0} guardian{recipients?.guardians.count !== 1 ? "s" : ""} with email
                </p>
              </div>
            </div>
          </section>

          {/* Send notice */}
          <section>
            <h2 className="font-serif text-xl text-black mb-4">Send a notice</h2>
            <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm text-black/60 mb-1">Subject</label>
                <input
                  type="text"
                  value={sendSubject}
                  onChange={(e) => setSendSubject(e.target.value)}
                  placeholder="e.g. Stable closed Dec 24–26"
                  required
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/20 text-black placeholder:text-black/40 text-sm focus:outline-none focus:border-black/40"
                />
              </div>
              <div>
                <label className="block text-sm text-black/60 mb-1">Content (HTML)</label>
                <textarea
                  value={sendBody}
                  onChange={(e) => setSendBody(e.target.value)}
                  placeholder="<p>Hello, we'll be closed over the holidays...</p>"
                  required
                  rows={8}
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/20 text-black placeholder:text-black/40 text-sm focus:outline-none focus:border-black/40 font-mono"
                />
                <p className="text-black/40 text-xs mt-1">
                  Use HTML. Example: &lt;p&gt;Hello!&lt;/p&gt;
                </p>
              </div>
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
                  ? "Sending..."
                  : `Send to ${uniqueCount} recipient${uniqueCount !== 1 ? "s" : ""}`}
              </button>
            </form>
            {sendMessage && (
              <p className={`text-sm mt-4 ${sendStatus === "success" ? "text-black/80" : "text-red-400"}`}>
                {sendMessage}
              </p>
            )}
            {hasOverlap && (
              <p className="text-black/40 text-xs mt-1">
                Duplicate emails across groups are sent only once.
              </p>
            )}
          </section>

          {/* Sent notices history */}
          <section>
            <h2 className="font-serif text-xl text-black mb-4">Sent notices</h2>
            {campaigns.length === 0 ? (
              <p className="text-black/50 text-sm">No notices sent yet.</p>
            ) : (
              <div className="border border-black/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/10">
                      <th className="text-left px-4 py-3 text-black/60 font-medium">Subject</th>
                      <th className="text-left px-4 py-3 text-black/60 font-medium">Recipients</th>
                      <th className="text-left px-4 py-3 text-black/60 font-medium">Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-black/5">
                        <td className="px-4 py-3 text-black">{c.subject}</td>
                        <td className="px-4 py-3 text-black/60">{c.recipient_count}</td>
                        <td className="px-4 py-3 text-black/50 text-xs">
                          {new Date(c.sent_at).toLocaleString()}
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
    </div>
  );
}
