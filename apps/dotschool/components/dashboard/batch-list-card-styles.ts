import {
  BookOpen,
  CalendarRange,
  GraduationCap,
  type LucideIcon,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const shellBase =
  "relative isolate w-full overflow-hidden rounded-[1.25rem] border px-5 py-4 sm:rounded-[1.45rem] sm:px-6 sm:py-4";

export const BATCH_CARD_DECORATIVE_ICONS: LucideIcon[] = [
  CalendarRange,
  Users,
  GraduationCap,
  BookOpen,
];

export function batchDecorativeIconAt(index: number): LucideIcon {
  return BATCH_CARD_DECORATIVE_ICONS[
    index % BATCH_CARD_DECORATIVE_ICONS.length
  ]!;
}

export type BatchListCardTone = "outline" | "blue" | "lime" | "navy" | "mint" | "warm";

const TONE_ROTATION: BatchListCardTone[] = ["outline", "blue"];

export function batchListCardToneAt(index: number): BatchListCardTone {
  return TONE_ROTATION[index % TONE_ROTATION.length]!;
}

export type BatchListCardStyleSet = {
  card: string;
  bgIcon: string;
  backdropLucide: string;
  backdropBrand: string;
  batchKicker: string;
  metaPanel: string;
  metaLabel: string;
  metaValue: string;
  iconBox: string;
  icon: string;
  title: string;
  muted: string;
  secondaryBtn: string;
  primaryBtn: string;
  voteDefault: string;
  voteActive: string;
  seatsLabel: string;
  seatsSep: string;
  avatarGroupChip: string;
  progressFill: string;
  detailPanel: string;
  tagChip: string;
  tagIcon: string;
};

const toneStyles: Record<BatchListCardTone, () => BatchListCardStyleSet> = {
  /* ── Outline → No background, border only ─────────────────────── */
  outline: () => ({
    card: cn(
      shellBase,
      "bg-transparent border-2 border-border/80 text-foreground dark:border-border",
    ),
    bgIcon: "text-muted-foreground/[0.06]",
    backdropLucide: "text-muted-foreground/[0.05]",
    backdropBrand: "text-muted-foreground/[0.06]",
    batchKicker:
      "text-[0.62rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground/65",
    metaPanel:
      "rounded-md border border-border bg-card px-2 py-1.5",
    metaLabel:
      "text-[0.54rem] sm:text-[0.58rem] font-semibold uppercase tracking-widest text-muted-foreground/65",
    metaValue:
      "text-[0.8rem] sm:text-[0.86rem] font-semibold tabular-nums text-foreground",
    iconBox:
      "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card sm:size-12 sm:rounded-xl",
    icon: "text-[#2f79f6] dark:text-[#7db1ff]",
    title:
      "font-headline text-[1.25rem] leading-[1.12] sm:text-[1.4rem] text-foreground",
    muted:
      "text-sm sm:text-[0.95rem] text-muted-foreground",
    secondaryBtn:
      "border border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2",
    primaryBtn:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteDefault:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteActive:
      "border border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground text-xs sm:text-sm",
    seatsLabel: "font-medium text-muted-foreground",
    seatsSep: "text-muted-foreground/45",
    avatarGroupChip:
      "border-border bg-card",
    progressFill: "bg-[#2f79f6]",
    detailPanel:
      "rounded-xl border border-border bg-card p-3 sm:rounded-2xl sm:p-4",
    tagChip:
      "inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-foreground",
    tagIcon: "text-[#2f79f6]",
  }),

  /* ── Blue → Solid blue card ───────────────────────────────────── */
  blue: () => ({
    card: cn(
      shellBase,
      "bg-[#2f79f6] border-[#175dd2]/45 text-white",
    ),
    bgIcon: "text-white/[0.14]",
    backdropLucide: "text-white/[0.10]",
    backdropBrand: "text-white/[0.14]",
    batchKicker:
      "text-[0.62rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/72",
    metaPanel: "rounded-md border border-white/25 bg-white/[0.14] px-2 py-1.5",
    metaLabel:
      "text-[0.54rem] sm:text-[0.58rem] font-semibold uppercase tracking-widest text-white/65",
    metaValue:
      "text-[0.8rem] sm:text-[0.86rem] font-semibold tabular-nums text-white",
    iconBox:
      "flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.2] bg-white/[0.14] sm:size-12 sm:rounded-xl",
    icon: "text-white",
    title:
      "font-headline text-[1.25rem] leading-[1.12] sm:text-[1.4rem] text-white",
    muted:
      "text-sm sm:text-[0.95rem] text-white/75",
    secondaryBtn:
      "border border-white/35 bg-white/[0.14] text-white hover:border-white/60 hover:bg-white/[0.24] hover:text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2",
    primaryBtn:
      "border border-white/70 bg-white text-[#2f79f6] hover:border-white hover:bg-[#f3f8ff] hover:text-[#1d5ca9] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 font-semibold",
    voteDefault:
      "border border-white/70 bg-white text-[#2f79f6] hover:border-white hover:bg-[#f3f8ff] hover:text-[#1d5ca9] text-xs sm:text-sm font-semibold",
    voteActive:
      "border border-white/35 bg-white/[0.14] text-white hover:border-white/60 hover:bg-white/[0.24] hover:text-white text-xs sm:text-sm",
    seatsLabel: "font-medium text-white/80",
    seatsSep: "text-white/30",
    avatarGroupChip:
      "border-[#2f79f6] bg-white/[0.16]",
    progressFill: "bg-white",
    detailPanel:
      "rounded-xl border border-white/20 bg-white/[0.12] p-3 sm:rounded-2xl sm:p-4",
    tagChip:
      "inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/[0.16] px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-white/90",
    tagIcon: "text-white/90",
  }),

  /* ── Lime → Soft sky card ───────────────────────────────────────── */
  lime: () => ({
    card: cn(
      shellBase,
      "bg-[#d6e8ff] border-[#b0ceff] text-[#10345d]",
      "dark:bg-[#13243b] dark:border-[#2a4b73] dark:text-[#e1eeff]",
    ),
    bgIcon: "text-[#1d5ca9]/[0.09]",
    backdropLucide: "text-[#1d5ca9]/[0.1]",
    backdropBrand: "text-[#1d5ca9]/[0.11]",
    batchKicker:
      "text-[0.62rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#15467d]/65 dark:text-[#9fc5ff]/85",
    metaPanel:
      "rounded-md border border-[#b5d2ff] bg-white/[0.84] px-2 py-1.5 dark:border-[#365b87] dark:bg-[#1a3454]",
    metaLabel:
      "text-[0.54rem] sm:text-[0.58rem] font-semibold uppercase tracking-widest text-[#1d5ca9]/65 dark:text-[#9fc5ff]/75",
    metaValue:
      "text-[0.8rem] sm:text-[0.86rem] font-semibold tabular-nums text-[#10345d] dark:text-[#e8f2ff]",
    iconBox:
      "flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#b5d2ff] bg-white/[0.84] sm:size-12 sm:rounded-xl dark:border-[#365b87] dark:bg-[#1a3454]",
    icon: "text-[#1d5ca9] dark:text-[#c2dcff]",
    title:
      "font-headline text-[1.25rem] leading-[1.12] sm:text-[1.4rem] text-[#10345d] dark:text-[#e8f2ff]",
    muted:
      "text-sm sm:text-[0.95rem] text-[#1a4f8d]/75 dark:text-[#b8d5ff]/82",
    secondaryBtn:
      "border border-[#a6c8ff] bg-white/90 text-[#0f3f74] hover:border-[#7aaef7] hover:bg-[#f4f9ff] hover:text-[#0b3768] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 dark:border-[#3b6391] dark:bg-[#1a3454] dark:text-[#d6e8ff] dark:hover:border-[#5a85b8] dark:hover:bg-[#244569] dark:hover:text-white",
    primaryBtn:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteDefault:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteActive:
      "border border-[#a6c8ff] bg-white/90 text-[#0f3f74] hover:border-[#7aaef7] hover:bg-[#f4f9ff] hover:text-[#0b3768] text-xs sm:text-sm dark:border-[#3b6391] dark:bg-[#1a3454] dark:text-[#d6e8ff] dark:hover:border-[#5a85b8] dark:hover:bg-[#244569] dark:hover:text-white",
    seatsLabel: "font-medium text-[#1a4f8d]/85",
    seatsSep: "text-[#1a4f8d]/45",
    avatarGroupChip:
      "border-[#e8f2ff] bg-white/[0.85] dark:border-[#13243b] dark:bg-[#2a4b73]",
    progressFill: "bg-[#2f79f6]",
    detailPanel:
      "rounded-xl border border-[#b5d2ff] bg-white/[0.78] p-3 sm:rounded-2xl sm:p-4 dark:border-[#365b87] dark:bg-[#1a3454]",
    tagChip:
      "inline-flex items-center gap-1 rounded-full border border-[#a6c8ff] bg-white/85 px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-[#0f3f74]",
    tagIcon: "text-[#2f79f6]",
  }),

  /* ── Mint → Clean white-blue card ───────────────────────────────── */
  mint: () => ({
    card: cn(
      shellBase,
      "bg-[#e0edff] border-[#c2d9ff] text-[#0f345c]",
      "dark:bg-[#172841] dark:border-[#304f79] dark:text-[#e1eeff]",
    ),
    bgIcon: "text-[#1d5ca9]/[0.06]",
    backdropLucide: "text-[#1d5ca9]/[0.07]",
    backdropBrand: "text-[#1d5ca9]/[0.08]",
    batchKicker:
      "text-[0.62rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#15467d]/65 dark:text-[#9fc5ff]/85",
    metaPanel:
      "rounded-md border border-[#c7ddff] bg-white px-2 py-1.5 dark:border-[#3a618f] dark:bg-[#1d3656]",
    metaLabel:
      "text-[0.54rem] sm:text-[0.58rem] font-semibold uppercase tracking-widest text-[#1d5ca9]/65 dark:text-[#9fc5ff]/75",
    metaValue:
      "text-[0.8rem] sm:text-[0.86rem] font-semibold tabular-nums text-[#10345d] dark:text-[#e8f2ff]",
    iconBox:
      "flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#c7ddff] bg-white sm:size-12 sm:rounded-xl dark:border-[#3a618f] dark:bg-[#1d3656]",
    icon: "text-[#1d5ca9] dark:text-[#c2dcff]",
    title:
      "font-headline text-[1.25rem] leading-[1.12] sm:text-[1.4rem] text-[#10345d] dark:text-[#e8f2ff]",
    muted:
      "text-sm sm:text-[0.95rem] text-[#1a4f8d]/70 dark:text-[#b8d5ff]/82",
    secondaryBtn:
      "border border-[#a6c8ff] bg-white text-[#0f3f74] hover:border-[#7aaef7] hover:bg-[#f1f7ff] hover:text-[#0b3768] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 dark:border-[#3b6391] dark:bg-[#1d3656] dark:text-[#d6e8ff] dark:hover:border-[#5a85b8] dark:hover:bg-[#244569] dark:hover:text-white",
    primaryBtn:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteDefault:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteActive:
      "border border-[#a6c8ff] bg-white text-[#0f3f74] hover:border-[#7aaef7] hover:bg-[#f1f7ff] hover:text-[#0b3768] text-xs sm:text-sm dark:border-[#3b6391] dark:bg-[#1d3656] dark:text-[#d6e8ff] dark:hover:border-[#5a85b8] dark:hover:bg-[#244569] dark:hover:text-white",
    seatsLabel: "font-medium text-[#1a4f8d]/85",
    seatsSep: "text-[#1a4f8d]/45",
    avatarGroupChip:
      "border-white bg-[#eef5ff] dark:border-[#172841] dark:bg-[#2f517e]",
    progressFill: "bg-[#2f79f6]",
    detailPanel:
      "rounded-xl border border-[#c7ddff] bg-[#f3f8ff] p-3 sm:rounded-2xl sm:p-4 dark:border-[#3a618f] dark:bg-[#1d3656]",
    tagChip:
      "inline-flex items-center gap-1 rounded-full border border-[#a6c8ff] bg-white px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-[#0f3f74]",
    tagIcon: "text-[#2f79f6]",
  }),

  /* ── Warm → Light / white card ──────────────────────────────────── */
  warm: () => ({
    card: cn(
      shellBase,
      "bg-[#f5f8fc] border-[#dce4ef] text-[#1a2940]",
      "dark:bg-[#1c2535] dark:border-[#2e3d52] dark:text-[#e4ecf7]",
    ),
    bgIcon: "text-[#94a8c4]/[0.10]",
    backdropLucide: "text-[#94a8c4]/[0.08]",
    backdropBrand: "text-[#94a8c4]/[0.10]",
    batchKicker:
      "text-[0.62rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#5b7291]/65 dark:text-[#a4b8d2]/85",
    metaPanel:
      "rounded-md border border-[#dce4ef] bg-white px-2 py-1.5 dark:border-[#3a4a60] dark:bg-[#243045]",
    metaLabel:
      "text-[0.54rem] sm:text-[0.58rem] font-semibold uppercase tracking-widest text-[#5b7291]/65 dark:text-[#a4b8d2]/75",
    metaValue:
      "text-[0.8rem] sm:text-[0.86rem] font-semibold tabular-nums text-[#1a2940] dark:text-[#e8f0fb]",
    iconBox:
      "flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#dce4ef] bg-white sm:size-12 sm:rounded-xl dark:border-[#3a4a60] dark:bg-[#243045]",
    icon: "text-[#2f79f6] dark:text-[#7db1ff]",
    title:
      "font-headline text-[1.25rem] leading-[1.12] sm:text-[1.4rem] text-[#1a2940] dark:text-[#e8f0fb]",
    muted:
      "text-sm sm:text-[0.95rem] text-[#5b7291]/75 dark:text-[#a4b8d2]/82",
    secondaryBtn:
      "border border-[#cdd6e3] bg-white text-[#1a2940] hover:border-[#b0bdd0] hover:bg-[#f0f4f9] hover:text-[#0f1e33] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 dark:border-[#3a4a60] dark:bg-[#243045] dark:text-[#d6e2f2] dark:hover:border-[#5a6e88] dark:hover:bg-[#2e3f58] dark:hover:text-white",
    primaryBtn:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteDefault:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteActive:
      "border border-[#cdd6e3] bg-white text-[#1a2940] hover:border-[#b0bdd0] hover:bg-[#f0f4f9] hover:text-[#0f1e33] text-xs sm:text-sm dark:border-[#3a4a60] dark:bg-[#243045] dark:text-[#d6e2f2] dark:hover:border-[#5a6e88] dark:hover:bg-[#2e3f58] dark:hover:text-white",
    seatsLabel: "font-medium text-[#5b7291]/85",
    seatsSep: "text-[#5b7291]/45",
    avatarGroupChip:
      "border-white bg-[#f0f4f9] dark:border-[#1c2535] dark:bg-[#3a4a60]",
    progressFill: "bg-[#2f79f6]",
    detailPanel:
      "rounded-xl border border-[#dce4ef] bg-white/90 p-3 sm:rounded-2xl sm:p-4 dark:border-[#3a4a60] dark:bg-[#243045]",
    tagChip:
      "inline-flex items-center gap-1 rounded-full border border-[#cdd6e3] bg-white px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-[#1a2940]",
    tagIcon: "text-[#2f79f6]",
  }),

  /* ── Navy (fallback) ────────────────────────────────────────────── */
  navy: () => ({
    card: cn(
      shellBase,
      "bg-[#cce0ff] border-[#a8caff] text-[#10345d]",
      "dark:bg-[#102338] dark:border-[#27486f] dark:text-[#e1eeff]",
    ),
    bgIcon: "text-[#1d5ca9]/[0.09]",
    backdropLucide: "text-[#1d5ca9]/[0.09]",
    backdropBrand: "text-[#1d5ca9]/[0.1]",
    batchKicker:
      "text-[0.62rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#15467d]/65 dark:text-[#9fc5ff]/85",
    metaPanel:
      "rounded-md border border-[#b5d2ff] bg-white/[0.84] px-2 py-1.5 dark:border-[#365b87] dark:bg-[#17314f]",
    metaLabel:
      "text-[0.54rem] sm:text-[0.58rem] font-semibold uppercase tracking-widest text-[#1d5ca9]/65 dark:text-[#9fc5ff]/75",
    metaValue:
      "text-[0.8rem] sm:text-[0.86rem] font-semibold tabular-nums text-[#10345d] dark:text-[#e8f2ff]",
    iconBox:
      "flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#b5d2ff] bg-white/[0.84] sm:size-12 sm:rounded-xl dark:border-[#365b87] dark:bg-[#17314f]",
    icon: "text-[#1d5ca9] dark:text-[#c2dcff]",
    title:
      "font-headline text-[1.25rem] leading-[1.12] sm:text-[1.4rem] text-[#10345d] dark:text-[#e8f2ff]",
    muted:
      "text-sm sm:text-[0.95rem] text-[#1a4f8d]/72 dark:text-[#b8d5ff]/82",
    secondaryBtn:
      "border border-[#a6c8ff] bg-white/90 text-[#0f3f74] hover:border-[#7aaef7] hover:bg-[#f4f9ff] hover:text-[#0b3768] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 dark:border-[#3b6391] dark:bg-[#17314f] dark:text-[#d6e8ff] dark:hover:border-[#5a85b8] dark:hover:bg-[#204063] dark:hover:text-white",
    primaryBtn:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteDefault:
      "border border-[#2f79f6]/70 bg-[#2f79f6] text-white hover:border-[#2468dc] hover:bg-[#2468dc] text-xs sm:text-sm dark:border-[#6ea6ff] dark:bg-[#2f79f6] dark:text-white dark:hover:border-[#87b5ff] dark:hover:bg-[#3d87ff]",
    voteActive:
      "border border-[#a6c8ff] bg-white/90 text-[#0f3f74] hover:border-[#7aaef7] hover:bg-[#f4f9ff] hover:text-[#0b3768] text-xs sm:text-sm dark:border-[#3b6391] dark:bg-[#17314f] dark:text-[#d6e8ff] dark:hover:border-[#5a85b8] dark:hover:bg-[#204063] dark:hover:text-white",
    seatsLabel: "font-medium text-[#1a4f8d]/85",
    seatsSep: "text-[#1a4f8d]/45",
    avatarGroupChip:
      "border-[#e1efff] bg-white/[0.9] dark:border-[#102338] dark:bg-[#2a4b73]",
    progressFill: "bg-[#2f79f6]",
    detailPanel:
      "rounded-xl border border-[#b5d2ff] bg-white/[0.78] p-3 sm:rounded-2xl sm:p-4 dark:border-[#365b87] dark:bg-[#17314f]",
    tagChip:
      "inline-flex items-center gap-1 rounded-full border border-[#a6c8ff] bg-white/85 px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-[#0f3f74]",
    tagIcon: "text-[#2f79f6]",
  }),
};

export function batchListCardStyles(
  tone: BatchListCardTone = "lime",
): BatchListCardStyleSet {
  return toneStyles[tone]();
}
