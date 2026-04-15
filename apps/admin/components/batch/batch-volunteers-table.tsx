"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import {
  assignBatchVolunteer,
  removeBatchVolunteer,
} from "@/server/admin/batch-actions";

const roleLabelMap: Record<string, string> = {
  developer: "Developer",
  discord_mod: "Discord Mod",
  content_writer: "Content Writer",
  mentor: "Mentor",
  other: "Other",
};

const roleColorMap: Record<string, string> = {
  developer:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  discord_mod:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  content_writer:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  mentor:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const ROLE_OPTIONS = [
  "developer",
  "discord_mod",
  "content_writer",
  "mentor",
  "other",
] as const;

type Volunteer = {
  userId: string;
  role: string;
  assignedAt: Date;
  name: string | null;
  email: string | null;
  username: string | null;
};

type Candidate = {
  userId: string;
  name: string;
  email: string;
  role: string;
  username: string | null;
};

type Props = {
  batchId: string;
  volunteers: Volunteer[];
  candidates: Candidate[];
  canManage: boolean;
};

export function BatchVolunteersTable({
  batchId,
  volunteers,
  candidates,
  canManage,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("developer");

  function handleCandidateChange(userId: string) {
    setSelectedUserId(userId);
    const candidate = candidates.find((c) => c.userId === userId);
    if (candidate) setSelectedRole(candidate.role);
  }

  function handleAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Select a volunteer");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await assignBatchVolunteer(
        batchId,
        selectedUserId,
        selectedRole,
      );
      if ("error" in result) {
        setError(result.error ?? "Failed to assign");
        return;
      }
      setSelectedUserId("");
      setSelectedRole("developer");
      router.refresh();
    });
  }

  function handleRemove(userId: string, role: string) {
    if (!confirm("Remove this volunteer from the batch?")) return;
    setError(null);
    startTransition(async () => {
      const result = await removeBatchVolunteer(batchId, userId, role);
      if ("error" in result) {
        setError(result.error ?? "Failed to remove");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {canManage && (
        <form
          onSubmit={handleAssign}
          className="rounded-lg border border-border p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold">Assign a volunteer</h3>
          {candidates.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No accepted volunteer applications available. Accept applications
              on the Volunteers page first.
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-xs font-medium mb-1 text-muted-foreground">
                  Volunteer
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleCandidateChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select volunteer…</option>
                  {candidates.map((c) => (
                    <option key={c.userId} value={c.userId}>
                      {c.name}
                      {c.username ? ` (@${c.username})` : ` (${c.email})`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[160px]">
                <label className="block text-xs font-medium mb-1 text-muted-foreground">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {roleLabelMap[r]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={pending || !selectedUserId}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {pending ? "Assigning…" : "Assign"}
              </button>
            </div>
          )}
        </form>
      )}

      {volunteers.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-12">
          <p className="text-sm text-muted-foreground">
            No volunteers assigned to this batch
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Volunteer</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Assigned</th>
                {canManage && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr
                  key={`${v.userId}-${v.role}`}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {v.name ?? v.email ?? "Unknown"}
                    </p>
                    {v.username && (
                      <p className="text-xs text-muted-foreground">
                        @{v.username}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColorMap[v.role] ?? roleColorMap.other}`}
                    >
                      {roleLabelMap[v.role] ?? v.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {v.assignedAt.toLocaleDateString()}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleRemove(v.userId, v.role)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
