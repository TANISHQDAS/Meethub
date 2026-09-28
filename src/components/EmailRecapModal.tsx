"use client";

import { useState } from "react";
import { X, Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Meeting } from "@/types";

interface EmailRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
}

export default function EmailRecapModal({
  isOpen,
  onClose,
  meeting,
}: EmailRecapModalProps) {
  const [recipient, setRecipient] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/email-recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient,
          meetingTitle: meeting.title,
          summary: meeting.summary,
          actionItems: meeting.actionItems,
          sentimentScore: meeting.sentimentScore,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch email");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || "Failed to send email recap. Check your GMAIL_USER in .env.local.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative shadow-2xl border border-slate-700/60">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Send Meeting Digest</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-lg">Recap Sent Successfully!</h4>
            <p className="text-xs text-slate-400">
              Meeting summary and action items were delivered to <strong>{recipient}</strong>.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="mt-4 space-y-4">
            <p className="text-xs text-slate-400">
              Email the executive summary, key decisions, and assigned action items directly to meeting participants via Gmail.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                placeholder="colleague@company.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Digest Preview:</div>
              <div>• {meeting.summary.keyPoints.length} Key takeaways</div>
              <div>• {meeting.actionItems.length} Assigned action items</div>
              <div>• Sentiment Score: {meeting.sentimentScore}% Positive</div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? "Sending..." : "Send Digest"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
