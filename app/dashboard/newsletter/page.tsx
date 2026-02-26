"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";

type Subscriber = {
  id: string;
  email: string;
  full_name: string | null;
  subscribed_at: string;
};

type Campaign = {
  id: string;
  subject: string;
  recipient_count: number;
  sent_at: string;
};

export default function NewsletterPage() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addStatus, setAddStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [addMessage, setAddMessage] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sendMessage, setSendMessage] = useState("");

  const isOwner = profile?.role === "owner";

  useEffect(() => {
    if (!profile) return;
    if (!["owner", "trainer"].includes(profile.role || "")) {
      router.replace("/dashboard");
      return;
    }
    fetchData();
  }, [profile, router]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [subRes, campRes] = await Promise.all([
        fetch("/api/newsletter/subscribers"),
        fetch("/api/newsletter/campaigns"),
      ]);
      if (subRes.ok) {
        const data = await subRes.json();
        setSubscribers(data.subscribers || []);
      }
      if (campRes.ok) {
        const data = await campRes.json();
        setCampaigns(data.campaigns || []);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setAddStatus("loading");
    setAddMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail.trim(), fullName: addName.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddStatus("success");
        setAddMessage(data.message || "Subscriber added");
        setAddEmail("");
        setAddName("");
        fetchData();
      } else {
        setAddStatus("error");
        setAddMessage(data.error || "Could not add subscriber");
      }
    } catch {
      setAddStatus("error");
      setAddMessage("Something went wrong");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendSubject.trim() || !sendBody.trim()) return;
    setSendStatus("loading");
    setSendMessage("");
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: sendSubject.trim(),
          bodyHtml: sendBody.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendStatus("success");
        setSendMessage(`Sent to ${data.sent} subscriber${data.sent !== 1 ? "s" : ""}`);
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

  if (loading || !profile || !["owner", "trainer"].includes(profile.role || "")) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">
          Newsletter
        </h1>
        <p className="text-white/60 mt-2 text-sm">
          Manage subscribers and send newsletters to your stable&apos;s list.
        </p>
      </div>

      {loadingData ? (
        <p className="text-white/50">Loading...</p>
      ) : (
        <>
          {/* Subscribers */}
          <section>
            <h2 className="font-serif text-xl text-white mb-4">Subscribers ({subscribers.length})</h2>
            {isOwner && (
              <form onSubmit={handleAddSubscriber} className="flex flex-wrap gap-3 mb-6">
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="px-4 py-2.5 bg-white/5 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40"
                />
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Name (optional)"
                  className="px-4 py-2.5 bg-white/5 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  disabled={addStatus === "loading"}
                  className="px-4 py-2.5 bg-white text-black font-medium text-sm hover:bg-white/95 transition disabled:opacity-50"
                >
                  {addStatus === "loading" ? "Adding..." : "Add"}
                </button>
              </form>
            )}
            {addMessage && (
              <p className={`text-sm mb-4 ${addStatus === "success" ? "text-white/80" : "text-red-400"}`}>
                {addMessage}
              </p>
            )}
            {subscribers.length === 0 ? (
              <p className="text-white/50 text-sm">
                No subscribers yet. Add subscribers above or share your landing page for signups.
              </p>
            ) : (
              <div className="border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s) => (
                      <tr key={s.id} className="border-b border-white/5">
                        <td className="px-4 py-3 text-white">{s.email}</td>
                        <td className="px-4 py-3 text-white/60">{s.full_name || "—"}</td>
                        <td className="px-4 py-3 text-white/50 text-xs">
                          {new Date(s.subscribed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Send newsletter - owners only */}
          {isOwner && (
            <section>
              <h2 className="font-serif text-xl text-white mb-4">Send newsletter</h2>
              <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Subject</label>
                  <input
                    type="text"
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                    placeholder="Newsletter subject"
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Content (HTML)</label>
                  <textarea
                    value={sendBody}
                    onChange={(e) => setSendBody(e.target.value)}
                    placeholder="<p>Hello! Here's your update...</p>"
                    required
                    rows={8}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40 font-mono"
                  />
                  <p className="text-white/40 text-xs mt-1">
                    Use HTML. Example: &lt;p&gt;Hello!&lt;/p&gt;
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={sendStatus === "loading" || subscribers.length === 0}
                  className="px-6 py-2.5 bg-white text-black font-medium hover:bg-white/95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendStatus === "loading" ? "Sending..." : `Send to ${subscribers.length} subscriber${subscribers.length !== 1 ? "s" : ""}`}
                </button>
              </form>
              {sendMessage && (
                <p className={`text-sm mt-4 ${sendStatus === "success" ? "text-white/80" : "text-red-400"}`}>
                  {sendMessage}
                </p>
              )}
            </section>
          )}

          {/* Campaign history */}
          <section>
            <h2 className="font-serif text-xl text-white mb-4">Sent newsletters</h2>
            {campaigns.length === 0 ? (
              <p className="text-white/50 text-sm">No newsletters sent yet.</p>
            ) : (
              <div className="border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Subject</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Recipients</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-white/5">
                        <td className="px-4 py-3 text-white">{c.subject}</td>
                        <td className="px-4 py-3 text-white/60">{c.recipient_count}</td>
                        <td className="px-4 py-3 text-white/50 text-xs">
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
