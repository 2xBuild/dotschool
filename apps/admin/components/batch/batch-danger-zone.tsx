"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteBatch } from "@/server/admin/batch-actions";

type Props = {
  batchId: string;
  batchTitle: string;
};

export function BatchDangerZone({ batchId, batchTitle }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteBatch(batchId);
    if ("error" in result) {
      setDeleting(false);
      alert(result.error);
    } else {
      router.push("/batches");
    }
  }

  return (
    <div className="rounded-lg border border-destructive/30 p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
        <p className="text-xs text-muted-foreground">
          Irreversible actions. Proceed with caution.
        </p>
      </div>

      <div className="rounded-md border border-destructive/20 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete this batch</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete &ldquo;{batchTitle}&rdquo; and all associated
              enrollments, modules, resources, and volunteers. This action
              cannot be undone.
            </p>
          </div>
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3" />
              Delete Batch
            </button>
          ) : (
            <div className="shrink-0 space-y-2 text-right">
              <p className="text-xs text-muted-foreground">
                Type <strong>delete</strong> to confirm
              </p>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete"
                className="w-32 rounded-md border border-destructive/30 bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-destructive/30"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setConfirmText("");
                  }}
                  className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmText !== "delete" || deleting}
                  onClick={handleDelete}
                  className="rounded-md bg-destructive px-2 py-1 text-xs font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
