"use client";

import { useState } from "react";

type TestSubmission = {
  sessionId: string;
  userId: string;
  status: string;
  questionSetId: string;
  testType: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  startedAt: Date;
  finishedAt: Date | null;
  durationSeconds: number | null;
  name: string | null;
  email: string | null;
  username: string | null;
  image: string | null;
};

type Props = {
  submissions: TestSubmission[];
};

type SortField = "rank" | "score" | "duration" | "date";

const statusStyles: Record<string, string> = {
  submitted:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  abandoned:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(d: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TestSubmissionsTable({ submissions }: Props) {
  const [sortField, setSortField] = useState<SortField>("rank");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const submitted = submissions.filter((s) => s.status === "submitted");
  const inProgress = submissions.filter((s) => s.status === "in_progress");
  const pending = submissions.filter((s) => s.status === "pending");
  const abandoned = submissions.filter((s) => s.status === "abandoned");

  const avgScore =
    submitted.length > 0
      ? Math.round(
          submitted.reduce((sum, s) => sum + s.scorePercent, 0) /
            submitted.length,
        )
      : 0;

  const avgDuration =
    submitted.filter((s) => s.durationSeconds != null).length > 0
      ? Math.round(
          submitted
            .filter((s) => s.durationSeconds != null)
            .reduce((sum, s) => sum + s.durationSeconds!, 0) /
            submitted.filter((s) => s.durationSeconds != null).length,
        )
      : 0;

  const topScore = submitted.length > 0 ? submitted[0]!.scorePercent : 0;

  const sorted = [...submissions].sort((a, b) => {
    switch (sortField) {
      case "score":
        return b.scorePercent - a.scorePercent;
      case "duration":
        return (a.durationSeconds ?? Infinity) - (b.durationSeconds ?? Infinity);
      case "date":
        return (b.startedAt?.getTime() ?? 0) - (a.startedAt?.getTime() ?? 0);
      default:
        return b.scorePercent - a.scorePercent || b.correctCount - a.correctCount;
    }
  });

  if (submissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No test submissions for this batch yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Total Sessions
          </p>
          <p className="mt-1 text-2xl font-bold">{submissions.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Submitted</p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
            {submitted.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Avg Score</p>
          <p className="mt-1 text-2xl font-bold">{avgScore}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Top Score</p>
          <p className="mt-1 text-2xl font-bold">{topScore}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Avg Duration
          </p>
          <p className="mt-1 text-2xl font-bold">
            {avgDuration > 0 ? formatDuration(avgDuration) : "-"}
          </p>
        </div>
      </div>

      {/* Status breakdown */}
      {(inProgress.length > 0 || pending.length > 0 || abandoned.length > 0) && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {pending.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              {pending.length} pending
            </span>
          )}
          {inProgress.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {inProgress.length} in progress
            </span>
          )}
          {abandoned.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {abandoned.length} abandoned
            </span>
          )}
        </div>
      )}

      {/* Sort controls */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Sort by:</span>
        {(
          [
            ["rank", "Rank"],
            ["score", "Score"],
            ["duration", "Duration"],
            ["date", "Date"],
          ] as const
        ).map(([field, label]) => (
          <button
            key={field}
            type="button"
            onClick={() => setSortField(field)}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              sortField === field
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Submissions table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Score</th>
              <th className="px-4 py-3 text-left font-medium">Correct</th>
              <th className="px-4 py-3 text-left font-medium">Duration</th>
              <th className="px-4 py-3 text-left font-medium">Started</th>
              <th className="px-4 py-3 text-left font-medium">Finished</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr
                key={s.sessionId}
                className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() =>
                  setExpandedSession(
                    expandedSession === s.sessionId ? null : s.sessionId,
                  )
                }
              >
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        className="size-6 rounded-full"
                      />
                    ) : (
                      <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                        {(s.name ?? s.email ?? "?")[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="block truncate font-medium">
                        {s.name ?? s.email ?? "Unknown"}
                      </span>
                      {s.username && (
                        <span className="block truncate text-xs text-muted-foreground">
                          @{s.username}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusStyles[s.status] ?? statusStyles.pending
                    }`}
                  >
                    {s.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-semibold ${
                      s.scorePercent >= 70
                        ? "text-green-600 dark:text-green-400"
                        : s.scorePercent >= 40
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {s.status === "submitted" ? `${s.scorePercent}%` : "-"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.status === "submitted"
                    ? `${s.correctCount} / ${s.totalQuestions}`
                    : `- / ${s.totalQuestions}`}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.durationSeconds != null
                    ? formatDuration(s.durationSeconds)
                    : "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(s.startedAt)}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(s.finishedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded session detail */}
      {expandedSession && (() => {
        const s = submissions.find((s) => s.sessionId === expandedSession);
        if (!s) return null;
        return (
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Session Detail</h3>
              <button
                type="button"
                onClick={() => setExpandedSession(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <span className="text-xs text-muted-foreground">Session ID</span>
                <p className="font-mono text-xs break-all">{s.sessionId}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">User</span>
                <p>{s.name ?? s.email ?? "Unknown"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Email</span>
                <p>{s.email ?? "-"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Test Type</span>
                <p className="capitalize">{s.testType}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Question Set</span>
                <p className="font-mono text-xs">{s.questionSetId}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <p className="capitalize">{s.status.replace("_", " ")}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Score</span>
                <p className="font-semibold">{s.scorePercent}%</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Answered</span>
                <p>
                  {s.answeredCount} / {s.totalQuestions}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Correct</span>
                <p>
                  {s.correctCount} / {s.totalQuestions}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Duration</span>
                <p>
                  {s.durationSeconds != null
                    ? formatDuration(s.durationSeconds)
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Started</span>
                <p className="text-xs">{formatDate(s.startedAt)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Finished</span>
                <p className="text-xs">{formatDate(s.finishedAt)}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
