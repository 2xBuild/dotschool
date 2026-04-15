import * as React from "react"

import { cn } from "./utils"

type BadgeCardVariant = "active" | "completed" | "locked"
type BadgeCardTone = "emerald" | "gold" | "bronze" | "ocean" | "ruby" | "sunset" | "teal"

type BadgeCardProps = {
  variant?: BadgeCardVariant
  tone?: BadgeCardTone
  icon: React.ReactNode
  value?: string
  title: string
  label: string
  subtitle?: string
  className?: string
}

const toneByVariant: Record<BadgeCardVariant, BadgeCardTone> = {
  active: "emerald",
  completed: "gold",
  locked: "bronze",
}

const palette: Record<
  BadgeCardTone,
  {
    iconWrap: string
    valueChip: string
    subtitleText: string
    accentBar: string
  }
> = {
  emerald: {
    iconWrap: "border-emerald-200 bg-emerald-50 text-emerald-700",
    valueChip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    subtitleText: "text-emerald-700/90",
    accentBar: "bg-emerald-500/80",
  },
  gold: {
    iconWrap: "border-amber-200 bg-amber-50 text-amber-700",
    valueChip: "border-amber-200 bg-amber-50 text-amber-700",
    subtitleText: "text-amber-700/90",
    accentBar: "bg-amber-500/80",
  },
  bronze: {
    iconWrap: "border-stone-200 bg-stone-50 text-stone-700",
    valueChip: "border-stone-200 bg-stone-50 text-stone-700",
    subtitleText: "text-stone-700/90",
    accentBar: "bg-stone-500/80",
  },
  ocean: {
    iconWrap: "border-sky-200 bg-sky-50 text-sky-700",
    valueChip: "border-sky-200 bg-sky-50 text-sky-700",
    subtitleText: "text-sky-700/90",
    accentBar: "bg-sky-500/80",
  },
  ruby: {
    iconWrap: "border-rose-200 bg-rose-50 text-rose-700",
    valueChip: "border-rose-200 bg-rose-50 text-rose-700",
    subtitleText: "text-rose-700/90",
    accentBar: "bg-rose-500/80",
  },
  sunset: {
    iconWrap: "border-orange-200 bg-orange-50 text-orange-700",
    valueChip: "border-orange-200 bg-orange-50 text-orange-700",
    subtitleText: "text-orange-700/90",
    accentBar: "bg-orange-500/80",
  },
  teal: {
    iconWrap: "border-teal-200 bg-teal-50 text-teal-700",
    valueChip: "border-teal-200 bg-teal-50 text-teal-700",
    subtitleText: "text-teal-700/90",
    accentBar: "bg-teal-500/80",
  },
}

function BadgeCard({
  variant = "active",
  tone,
  icon,
  value,
  title,
  label,
  subtitle,
  className,
}: BadgeCardProps) {
  const resolvedTone = tone ?? toneByVariant[variant]
  const p = palette[resolvedTone]

  return (
    <article
      className={cn(
        "flex h-full w-full flex-col rounded-2xl border border-border bg-card p-4",
        variant === "locked" && "opacity-80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border [&_svg]:h-5 [&_svg]:w-5",
            p.iconWrap,
          )}
        >
          {icon}
        </div>
        {value ? (
          <span
            className={cn(
              "inline-flex min-h-8 min-w-8 items-center justify-center rounded-full border px-2.5 text-xs font-semibold tabular-nums",
              p.valueChip,
            )}
          >
            {value.trim()}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        {subtitle ? (
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.08em]", p.subtitleText)}>
            {subtitle}
          </p>
        ) : null}
        <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{title}</p>
        <p className="mt-2 min-h-[2.75rem] text-xs leading-5 text-muted-foreground">
          {label}
        </p>
      </div>

      <div
        className={cn(
          "mt-4 h-1 w-14 rounded-full",
          variant === "locked" ? "bg-muted-foreground/40" : p.accentBar,
        )}
      />
    </article>
  )
}

export { BadgeCard }
export type { BadgeCardProps, BadgeCardTone, BadgeCardVariant }
