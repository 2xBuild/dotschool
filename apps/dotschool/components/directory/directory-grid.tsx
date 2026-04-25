"use client";

import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type Transition,
} from "motion/react";
import {
  Playlist01Icon,
  GridViewIcon,
  UserSearch01Icon,
  CheckmarkBadge01Icon,
  Medal01Icon,
  Rocket01Icon,
  School01Icon,
  CodeIcon,
  SparklesIcon,
  Certificate01Icon,
  Award02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { SiX } from "react-icons/si";
import React, { useState, useCallback, useEffect } from "react";

import { cn } from "@/lib/utils";
import {
  useBackSound,
  useSoftClickSound,
  useTabSwitchSound,
} from "@/hooks/use-app-sound";
import { roleName } from "@/lib/batch-volunteers";
import type { DirectoryPerson, DirectoryBadge } from "@/server/directory/queries";

type ViewMode = "list" | "card";

const snappySpring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 1,
};

function toInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

const BADGE_ICONS: Record<string, IconSvgElement> = {
  learner: School01Icon,
  veteran: Award02Icon,
  "test-ace": CheckmarkBadge01Icon,
  mentor: SparklesIcon,
  builder: CodeIcon,
  moderator: Certificate01Icon,
  writer: Certificate01Icon,
};

const BADGE_TONE_CLASSES: Record<DirectoryBadge["tone"], string> = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  sky: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400",
  violet: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-400",
  rose: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400",
  orange: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400",
};

/* ------------------------------------------------------------------ */
/*  Person popup                                                       */
/* ------------------------------------------------------------------ */

function PersonPopup({
  person,
  onClose,
  onDismiss,
}: {
  person: DirectoryPerson;
  onClose: () => void;
  onDismiss: () => void;
}) {
  const initials = toInitials(person.name);
  const joined = new Date(person.joinedAt);
  const joinedLabel = joined.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onDismiss]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onDismiss}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-2xl"
        initial={{ scale: 0.92, opacity: 0, filter: "blur(8px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        exit={{ scale: 0.92, opacity: 0, filter: "blur(8px)" }}
        transition={snappySpring}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>

        {/* Avatar header */}
        <div className="relative  bg-muted">
          <div className="aspect-[3/1]" />
          <div className="absolute -bottom-10 left-6">
            {person.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.image}
                alt={person.name}
                referrerPolicy="no-referrer"
                className="size-20 rounded-2xl border-none border-card object-cover shadow-sm"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-card bg-muted text-xl font-semibold text-muted-foreground shadow-sm">
                {initials || "DS"}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-14 space-y-5">
          {/* Name + username */}
          <div>
            <h3 className="font-medium text-lg text-foreground leading-tight">
              {person.name}
            </h3>
            <p className="text-sm text-muted-foreground">@{person.username}</p>
          </div>

          {/* About */}
          {person.about && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {person.about}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={Rocket01Icon} size={12} className="text-primary/70" />
              Joined {joinedLabel}
            </span>
            {person.twitter && (
              <a
                href={`https://x.com/${person.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <SiX className="size-3" />
                @{person.twitter}
              </a>
            )}
          </div>

          {/* Batches */}
          {person.batches.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-2">
                Batches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {person.batches.map((b) => (
                  <span
                    key={b.batchNumber}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-bold text-primary"
                  >
                    <HugeiconsIcon icon={Medal01Icon} size={11} className="text-yellow-500 fill-yellow-500" />
                    Batch {b.batchNumber}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Roles */}
          {person.roles.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-2">
                Roles
              </p>
              <div className="flex flex-wrap gap-1.5">
                {person.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {roleName(role)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {person.badges.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-2">
                Badges
              </p>
              <div className="flex flex-wrap gap-1.5">
                {person.badges.map((badge) => {
                  const icon = BADGE_ICONS[badge.key];
                  return (
                    <span
                      key={badge.key}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        BADGE_TONE_CLASSES[badge.tone],
                      )}
                    >
                      {icon && <HugeiconsIcon icon={icon} size={12} />}
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Person item (collection card / list row)                           */
/* ------------------------------------------------------------------ */

function PersonItem({
  person,
  view,
  onClick,
}: {
  person: DirectoryPerson;
  view: ViewMode;
  onClick: () => void;
}) {
  const initials = toInitials(person.name);
  const batchChip = person.batches.length > 0
    ? `Batch ${person.batches[person.batches.length - 1]!.batchNumber}`
    : null;

  return (
    <motion.div
      layout
      transition={snappySpring}
      onClick={onClick}
      className={cn(
        "relative flex cursor-pointer select-none",
        view === "list" && "flex-row gap-4 w-full items-center",
        view === "card" && "flex-col gap-3 w-full items-start",
      )}
    >
      {/* Image */}
      <motion.div
        layout
        transition={snappySpring}
        className={cn(
          "relative overflow-hidden shrink-0 bg-background",
          view === "list" && "w-16 h-16 rounded-2xl border border-border/50",
          view === "card" && "w-full aspect-square rounded-[1.8rem] border border-border/50 shadow-sm",
        )}
      >
        {person.image ? (
          <motion.img
            layout
            transition={snappySpring}
            src={person.image}
            alt={person.name}
            referrerPolicy="no-referrer"
            className={cn(
              "w-full h-full object-cover m-0! p-0! block",
              view === "list" && "rounded-2xl",
              view === "card" && "rounded-[1.8rem]",
            )}
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center bg-muted text-muted-foreground font-semibold text-lg">
            {initials || "DS"}
          </div>
        )}
      </motion.div>

      {/* Text + chip */}
      <motion.div
        layout
        transition={snappySpring}
        className={cn(
          "flex flex-1 justify-between items-center min-w-0",
          view === "card" ? "w-full px-1" : "px-0",
        )}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <motion.h3
            layout
            className="font-medium text-[15px] text-foreground leading-tight truncate"
          >
            {person.name}
          </motion.h3>
          <motion.div
            layout
            className="text-muted-foreground font-medium text-xs flex items-center gap-1.5"
          >
            <HugeiconsIcon
              icon={Rocket01Icon}
              size={12}
              className="text-primary/70"
            />
            <span className="truncate">@{person.username}</span>
          </motion.div>
        </div>

        {batchChip && (
          <motion.div
            layout
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold shrink-0 ml-2"
          >
            <HugeiconsIcon
              icon={Medal01Icon}
              size={10}
              className="text-yellow-500 fill-yellow-500"
            />
            <span>{batchChip}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Divider in list view */}
      {view === "list" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -bottom-2 left-20 right-0 h-px bg-border/40"
        />
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: IconSvgElement;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 text-sm font-normal uppercase transition-all rounded-full outline-none",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      )}
    >
      {active && (
        <motion.div
          layoutId="directory-tab"
          className="absolute inset-0 bg-primary rounded-full shadow-md"
          transition={snappySpring}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <HugeiconsIcon
          icon={icon}
          size={16}
          className={cn(
            "transition-transform duration-300",
            active && "scale-110",
          )}
        />
        {label}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  DirectoryGrid                                                      */
/* ------------------------------------------------------------------ */

export function DirectoryGrid({ people }: { people: DirectoryPerson[] }) {
  const [view, setView] = useState<ViewMode>("card");
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<DirectoryPerson | null>(null);
  const [playTabSwitch] = useTabSwitchSound();
  const [playExpand] = useSoftClickSound();
  const [playBack] = useBackSound();

  const onClose = useCallback(() => {
    playBack();
    setSelectedPerson(null);
  }, [playBack]);

  const onDismiss = useCallback(() => {
    setSelectedPerson(null);
  }, []);

  const handleViewChange = useCallback((nextView: ViewMode) => {
    if (view !== nextView) {
      playTabSwitch();
      setView(nextView);
    }
  }, [playTabSwitch, view]);

  const handleSelectPerson = useCallback((person: DirectoryPerson) => {
    playExpand();
    setSelectedPerson(person);
  }, [playExpand]);

  const filtered = query.trim()
    ? people.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q) ||
          p.about?.toLowerCase().includes(q) ||
          p.batches.some((b) => b.title.toLowerCase().includes(q)) ||
          p.roles.some((r) => roleName(r).toLowerCase().includes(q)) ||
          p.badges.some((b) => b.label.toLowerCase().includes(q))
        );
      })
    : people;

  return (
    <div className="w-full max-w-4xl mx-auto font-sans selection:bg-primary/10">
      <div className="flex flex-col gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex p-1 bg-muted rounded-full w-fit border border-border">
            <Tab
              active={view === "list"}
              onClick={() => handleViewChange("list")}
              icon={Playlist01Icon}
              label="List"
            />
            <Tab
              active={view === "card"}
              onClick={() => handleViewChange("card")}
              icon={GridViewIcon}
              label="Cards"
            />
          </div>

          <div className="relative w-full sm:max-w-xs">
            <HugeiconsIcon
              icon={UserSearch01Icon}
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <div className="h-px bg-border w-full" />

        {/* Content */}
        {filtered.length > 0 ? (
          <div className="relative">
            <LayoutGroup>
              <motion.div
                layout
                transition={snappySpring}
                className={cn(
                  "w-full relative",
                  view === "list" && "flex flex-col gap-4",
                  view === "card" && "grid grid-cols-2 sm:grid-cols-3 gap-4",
                )}
              >
                {filtered.map((person) => (
                  <PersonItem
                    key={person.username}
                    person={person}
                    view={view}
                    onClick={() => handleSelectPerson(person)}
                  />
                ))}
              </motion.div>
            </LayoutGroup>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {query.trim() ? "No one found matching your search." : "No one in the directory yet."}
          </p>
        )}
      </div>

      {/* Popup */}
      <AnimatePresence>
        {selectedPerson && (
          <PersonPopup
            person={selectedPerson}
            onClose={onClose}
            onDismiss={onDismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
