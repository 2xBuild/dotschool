"use client";

import { icons as lucideIcons, type LucideIcon } from "lucide-react";
import * as SiIcons from "react-icons/si";
import type { ComponentType } from "react";

export type BatchCardIconKind = "brand" | "lucide";

export type ResolvedBatchCardIcon = {
  key: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }> | LucideIcon;
  kind: BatchCardIconKind;
};

type RegistryEntry = {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }> | LucideIcon;
  kind: BatchCardIconKind;
};

/** Convert PascalCase to kebab-case, treating digits as separate segments. */
function pascalToKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();
}

/** Lucide icons are forwardRef objects, SI icons are plain functions. */
function isComponent(v: unknown): boolean {
  return typeof v === "function" || (typeof v === "object" && v !== null && typeof (v as { render?: unknown }).render === "function");
}

/* ------------------------------------------------------------------ */
/*  Build registry dynamically from icon libraries                     */
/* ------------------------------------------------------------------ */

const REGISTRY: Record<string, RegistryEntry> = {};

// All Lucide icons: BookOpen → "lucide-book-open"
for (const [name, Icon] of Object.entries(lucideIcons)) {
  if (!isComponent(Icon) || name[0] !== name[0].toUpperCase()) continue;
  REGISTRY[`lucide-${pascalToKebab(name)}`] = {
    Icon: Icon as LucideIcon,
    kind: "lucide",
  };
}

// All Simple Icons: SiReact → "si-react"
for (const [name, Icon] of Object.entries(SiIcons)) {
  if (!name.startsWith("Si") || name.length <= 2 || !isComponent(Icon))
    continue;
  REGISTRY[`si-${name.slice(2).toLowerCase()}`] = {
    Icon: Icon as ComponentType,
    kind: "brand",
  };
}

// Legacy aliases for DB keys that don't match current react-icons export names
const LEGACY_ALIASES: Record<string, string> = {
  "si-csharp": "si-sharp",
  "si-css3": "si-css",
  "si-nuxtdotjs": "si-nuxt",
};

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function resolveBatchCardIcons(
  keys: string[],
): ResolvedBatchCardIcon[] {
  const out: ResolvedBatchCardIcon[] = [];
  for (const raw of keys) {
    const key = raw.trim().toLowerCase();
    const canonical = LEGACY_ALIASES[key] ?? key;
    const entry = REGISTRY[canonical];
    if (entry) {
      out.push({ key, Icon: entry.Icon, kind: entry.kind });
    }
  }
  return out;
}
