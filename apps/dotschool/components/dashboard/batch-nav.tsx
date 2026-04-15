"use client";

import { cn } from "@/lib/utils";
import { useNavClickSound } from "@/hooks/use-app-sound";

export type BatchNavTab =
  | "home"
  | "roadmap"
  | "leaderboard"
  | "submissions"
  | "rewards-hackathons"
  | "team"
  | "tips-and-rules";

const ALL_TABS: { key: BatchNavTab; label: string; publicLabel?: string }[] = [
  { key: "home", label: "Home" },
  { key: "roadmap", label: "Roadmap" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "submissions", label: "Submissions" },
  { key: "rewards-hackathons", label: "Rewards & Hackathons" },
  { key: "team", label: "Team" },
  { key: "tips-and-rules", label: "Tips & Rules" },
];

const LOCKED_TABS: Set<BatchNavTab> = new Set(["home", "submissions"]);

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 opacity-60"
      aria-hidden
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

type BatchNavProps = {
  activeTab: BatchNavTab;
  onTabChange: (tab: BatchNavTab) => void;
  isEnrolled: boolean;
};

export function BatchNav({ activeTab, onTabChange, isEnrolled }: BatchNavProps) {
  const [playNavClick] = useNavClickSound();
  return (
    <nav className="border-b border-border/70">
      <div
        className="flex gap-5 overflow-x-auto"
        role="tablist"
        aria-label="Batch navigation"
      >
        {ALL_TABS.map((t) => {
          const isLocked = !isEnrolled && LOCKED_TABS.has(t.key);
          const label = !isEnrolled && t.publicLabel ? t.publicLabel : t.label;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={activeTab === t.key}
              className={cn(
                "shrink-0 border-b-2 border-transparent px-0 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === t.key
                  ? "border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => { playNavClick(); onTabChange(t.key); }}
            >
              <span className="inline-flex items-center gap-1.5">
                {label}
                {isLocked ? <LockIcon /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
