"use client";

import { useState } from "react";
import { updateApplicationStatus } from "@/server/admin/volunteer-actions";

type Application = {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  motivation: string;
  experience: string | null;
  status: string | null;
  createdAt: Date;
  username: string | null;
  image: string | null;
};

type Props = {
  applications: Application[];
};

export function VolunteerApplicationList({ applications }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(
    appId: string,
    status: "accepted" | "declined",
  ) {
    setUpdating(appId);
    setError(null);
    const result = await updateApplicationStatus(appId, status);
    setUpdating(null);
    if ("error" in result) {
      setError(result.error ?? "Failed to update application status");
    }
  }

  if (applications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No applications found.</p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {applications.map((app) => (
        <div
          key={app.id}
          className="rounded-lg border border-border p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {app.image ? (
                <img
                  src={app.image}
                  alt=""
                  className="size-8 rounded-full"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {app.name[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium">{app.name}</p>
                <p className="text-xs text-muted-foreground">
                  {app.email}
                  {app.username ? ` (@${app.username})` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  app.status === "accepted"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : app.status === "declined"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {app.status}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {app.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Motivation: </span>
              {app.motivation}
            </p>
            {app.experience && (
              <p className="text-sm">
                <span className="font-medium">Experience: </span>
                {app.experience}
              </p>
            )}
          </div>

          {app.status === "pending" && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={updating === app.id}
                onClick={() => handleAction(app.id, "accepted")}
                className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {updating === app.id ? "..." : "Accept"}
              </button>
              <button
                type="button"
                disabled={updating === app.id}
                onClick={() => handleAction(app.id, "declined")}
                className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {updating === app.id ? "..." : "Decline"}
              </button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            Applied {app.createdAt.toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
