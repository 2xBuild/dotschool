"use client";

import { cn } from "@/lib/utils";

export type BatchTab =
  | "overview"
  | "content"
  | "modules"
  | "enrollments"
  | "volunteers"
  | "tests"
  | "settings";

const tabs: { id: BatchTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "content", label: "Content" },
  { id: "modules", label: "Modules" },
  { id: "enrollments", label: "Enrollments" },
  { id: "volunteers", label: "Volunteers" },
  { id: "tests", label: "Tests" },
  { id: "settings", label: "Settings" },
];

type Props = {
  active: BatchTab;
  onChange: (tab: BatchTab) => void;
  counts?: Partial<Record<BatchTab, number>>;
};

export function BatchTabs({ active, onChange, counts }: Props) {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium transition-colors",
            active === tab.id
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
          {counts?.[tab.id] != null && (
            <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              {counts[tab.id]}
            </span>
          )}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
