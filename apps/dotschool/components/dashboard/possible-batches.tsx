"use client";

import { ArrowDown, ArrowUp, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { BatchCardIconAvatarGroup } from "@/components/dashboard/batch-card-icon-avatar-group";
import {
  batchListCardStyles,
  batchListCardToneAt,
  type BatchListCardStyleSet,
} from "@/components/dashboard/batch-list-card-styles";
import { castBatchInterestVote } from "@/server/batches/interest";
import { cn } from "@/lib/utils";
import { useSoftClickSound, useToggleSound } from "@/hooks/use-app-sound";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type PossibleBatchItem = {
  id: string;
  title: string;
  description: string | null;
  batchNumber: number;
  totalSeats: number;
  cardIconKeys: string[];
  upCount: number;
  downCount: number;
  userVote: "up" | "down" | null;
};

function AnimatedCounter({ value }: { value: number }) {
  const prevRef = useRef(value);
  const [display, setDisplay] = useState<{
    current: number;
    previous: number | null;
    direction: "up" | "down" | null;
  }>({ current: value, previous: null, direction: null });

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== value) {
      const dir = value > prev ? "up" : "down";
      setDisplay({ current: value, previous: prev, direction: dir });
      prevRef.current = value;

      const id = setTimeout(() => {
        setDisplay((d) => ({ ...d, previous: null, direction: null }));
      }, 250);
      return () => clearTimeout(id);
    }
  }, [value]);

  if (display.direction === null || display.previous === null) {
    return <span className="inline-flex tabular-nums">{display.current}</span>;
  }

  const entering =
    display.direction === "up"
      ? "animate-[slideInFromTop_250ms_ease-out_forwards]"
      : "animate-[slideInFromBottom_250ms_ease-out_forwards]";
  const leaving =
    display.direction === "up"
      ? "animate-[slideOutToBottom_250ms_ease-out_forwards]"
      : "animate-[slideOutToTop_250ms_ease-out_forwards]";

  return (
    <span className="relative inline-flex h-[1em] items-center overflow-hidden tabular-nums">
      <span className={cn("inline-block", entering)} key={`c-${display.current}`}>
        {display.current}
      </span>
      <span
        className={cn("absolute inset-0 inline-flex items-center justify-center", leaving)}
        key={`p-${display.previous}`}
      >
        {display.previous}
      </span>
    </span>
  );
}

const POSSIBLE_BATCHES_INFO =
  "batches that are yet to be confirmed. Put your vote to show your interest.";

function buildPossibleBatchTagline(batchNumber: number, description: string | null) {
  const desc = description?.trim();
  if (desc) {
    return `Batch ${batchNumber} - ${desc}`;
  }
  return `Batch ${batchNumber}`;
}

function StatChips({
  s,
  totalSeats,
  className,
}: {
  s: BatchListCardStyleSet;
  totalSeats: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap justify-end gap-x-4 gap-y-1", className)}>
      <p className={cn("text-xs sm:text-sm", s.seatsLabel)}>
        Seats <span className={cn("ml-1 tabular-nums", s.metaValue)}>{totalSeats}</span>
      </p>
    </div>
  );
}

type PossibleBatchesProps = {
  items: PossibleBatchItem[];
  canVote: boolean;
};

export function PossibleBatches({ items, canVote }: PossibleBatchesProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [playSoftClick] = useSoftClickSound();
  const [playToggle] = useToggleSound();

  type VoteState = { up: number; down: number; userVote: "up" | "down" | null };
  const [optimistic, setOptimistic] = useState<Record<string, VoteState>>({});

  const prevItemsRef = useRef(items);
  useEffect(() => {
    if (prevItemsRef.current !== items) {
      prevItemsRef.current = items;
      setOptimistic({});
    }
  }, [items]);

  const getState = useCallback(
    (batch: PossibleBatchItem): VoteState =>
      optimistic[batch.id] ?? {
        up: batch.upCount,
        down: batch.downCount,
        userVote: batch.userVote,
      },
    [optimistic],
  );

  function onVote(batch: PossibleBatchItem, direction: "up" | "down") {
    const cur = getState(batch);
    setError(null);

    let next: VoteState;
    if (cur.userVote === direction) {
      next = {
        up: direction === "up" ? Math.max(0, cur.up - 1) : cur.up,
        down: direction === "down" ? Math.max(0, cur.down - 1) : cur.down,
        userVote: null,
      };
    } else if (cur.userVote === null) {
      next = {
        up: direction === "up" ? cur.up + 1 : cur.up,
        down: direction === "down" ? cur.down + 1 : cur.down,
        userVote: direction,
      };
    } else {
      next = {
        up: direction === "up" ? cur.up + 1 : Math.max(0, cur.up - 1),
        down: direction === "down" ? cur.down + 1 : Math.max(0, cur.down - 1),
        userVote: direction,
      };
    }
    setOptimistic((prev) => ({ ...prev, [batch.id]: next }));

    startTransition(async () => {
      const result = await castBatchInterestVote(batch.id, direction);
      if (!result.ok) {
        setError(result.error);
        setOptimistic((prev) => ({ ...prev, [batch.id]: cur }));
        return;
      }
      router.refresh();
    });
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={(v) => { playToggle(); setOpen(v); }}
      role="region"
      aria-labelledby="possible-batches-heading"
      className="mt-8 border-t border-border pt-8"
    >
      <div className="flex w-full min-w-0 items-start gap-4 sm:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2
            id="possible-batches-heading"
            className="font-headline text-lg leading-tight sm:text-xl"
          >
            Possible batches
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {POSSIBLE_BATCHES_INFO}
          </p>
        </div>
        <CollapsibleTrigger
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {open ? (
            <>
              <ChevronDown className="size-4 shrink-0" aria-hidden />
              Collapse
            </>
          ) : (
            <>
              <ChevronRight className="size-4 shrink-0" aria-hidden />
              Expand
            </>
          )}
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No possible batches listed right now. Check back later.
            </p>
          ) : (
            <ul className="grid gap-4">
              {items.map((batch, i) => {
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
                          {buildPossibleBatchTagline(
                            batch.batchNumber,
                            batch.description,
                          )}
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
                        />
                        {(() => {
                          const st = getState(batch);
                          return (
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                disabled={pending || !canVote}
                                title={
                                  !canVote
                                    ? "Sign in with a linked account to vote."
                                    : st.userVote === "up"
                                      ? "Remove your upvote"
                                      : "Upvote this possible batch"
                                }
                                onClick={() => { playSoftClick(); onVote(batch, "up"); }}
                                className={cn(
                                  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold disabled:pointer-events-none disabled:opacity-50",
                                  s.voteDefault,
                                )}
                              >
                                <ArrowUp className="size-3.5 shrink-0" aria-hidden />
                                <AnimatedCounter value={st.up} />
                              </button>
                              <button
                                type="button"
                                disabled={pending || !canVote}
                                title={
                                  !canVote
                                    ? "Sign in with a linked account to vote."
                                    : st.userVote === "down"
                                      ? "Remove your downvote"
                                      : "Downvote this possible batch"
                                }
                                onClick={() => { playSoftClick(); onVote(batch, "down"); }}
                                className={cn(
                                  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold disabled:pointer-events-none disabled:opacity-50",
                                  s.voteActive,
                                )}
                                aria-label="Downvote"
                              >
                                <ArrowDown className="size-3.5 shrink-0" aria-hidden />
                                <AnimatedCounter value={st.down} />
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
