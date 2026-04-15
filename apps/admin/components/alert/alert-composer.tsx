"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { sendAlert } from "@/server/admin/alert-actions";

type Batch = {
  id: string;
  title: string;
  batchNumber: number;
};

type Props = {
  batches: Batch[];
};

export function AlertComposer({ batches }: Props) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    ok?: boolean;
    error?: string;
    recipientCount?: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setResult(null);

    const fd = new FormData(e.currentTarget);

    const res = await sendAlert({
      batchId: fd.get("batchId") as string,
      subject: fd.get("subject") as string,
      message: fd.get("message") as string,
      channel: (fd.get("channel") as "email" | "in-app") ?? "in-app",
    });

    setResult(res);
    setSending(false);
  }

  const inputCls =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "block text-sm font-medium mb-1";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {result?.error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {result.error}
        </div>
      )}
      {result?.ok && (
        <div className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Alert queued for {result.recipientCount} recipient
          {result.recipientCount !== 1 ? "s" : ""}
        </div>
      )}

      <div>
        <label className={labelCls}>Target Batch *</label>
        <select name="batchId" required className={inputCls}>
          <option value="">Select a batch...</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} (#{b.batchNumber})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Channel</label>
        <select name="channel" className={inputCls}>
          <option value="in-app">In-App</option>
          <option value="email">Email</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Subject *</label>
        <input
          name="subject"
          required
          maxLength={200}
          placeholder="e.g. Test date announced for Batch 3"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Message *</label>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={5000}
          placeholder="Write your alert message..."
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Send className="size-4" />
        {sending ? "Sending..." : "Send Alert"}
      </button>
    </form>
  );
}
