"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { roleName } from "@/lib/batch-volunteers";
import { castPeerRating } from "@/server/batches/peer-votes";
import { cn } from "@/lib/utils";
import { useTabSwitchSound, useSoftClickSound } from "@/hooks/use-app-sound";

export type RatedMember = {
  userId: string;
  name: string | null;
  username: string;
  image: string | null;
  avgRating: number;
  ratingCount: number;
  userRating: number | null;
  role?: string | null;
};

type TeamPanelProps = {
  batchId: string;
  volunteers: RatedMember[];
  members: RatedMember[];
  canRate: boolean;
};

type Mode = "volunteers" | "members";

function Avatar({ name, image }: { name: string | null; image: string | null }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className="size-10 shrink-0 rounded-full border border-border object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-brutal-lime text-xs font-semibold text-brutal-navy">
      {initials || "?"}
    </div>
  );
}

function StarRow({
  value,
  hover,
  interactive,
  disabled,
  onSelect,
  onHover,
}: {
  value: number;
  hover: number;
  interactive: boolean;
  disabled?: boolean;
  onSelect?: (v: number) => void;
  onHover?: (v: number) => void;
}) {
  const shown = hover || value;
  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => onHover?.(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= shown;
        const StarIcon = (
          <Star
            className={cn(
              "size-4 shrink-0 transition-colors",
              active
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/50",
            )}
            aria-hidden
          />
        );
        if (!interactive) {
          return <span key={i}>{StarIcon}</span>;
        }
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(i === value ? 0 : i)}
            onMouseEnter={() => onHover?.(i)}
            className={cn(
              "rounded p-0.5 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-50",
            )}
            aria-label={`Rate ${i} star${i === 1 ? "" : "s"}`}
            title={
              i === value
                ? `Remove your ${i}-star rating`
                : `Rate ${i} star${i === 1 ? "" : "s"}`
            }
          >
            {StarIcon}
          </button>
        );
      })}
    </div>
  );
}

export function TeamPanel({ batchId, volunteers, members, canRate }: TeamPanelProps) {
  const [mode, setMode] = useState<Mode>("volunteers");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [playTabSwitch] = useTabSwitchSound();
  const [playSoftClick] = useSoftClickSound();
  const [optimistic, setOptimistic] = useState<
    Record<string, { userRating: number | null; avgRating: number; ratingCount: number }>
  >({});
  const [hover, setHover] = useState<Record<string, number>>({});

  const list = mode === "volunteers" ? volunteers : members;

  const prevRef = useRef({ volunteers, members });
  useEffect(() => {
    if (
      prevRef.current.volunteers !== volunteers ||
      prevRef.current.members !== members
    ) {
      prevRef.current = { volunteers, members };
      setOptimistic({});
    }
  }, [volunteers, members]);

  const getState = useCallback(
    (m: RatedMember) => optimistic[m.userId] ?? {
      userRating: m.userRating,
      avgRating: m.avgRating,
      ratingCount: m.ratingCount,
    },
    [optimistic],
  );

  function onRate(m: RatedMember, value: number) {
    const cur = getState(m);
    setError(null);

    const newRating = value === 0 ? null : value;
    const prevSum = cur.avgRating * cur.ratingCount;
    let nextSum = prevSum;
    let nextCount = cur.ratingCount;
    if (cur.userRating != null) {
      nextSum -= cur.userRating;
      nextCount -= 1;
    }
    if (newRating != null) {
      nextSum += newRating;
      nextCount += 1;
    }
    const nextAvg = nextCount === 0 ? 0 : nextSum / nextCount;

    setOptimistic((prev) => ({
      ...prev,
      [m.userId]: {
        userRating: newRating,
        avgRating: nextAvg,
        ratingCount: nextCount,
      },
    }));

    startTransition(async () => {
      const result = await castPeerRating(batchId, m.userId, newRating);
      if (!result.ok) {
        setError(result.error);
        setOptimistic((prev) => ({ ...prev, [m.userId]: cur }));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-headline text-base sm:text-lg">Team</h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {mode === "volunteers"
              ? "Rate volunteers on a 5-star scale for their guidance, responsiveness, and support."
              : "Rate your fellows on a 5-star scale based on their activity, collaboration, and helpfulness."}
          
          </p>
        </div>

        <div
          className="inline-flex shrink-0 self-start overflow-hidden rounded-full bg-muted/40 sm:self-auto"
          role="tablist"
          aria-label="Team sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "volunteers"}
            onClick={() => { playTabSwitch(); setMode("volunteers"); }}
            className={cn(
              "px-4 py-1.5 text-sm font-medium transition-colors",
              mode === "volunteers"
                ? "bg-[#2f79f6] text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Volunteers ({volunteers.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "members"}
            onClick={() => { playTabSwitch(); setMode("members"); }}
            className={cn(
              "px-4 py-1.5 text-sm font-medium transition-colors",
              mode === "members"
                ? "bg-[#2f79f6] text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Members ({members.length})
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {mode === "volunteers"
            ? "No volunteers assigned to this batch yet."
            : "No members to display yet."}
        </p>
      ) : (
        <ul className="grid gap-3">
          {list.map((m) => {
            const st = getState(m);
            return (
              <li
                key={m.userId}
                className="flex items-center gap-4 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/30"
              >
                <Avatar name={m.name} image={m.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {m.name ?? m.username}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{m.username}
                    {m.role ? ` · ${roleName(m.role)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StarRow
                    value={st.userRating ?? 0}
                    hover={hover[m.userId] ?? 0}
                    interactive={canRate}
                    disabled={pending}
                    onSelect={(v) => { playSoftClick(); onRate(m, v); }}
                    onHover={(v) =>
                      setHover((prev) => ({ ...prev, [m.userId]: v }))
                    }
                  />
                  <p className="text-[11px] tabular-nums text-muted-foreground">
                    {st.ratingCount === 0
                      ? "Not rated yet"
                      : `${st.avgRating.toFixed(1)} · ${st.ratingCount} rating${st.ratingCount === 1 ? "" : "s"}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
