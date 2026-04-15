"use client";

import { useState } from "react";
import { updateEnrollmentStatus } from "@/server/admin/batch-actions";

type Enrollment = {
  userId: string;
  status: string | null;
  enrolledAt: Date;
  name: string | null;
  email: string | null;
  username: string | null;
  image: string | null;
};

type Props = {
  enrollments: Enrollment[];
  batchId: string;
  canManage: boolean;
};

export function EnrollmentTable({ enrollments, batchId, canManage }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(
    userId: string,
    newStatus: "applied" | "approved",
  ) {
    setUpdating(userId);
    setError(null);
    const result = await updateEnrollmentStatus(userId, batchId, newStatus);
    setUpdating(null);
    if ("error" in result) {
      setError(result.error ?? "Failed to update enrollment status");
    }
  }

  if (enrollments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No enrollments yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">User</th>
            <th className="px-4 py-3 text-left font-medium">Username</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Enrolled</th>
            {canManage && (
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => (
            <tr
              key={e.userId}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {e.image ? (
                    <img
                      src={e.image}
                      alt=""
                      className="size-6 rounded-full"
                    />
                  ) : (
                    <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                      {(e.name ?? e.email ?? "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  <span>{e.name ?? e.email}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {e.username ?? "-"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    e.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {e.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {e.enrolledAt.toLocaleDateString()}
              </td>
              {canManage && (
                <td className="px-4 py-3">
                  {e.status === "applied" ? (
                    <button
                      type="button"
                      disabled={updating === e.userId}
                      onClick={() => handleStatusChange(e.userId, "approved")}
                      className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating === e.userId ? "..." : "Approve"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={updating === e.userId}
                      onClick={() => handleStatusChange(e.userId, "applied")}
                      className="rounded-md bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80 disabled:opacity-50"
                    >
                      {updating === e.userId ? "..." : "Revoke"}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
