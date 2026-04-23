"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { createBatch, updateBatch } from "@/server/admin/batch-actions";
import { IconPicker } from "./icon-picker";

type BatchData = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  batchNumber: number;
  totalSeats: number;
  questionSetId: string | null;
  testOpensAt: Date | null;
  cardIconKeys: string | null;
  roadmap: string | null;
  process: string | null;
  projects: string | null;
  leaderboard: string | null;
  rewardPool: string | null;
  hackathon: string | null;
};

type BatchFormProps = {
  batch?: BatchData;
  suggestedBatchNumber?: number;
};

function toDateInputValue(d: Date | null | undefined) {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

function toDateTimeInputValue(d: Date | null | undefined) {
  if (!d) return "";
  return d.toISOString().slice(0, 16);
}

export function BatchForm({ batch, suggestedBatchNumber }: BatchFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(batch?.status ?? "confirmed");
  const [iconKeys, setIconKeys] = useState<string[]>(() => {
    if (!batch?.cardIconKeys) return [];
    try {
      const v = JSON.parse(batch.cardIconKeys);
      return Array.isArray(v) ? v.filter((x: unknown): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  });
  const isEdit = !!batch;

  const isConfirmed = status === "confirmed";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const fd = new FormData(e.currentTarget);

    // When editing, carry over content fields so they don't get nulled out
    if (isEdit) {
      const contentFields = [
        "roadmap",
        "process",
        "projects",
        "leaderboard",
        "rewardPool",
        "hackathon",
      ] as const;
      for (const field of contentFields) {
        if (!fd.has(field)) {
          fd.set(field, batch[field] ?? "");
        }
      }
    }

    const result = isEdit
      ? await updateBatch(batch!.id, fd)
      : await createBatch(fd);

    setSaving(false);

    if ("error" in result) {
      setError(result.error ?? "Something went wrong");
      return;
    }

    if (!isEdit && "id" in result) {
      router.push(`/batches/${result.id}`);
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1.5";
  const selectCls =
    "w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            name="title"
            required
            defaultValue={batch?.title}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <div className="relative">
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectCls}
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending (interest only)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={batch?.description ?? ""}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Starts At {isConfirmed ? "*" : ""}
          </label>
          <input
            name="startsAt"
            type="date"
            required={isConfirmed}
            defaultValue={toDateInputValue(batch?.startsAt)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Ends At</label>
          <input
            name="endsAt"
            type="date"
            defaultValue={toDateInputValue(batch?.endsAt)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Batch Number</label>
          <input
            name="batchNumber"
            type="number"
            min={1}
            defaultValue={batch?.batchNumber ?? suggestedBatchNumber ?? 1}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Total Seats</label>
          <input
            name="totalSeats"
            type="number"
            min={1}
            defaultValue={batch?.totalSeats ?? 500}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Question Set ID</label>
          <input
            name="questionSetId"
            defaultValue={batch?.questionSetId ?? ""}
            placeholder="e.g. LR-2026-01"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Test Opens At</label>
          <input
            name="testOpensAt"
            type="datetime-local"
            defaultValue={toDateTimeInputValue(batch?.testOpensAt)}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave blank to keep test closed. Set to a past time to open immediately, or a future time to schedule.
          </p>
        </div>
      </div>

      {/* Icon picker */}
      <div>
        <input type="hidden" name="cardIconKeys" value={JSON.stringify(iconKeys)} />
        <IconPicker value={iconKeys} onChange={setIconKeys} />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : isEdit ? "Update Batch" : "Create Batch"}
        </button>
        {saved && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
