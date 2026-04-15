"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { updateBatch } from "@/server/admin/batch-actions";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

type ContentField = {
  key: string;
  label: string;
  description: string;
};

const contentFields: ContentField[] = [
  {
    key: "roadmap",
    label: "Roadmap",
    description:
      "The learning roadmap and curriculum overview for this batch.",
  },
  {
    key: "rewardPool",
    label: "Rewards & Hackathons",
    description: "Prize details, reward distribution, hackathon themes, rules, and schedule.",
  },
];

type BatchContentData = {
  id: string;
  title: string;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  batchNumber: number;
  totalSeats: number;
  questionSetId: string | null;
  description: string | null;
  roadmap: string | null;
  process: string | null;
  projects: string | null;
  leaderboard: string | null;
  rewardPool: string | null;
};

type Props = {
  batch: BatchContentData;
};

export function BatchContentEditor({ batch }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const htmlRef = useRef<Record<string, string>>({});

  async function handleSave(field: string) {
    const html = htmlRef.current[field] ?? "";

    setSaving(field);
    setError(null);
    setSaved(null);

    const fd = new FormData();
    fd.set("title", batch.title);
    fd.set("status", batch.status);
    if (batch.startsAt) {
      fd.set("startsAt", batch.startsAt.toISOString().split("T")[0]!);
    }
    if (batch.endsAt) {
      fd.set("endsAt", batch.endsAt.toISOString().split("T")[0]!);
    }
    fd.set("batchNumber", String(batch.batchNumber));
    fd.set("totalSeats", String(batch.totalSeats));
    fd.set("questionSetId", batch.questionSetId ?? "");
    fd.set("description", batch.description ?? "");

    for (const cf of contentFields) {
      if (cf.key === field) {
        fd.set(cf.key, html);
      } else {
        fd.set(
          cf.key,
          (batch as Record<string, unknown>)[cf.key] as string ?? "",
        );
      }
    }

    const result = await updateBatch(batch.id, fd);
    setSaving(null);

    if ("error" in result) {
      setError(result.error ?? "Failed to save");
    } else {
      setSaved(field);
      router.refresh();
      setTimeout(() => setSaved(null), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {contentFields.map((field) => {
        const value =
          ((batch as Record<string, unknown>)[field.key] as string) ?? "";

        if (!(field.key in htmlRef.current)) {
          htmlRef.current[field.key] = value;
        }

        return (
          <div
            key={field.key}
            className="rounded-lg border border-border p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">{field.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {saved === field.key && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Saved
                  </span>
                )}
                <button
                  type="button"
                  disabled={saving === field.key}
                  onClick={() => handleSave(field.key)}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving === field.key ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
            <RichTextEditor
              content={value}
              onChange={(html) => {
                htmlRef.current[field.key] = html;
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
