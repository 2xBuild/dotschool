"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Hash, Users, BookOpen, Rocket, MessageSquare } from "lucide-react";

import { BatchTabs, type BatchTab } from "./batch-tabs";
import { BatchForm } from "./batch-form";
import { BatchContentEditor } from "./batch-content-editor";
import { ModuleManager } from "./module-manager";
import { EnrollmentTable } from "./enrollment-table";
import { BatchVolunteersTable } from "./batch-volunteers-table";
import { BatchDangerZone } from "./batch-danger-zone";
import { TestSubmissionsTable } from "./test-submissions-table";
import { startBatch, createBatchDiscordChannels } from "@/server/admin/batch-actions";
import type { AdminBatchModule } from "@/server/admin/module-queries";

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
  discordCategoryId: string | null;
  roadmap: string | null;
  process: string | null;
  projects: string | null;
  leaderboard: string | null;
  rewardPool: string | null;
  hackathon: string | null;
  createdAt: Date;
};

type Enrollment = {
  userId: string;
  status: string | null;
  enrolledAt: Date;
  name: string | null;
  email: string | null;
  username: string | null;
  image: string | null;
};

type Volunteer = {
  userId: string;
  role: string;
  assignedAt: Date;
  name: string | null;
  email: string | null;
  username: string | null;
};

type VolunteerCandidate = {
  userId: string;
  name: string;
  email: string;
  role: string;
  username: string | null;
};

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
  batch: BatchData;
  enrollments: Enrollment[];
  volunteers: Volunteer[];
  volunteerCandidates: VolunteerCandidate[];
  modules: AdminBatchModule[];
  testSubmissions: TestSubmission[];
  canManage: boolean;
  isAdmin: boolean;
};

const statusColors: Record<string, string> = {
  confirmed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  started:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BatchDetailClient({
  batch,
  enrollments,
  volunteers,
  volunteerCandidates,
  modules,
  testSubmissions,
  canManage,
  isAdmin,
}: Props) {
  const [tab, setTab] = useState<BatchTab>("overview");
  const [starting, startTransition] = useTransition();
  const [startResult, setStartResult] = useState<string | null>(null);
  const [creatingChannels, startChannelsTransition] = useTransition();
  const [channelsResult, setChannelsResult] = useState<string | null>(null);
  const router = useRouter();

  const canStart = isAdmin && batch.status !== "started";
  const canCreateChannels = isAdmin && !batch.discordCategoryId;

  function handleStartBatch() {
    if (!confirm(
      `Start "${batch.title}"?\n\nThis will:\n• Approve the top ${batch.totalSeats} test scorers\n• Grant them batch tags on Discord\n• Create Discord channels for this batch\n\nThis cannot be undone.`
    )) return;

    startTransition(async () => {
      const result = await startBatch(batch.id);
      if (result.error) {
        setStartResult(`Error: ${result.error}`);
      } else {
        const d = result.discord as Record<string, unknown> | undefined;
        const discordMsg = d?.error || d?.skipped
          ? ` Discord: ${d.reason ?? d.error}`
          : ` Discord: created ${d?.category} with ${(d?.channels as string[])?.length ?? 0} channels.`;
        setStartResult(`Batch started! ${result.approved} members approved.${discordMsg}`);
        router.refresh();
      }
    });
  }

  const contentFieldsFilled = [
    batch.roadmap,
    batch.process,
    batch.projects,
    batch.leaderboard,
    batch.rewardPool,
    batch.hackathon,
  ].filter((f) => f?.trim()).length;

  const counts: Partial<Record<BatchTab, number>> = {
    enrollments: enrollments.length,
    volunteers: volunteers.length,
    modules: modules.length,
    tests: testSubmissions.length,
  };

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/batches"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="size-3" />
          All Batches
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {batch.title}
              </h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[batch.status] ?? statusColors.pending}`}
              >
                {batch.status}
              </span>
            </div>
            {batch.description && (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {batch.description}
              </p>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Hash className="size-3.5" />
            Batch {batch.batchNumber}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatDate(batch.startsAt)}
            {batch.endsAt ? ` — ${formatDate(batch.endsAt)}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {enrollments.length} / {batch.totalSeats} enrolled
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            {modules.length} modules
          </span>
        </div>
      </div>

      {/* Tabs */}
      <BatchTabs active={tab} onChange={setTab} counts={counts} />

      {/* Tab content */}
      <div>
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Overview stats grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Enrollments
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {enrollments.length}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {batch.totalSeats}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Pending Approvals
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {enrollments.filter((e) => e.status === "applied").length}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Modules
                </p>
                <p className="mt-1 text-2xl font-bold">{modules.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Content Sections
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {contentFieldsFilled}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / 6
                  </span>
                </p>
              </div>
            </div>

            {/* Start batch */}
            {canStart && (
              <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Rocket className="size-5 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold">Start this batch</h2>
                    <p className="text-xs text-muted-foreground">
                      Approves the top {batch.totalSeats} entrance test scorers, grants Discord tags, and creates batch channels.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={starting}
                  onClick={handleStartBatch}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {starting ? "Starting batch..." : "Start Batch"}
                </button>
                {startResult && (
                  <p className={`text-xs ${startResult.startsWith("Error") ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                    {startResult}
                  </p>
                )}
              </div>
            )}

            {/* Discord channels */}
            {isAdmin && (
              <div className="rounded-lg border border-border p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-5 text-indigo-500" />
                  <div>
                    <h2 className="text-sm font-semibold">Discord Channels</h2>
                    <p className="text-xs text-muted-foreground">
                      {batch.discordCategoryId
                        ? `Channels created (category: ${batch.discordCategoryId})`
                        : "Discord channels have not been created for this batch yet."}
                    </p>
                  </div>
                </div>
                {canCreateChannels ? (
                  <button
                    type="button"
                    disabled={creatingChannels}
                    onClick={() => {
                      if (
                        !confirm(
                          `Create Discord channels for "${batch.title}"?\n\n`,
                        )
                      )
                        return;
                      startChannelsTransition(async () => {
                        const result = await createBatchDiscordChannels(batch.id);
                        if (result.error) {
                          setChannelsResult(`Error: ${result.error}`);
                        } else {
                          const d = result.discord as Record<string, unknown> | undefined;
                          setChannelsResult(
                            `Discord channels created! Category: ${d?.category}, ${(d?.channels as string[])?.length ?? 0} channels.`,
                          );
                          router.refresh();
                        }
                      });
                    }}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creatingChannels ? "Creating channels..." : "Create Discord Channels"}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Channels already created
                  </span>
                )}
                {channelsResult && (
                  <p
                    className={`text-xs ${channelsResult.startsWith("Error") ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
                  >
                    {channelsResult}
                  </p>
                )}
              </div>
            )}

            {/* Batch settings form */}
            {canManage && (
              <div className="rounded-lg border border-border p-5 space-y-4">
                <h2 className="text-sm font-semibold">Batch Settings</h2>
                <BatchForm batch={batch} />
              </div>
            )}
          </div>
        )}

        {tab === "content" && (
          <div>
            {canManage ? (
              <BatchContentEditor batch={batch} />
            ) : (
              <div className="space-y-4">
                {(
                  [
                    ["Roadmap", batch.roadmap],
                    ["Process", batch.process],
                    ["Projects", batch.projects],
                    ["Leaderboard", batch.leaderboard],
                    ["Reward Pool", batch.rewardPool],
                    ["Hackathon", batch.hackathon],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border p-4"
                  >
                    <h3 className="text-sm font-semibold">{label}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {value?.trim() || "Not yet published"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "modules" && (
          <ModuleManager batchId={batch.id} modules={modules} />
        )}

        {tab === "enrollments" && (
          <EnrollmentTable
            enrollments={enrollments}
            batchId={batch.id}
            canManage={canManage}
          />
        )}

        {tab === "volunteers" && (
          <BatchVolunteersTable
            batchId={batch.id}
            volunteers={volunteers}
            candidates={volunteerCandidates}
            canManage={canManage}
          />
        )}

        {tab === "tests" && (
          <TestSubmissionsTable submissions={testSubmissions} />
        )}

        {tab === "settings" && (
          <div className="space-y-6">
            {canManage && (
              <div className="rounded-lg border border-border p-5 space-y-4">
                <h2 className="text-sm font-semibold">Batch Settings</h2>
                <BatchForm batch={batch} />
              </div>
            )}
            {isAdmin && (
              <BatchDangerZone
                batchId={batch.id}
                batchTitle={batch.title}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
