"use client";

import { useState } from "react";

export default function AddMemberById({ onSuccess }: { onSuccess?: () => void }) {
  const [inviteCode, setInviteCode] = useState("");
  const [memberRole, setMemberRole] = useState<"student" | "trainer" | "guardian">("student");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/members/add-by-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
          memberRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errText = data.error || "Failed";
      setMessage({
        type: "error",
        text: errText.includes("already in your stable")
            ? "They're already in your stable. Check Riders or Trainers."
            : errText,
      });
        return;
      }
      const roleLabel = memberRole === "student" ? "Student" : memberRole === "guardian" ? "Guardian" : "Trainer";
      const location = memberRole === "student" ? "Riders" : memberRole === "guardian" ? "Parent Portal" : "Trainers";
      setMessage({
        type: "success",
        text: `${roleLabel} added. They appear in ${location}.`,
      });
      setInviteCode("");
      onSuccess?.();
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const formInput =
    "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
  const labelClass = "block text-xs uppercase tracking-widest text-black/50 mb-2";

  return (
    <div className="border border-black/10 p-6">
      <h2 className="font-serif text-lg text-black mb-2">Add member by personal ID</h2>
      <p className="text-black/60 text-sm mb-4">
        If the join code didn&apos;t work, ask the person for their personal ID. They can get it at{" "}
        <a href="/get-my-id" className="text-black hover:underline">/get-my-id</a> after signing up.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Personal ID</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
            placeholder="ABC12XYZ"
            className={formInput}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <select
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value as "student" | "trainer" | "guardian")}
            className={formInput}
          >
            <option value="student">Student</option>
            <option value="trainer">Trainer</option>
            <option value="guardian">Guardian (Parent)</option>
          </select>
        </div>
        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-black/80" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add member"}
        </button>
      </form>
    </div>
  );
}
