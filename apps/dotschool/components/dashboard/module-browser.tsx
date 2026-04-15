"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { RichContent } from "@/components/ui/rich-content";
import type { BatchModule } from "@/server/batches/modules";
import { useSoftClickSound, useBackSound } from "@/hooks/use-app-sound";

function FolderIcon({ open, className }: { open?: boolean; className?: string }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className={cn("h-5 w-5 fill-brutal-lime", className)} aria-hidden>
        <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5 fill-current", className)} aria-hidden>
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  );
}

function BackArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4 fill-current", className)} aria-hidden>
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function ModuleContent({ module }: { module: BatchModule }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>Week {module.weekNumber}</span>
          <span aria-hidden>·</span>
          <span>Module {module.moduleNumber}</span>
        </div>
        <h3 className="mt-2 font-headline text-xl font-semibold text-foreground sm:text-2xl">
          {module.title}
        </h3>
      </div>

      {module.topics.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Topics covered
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {module.topics.map((topic, i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {module.description ? (
        <div>
          <RichContent html={module.description} className="text-foreground/90" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No content published for this module yet.
        </p>
      )}
    </div>
  );
}

function FileTree({
  modules,
  selectedId,
  onSelect,
  compact,
}: {
  modules: BatchModule[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-border bg-card font-mono",
        compact ? "text-xs" : "text-sm",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <FolderIcon open className="size-4" />
        <span className={cn("font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>
          modules
        </span>
      </div>

      <div className={cn("py-1", compact ? "max-h-[50vh] overflow-y-auto" : "")}>
        {modules.map((m) => {
          const isActive = selectedId === m.id;
          const isOddWeek = m.weekNumber % 2 === 1;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={cn(
                "group flex w-full items-center gap-2 text-left transition-colors",
                compact ? "px-3 py-1.5" : "px-4 py-2.5",
                isActive
                  ? "bg-brutal-lime/15 text-foreground"
                  : isOddWeek
                    ? "bg-muted/30 text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                    : "text-foreground/70 hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <FolderIcon
                open={isActive}
                className={cn(
                  "shrink-0 transition-colors",
                  compact ? "size-3.5" : "size-4",
                  isActive
                    ? "text-brutal-lime"
                    : "text-muted-foreground/50 group-hover:text-muted-foreground",
                )}
              />
              <span className="min-w-0 truncate">
                {m.title.toLowerCase().replace(/\s+/g, "-")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ModuleBrowserProps = {
  modules: BatchModule[];
};

export function ModuleBrowser({ modules }: ModuleBrowserProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = modules.find((m) => m.id === selectedId) ?? null;
  const [playSoftClick] = useSoftClickSound();
  const [playBack] = useBackSound();

  function handleSelect(id: string) {
    playSoftClick();
    setSelectedId(id);
  }

  function handleBack() {
    playBack();
    setSelectedId(null);
  }

  if (modules.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border p-12">
        <div className="text-center">
          <FolderIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">No modules yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Study content will appear here once modules are published.
          </p>
        </div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="mx-auto max-w-xl">
        <FileTree
          modules={modules}
          selectedId={null}
          onSelect={handleSelect}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={handleBack}
        >
          <BackArrow />
          Go Back
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1">
          <ModuleContent module={selected} />
        </div>

        <aside className="hidden shrink-0 lg:block lg:w-56 lg:pt-10">
          <div className="lg:sticky lg:top-6">
            <FileTree
              modules={modules}
              selectedId={selectedId}
              onSelect={handleSelect}
              compact
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
