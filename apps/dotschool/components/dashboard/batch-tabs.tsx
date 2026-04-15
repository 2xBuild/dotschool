"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { BatchCardIconAvatarGroup } from "@/components/dashboard/batch-card-icon-avatar-group";
import {
  batchListCardStyles,
  batchListCardToneAt,
  type BatchListCardStyleSet,
} from "@/components/dashboard/batch-list-card-styles";
import type { BatchProgramDetails } from "@/components/dashboard/batch-types";
import { enrollInBatch } from "@/server/batches/enroll";
import { cn } from "@/lib/utils";
import { useTabSwitchSound, useClickSound } from "@/hooks/use-app-sound";

export type BatchTabItem = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  batchNumber: number;
  totalSeats: number;
  participantCount: number;
  cardIconKeys: string[];
  enrolledAt?: string;
  status?: string;
  questionSetId?: string | null;
  details?: BatchProgramDetails | null;
  testStatus?: string | null;
};

type BatchTabsProps = {
  upcoming: BatchTabItem[];
  yourBatches: BatchTabItem[];
  children?: React.ReactNode;
};

const BATCH_DATE_LOCALE = "en-US";

function formatBatchRange(startsAt: string, endsAt: string | null) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const dateFmt = new Intl.DateTimeFormat(BATCH_DATE_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (end) {
    return `${dateFmt.format(start)} - ${dateFmt.format(end)}`;
  }
  return `Starts ${dateFmt.format(start)}`;
}

function buildBatchTagline(batchNumber: number, description: string | null) {
  const desc = description?.trim();
  if (desc) {
    return `Batch ${batchNumber} - ${desc}`;
  }
  return `Batch ${batchNumber}`;
}

function StatChips({
  s,
  totalSeats,
  applied,
  className,
}: {
  s: BatchListCardStyleSet;
  totalSeats: number;
  applied: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap justify-end gap-x-4 gap-y-1", className)}>
      <p className={cn("text-xs sm:text-sm", s.seatsLabel)}>
        Seats <span className={cn("ml-1 tabular-nums", s.metaValue)}>{totalSeats}</span>
      </p>
      <p className={cn("text-xs sm:text-sm", s.seatsLabel)}>
        Applied <span className={cn("ml-1 tabular-nums", s.metaValue)}>{applied}</span>
      </p>
    </div>
  );
}

export function BatchTabs({
  upcoming,
  yourBatches,
  children,
}: BatchTabsProps) {
  const [tab, setTab] = useState<"upcoming" | "yours">("upcoming");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [playTabSwitch] = useTabSwitchSound();
  const [playClick] = useClickSound();

  function onJoin(batchId: string) {
    setError(null);
    startTransition(async () => {
      const result = await enrollInBatch(batchId);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
      <section className="rounded-3xl bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-headline text-lg sm:text-xl">Batches</h2>
          <div
            className="inline-flex w-full max-w-[20rem] shrink-0 overflow-hidden rounded-full border border-accent bg-muted/50 dark:bg-muted/40 sm:w-[20rem]"
            role="tablist"
            aria-label="Batch list"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "upcoming"}
              className={cn(
                "min-w-0 flex-1 whitespace-nowrap rounded-l-full rounded-r-none px-4 py-2 text-sm font-medium transition-colors",
                tab === "upcoming"
                  ? "bg-[#2f79f6] text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => { playTabSwitch(); setTab("upcoming"); }}
            >
              Upcoming
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "yours"}
              className={cn(
                "min-w-0 flex-1 whitespace-nowrap rounded-l-none rounded-r-full px-4 py-2 text-sm font-medium transition-colors",
                tab === "yours"
                  ? "bg-[#2f79f6] text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => { playTabSwitch(); setTab("yours"); }}
            >
              Your batches
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6" role="tabpanel">
          {tab === "upcoming" ? (
            upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                There is nothing to show. Please check back later.
              </p>
            ) : (
              <ul className="grid gap-4">
                {upcoming.map((batch, i) => {
                  const tone = batchListCardToneAt(i);
                  const s = batchListCardStyles(tone);
                  return (
                    <li key={batch.id} className={s.card}>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-balance", s.title)}>
                            {batch.title}
                          </p>
                          <p className={cn(s.muted, "mt-1 text-sm")}>
                            {buildBatchTagline(batch.batchNumber, batch.description)}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <BatchCardIconAvatarGroup
                            iconKeys={batch.cardIconKeys}
                            s={s}
                          />
                          <StatChips
                            s={s}
                            totalSeats={batch.totalSeats}
                            applied={batch.participantCount}
                          />
                          <div className="flex gap-2">
                            <Link
                              href={`/batches/${batch.id}`}
                              className={cn(
                                "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium",
                                s.secondaryBtn,
                              )}
                            >
                              More detail
                            </Link>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => { playClick(); onJoin(batch.id); }}
                              className={cn(
                                "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium disabled:pointer-events-none disabled:opacity-50",
                                s.primaryBtn,
                              )}
                            >
                              Join batch
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : yourBatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You are not enrolled in any batches yet. Browse upcoming batches
              and join a cohort.
            </p>
          ) : (
            <div className="flex flex-col gap-8">
              {(() => {
                const approvedBatches = yourBatches.filter(
                  (b) => b.status === "approved",
                );
                const appliedBatches = yourBatches.filter(
                  (b) => b.status !== "approved",
                );

                const renderList = (
                  batches: BatchTabItem[],
                  startIndex: number,
                  showTestBtn = false,
                ) => (
                  <ul className="grid gap-4">
                    {batches.map((batch, i) => {
                      const tone = batchListCardToneAt(startIndex + i);
                      const s = batchListCardStyles(tone);
                      const hasTest = showTestBtn && !!batch.questionSetId;
                      return (
                        <li key={batch.id} className={s.card}>
                          <div className="relative z-10 flex items-center gap-4">
                            <div className="min-w-0 flex-1">
                              <p className={cn("text-balance", s.title)}>
                                {batch.title}
                              </p>
                              <p className={cn(s.muted, "mt-1 text-sm")}>
                                {buildBatchTagline(batch.batchNumber, batch.description)}
                              </p>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <BatchCardIconAvatarGroup
                                iconKeys={batch.cardIconKeys}
                                s={s}
                              />
                              <StatChips
                                s={s}
                                totalSeats={batch.totalSeats}
                                applied={batch.participantCount}
                              />
                              <div className="flex gap-2">
                                <Link
                                  href={`/batches/${batch.id}`}
                                  className={cn(
                                    "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium",
                                    hasTest ? s.secondaryBtn : s.primaryBtn,
                                  )}
                                >
                                  More details
                                </Link>
                                {hasTest ? (
                                  batch.testStatus === "submitted" ? (
                                    <span
                                      className={cn(
                                        "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium opacity-60 cursor-default",
                                        s.secondaryBtn,
                                      )}
                                      title="Your test has been recorded. After the cutoff is announced, you can be part of this batch."
                                    >
                                      Submitted
                                    </span>
                                  ) : (
                                    <Link
                                      href={`/e-test?batch=${batch.id}`}
                                      className={cn(
                                        "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium",
                                        s.primaryBtn,
                                      )}
                                    >
                                      Take test
                                    </Link>
                                  )
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                );

                return (
                  <>
                    {approvedBatches.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <h3 className="font-headline text-lg sm:text-xl">
                          Your batches
                        </h3>
                        {renderList(
                          approvedBatches,
                          0,
                          false,
                        )}
                      </div>
                    ) : null}
                    {appliedBatches.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <h3 className="font-headline text-lg sm:text-xl">
                          Applied batches
                        </h3>
                        {renderList(
                          appliedBatches,
                          approvedBatches.length,
                          true,
                        )}
                      </div>
                    ) : null}
                  </>
                );
              })()}
            </div>
          )}
        </div>
        {tab === "upcoming" && children}
      </section>
  );
}
