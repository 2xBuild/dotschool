"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { BatchNav, type BatchNavTab } from "@/components/dashboard/batch-nav";
import type { BatchProgramDetails } from "@/components/dashboard/batch-types";
import { ModuleBrowser } from "@/components/dashboard/module-browser";
import { TeamPanel, type RatedMember } from "@/components/dashboard/team-panel";
import { RichContent } from "@/components/ui/rich-content";
import { SiteFooter } from "@/components/site/site-footer";
import { ThemeToggle } from "@/components/site/theme-toggle";
import type { BatchModule } from "@/server/batches/modules";
import type { EnrollmentStatus } from "@/server/batches/detail";

const BATCH_DATE_LOCALE = "en-US";

function formatBatchRange(startsAt: Date, endsAt: Date | null) {
  const dateFmt = new Intl.DateTimeFormat(BATCH_DATE_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (endsAt) {
    return `${dateFmt.format(startsAt)} — ${dateFmt.format(endsAt)}`;
  }
  return `Starts ${dateFmt.format(startsAt)}`;
}

type BatchDetailViewProps = {
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  memberCount: number;
  details: BatchProgramDetails;
  volunteers: RatedMember[];
  modules: BatchModule[];
  isEnrolled: boolean;
  enrollmentStatus: EnrollmentStatus;
  batchId: string;
  members: RatedMember[];
};

function HomePanel({ modules }: { modules: BatchModule[] }) {
  return <ModuleBrowser modules={modules} />;
}

function RoadmapPanel({ roadmap }: { roadmap: string | null }) {
  return (
    <ContentPanel body={roadmap} emptyDescription="No roadmap published yet." />
  );
}

function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="py-2">
      <h3 className="font-headline text-base sm:text-lg">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </section>
  );
}

function ContentPanel({
  body,
  emptyDescription = "Nothing published in this section yet.",
}: {
  body: string | null;
  emptyDescription?: string;
}) {
  if (!body?.trim()) {
    return (
      <p className="py-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {emptyDescription}
      </p>
    );
  }
  return (
    <section>
      <RichContent html={body} />
    </section>
  );
}

export function BatchDetailView({
  title,
  description,
  startsAt,
  endsAt,
  memberCount,
  details,
  volunteers,
  modules,
  isEnrolled,
  enrollmentStatus,
  batchId,
  members,
}: BatchDetailViewProps) {
  const [activeTab, setActiveTab] = useState<BatchNavTab>("home");
  const isApproved = enrollmentStatus === "approved";

  function LockedPanel({ title }: { title: string }) {
    return (
      <section className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6 text-muted-foreground"
            aria-hidden
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 className="mt-4 font-headline text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          This section is available to approved batch members only.
        </p>
      </section>
    );
  }

  function renderTab() {
    switch (activeTab) {
      case "home":
        if (!isApproved) return <LockedPanel title="Home" />;
        return <HomePanel modules={modules} />;
      case "roadmap":
        return <RoadmapPanel roadmap={details.roadmap} />;
      case "leaderboard":
        return (
          <ContentPanel
            body={details.leaderboard}
            emptyDescription="Leaderboard will be available soon."
          />
        );
      case "submissions":
        if (!isApproved) return <LockedPanel title="Submissions" />;
        return (
          <PlaceholderPanel
            title="Submissions"
            description="Submit your assignments and projects here when asked."
          />
        );
      case "rewards-hackathons":
        return (
          <ContentPanel
            body={details.rewardPool}
            emptyDescription="Rewards and hackathon details will be announced here"
          />
        );
      case "team":
        return (
          <TeamPanel
            batchId={batchId}
            volunteers={volunteers}
            members={members}
            canRate={isApproved}
          />
        );
      case "tips-and-rules": {
        const combined =
          [details.tips, details.rules].filter(Boolean).join("") || null;
        return (
          <ContentPanel
            body={combined}
            emptyDescription="Tips and rules will be published soon."
          />
        );
      }
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/70">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="min-w-0 shrink-0">
            <Logo className="text-xl font-medium tracking-tight text-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="border-0" />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Batch title bar */}
      <div className="mx-auto w-full max-w-5xl px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-headline text-2xl leading-tight text-balance sm:text-3xl">
              {title}
            </h1>
            {description?.trim() && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/80 text-pretty">
                {description.trim()}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground/70">
              <span>{formatBatchRange(startsAt, endsAt)}</span>
              <span aria-hidden>·</span>
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment status card */}
      {isEnrolled && !isApproved ? (
        <div className="mx-auto w-full max-w-5xl px-6 pb-2">
          <div className="flex items-center gap-4 rounded-xl bg-blue-600 px-5 py-4 text-white">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug">
                Your approval is pending
              </p>
              <p className="mt-0.5 text-sm leading-snug text-white/80">
                Once approved, full access will be granted.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Navigation tabs */}
      <div className="mx-auto w-full max-w-5xl px-6">
        <BatchNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isEnrolled={isApproved}
        />
      </div>

      {/* Tab content */}
      <main className="min-h-screen flex-1 py-7 sm:py-9">
        <div className="mx-auto w-full max-w-5xl px-6">{renderTab()}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
