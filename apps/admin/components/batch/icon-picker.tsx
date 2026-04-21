"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { icons as lucideIcons } from "lucide-react";
import * as SiIcons from "react-icons/si";
import type { ComponentType } from "react";

/* ------------------------------------------------------------------ */
/*  Build catalog dynamically from icon libraries                      */
/* ------------------------------------------------------------------ */

type CatalogEntry = {
  key: string;
  label: string;
  category: string;
  Icon: ComponentType<{ className?: string }>;
  kind: "brand" | "lucide";
};

/** PascalCase → kebab-case with digit separation. */
function pascalToKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();
}

/** PascalCase → human label: "BookOpen" → "Book Open" */
function pascalToLabel(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2");
}

/** Lucide icons are forwardRef objects, SI icons are plain functions. */
function isComponent(v: unknown): boolean {
  return typeof v === "function" || (typeof v === "object" && v !== null && typeof (v as { render?: unknown }).render === "function");
}

/** Clean up SI export name into a nice label. */
function siLabel(exportName: string): string {
  const raw = exportName.slice(2); // strip "Si"
  return raw
    .replace(/dotjs$/i, ".js")
    .replace(/dotnet$/i, ".NET")
    .replace(/dotts$/i, ".ts")
    .replace(/plusplus$/i, "++")
    .replace(/sharp$/i, "#")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
}

const CATALOG: CatalogEntry[] = [];

// Simple Icons → "Brand" category
for (const [name, Icon] of Object.entries(SiIcons)) {
  if (!name.startsWith("Si") || name.length <= 2 || !isComponent(Icon))
    continue;
  CATALOG.push({
    key: `si-${name.slice(2).toLowerCase()}`,
    label: siLabel(name),
    category: "Brand",
    Icon: Icon as ComponentType<{ className?: string }>,
    kind: "brand",
  });
}

// Sort brand icons alphabetically by label
CATALOG.sort((a, b) => a.label.localeCompare(b.label));

const brandCount = CATALOG.length;

// Lucide icons → "General" category
const lucideEntries: CatalogEntry[] = [];
for (const [name, Icon] of Object.entries(lucideIcons)) {
  if (!isComponent(Icon) || name[0] !== name[0].toUpperCase()) continue;
  lucideEntries.push({
    key: `lucide-${pascalToKebab(name)}`,
    label: pascalToLabel(name),
    category: "General",
    Icon: Icon as ComponentType<{ className?: string }>,
    kind: "lucide",
  });
}
lucideEntries.sort((a, b) => a.label.localeCompare(b.label));
CATALOG.push(...lucideEntries);

const CATALOG_MAP = new Map(CATALOG.map((e) => [e.key, e]));

const MAX_ICONS = 6;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type IconPickerProps = {
  value: string[];
  onChange: (keys: string[]) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return CATALOG;
    return CATALOG.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.key.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogEntry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.category) ?? [];
      list.push(entry);
      map.set(entry.category, list);
    }
    return map;
  }, [filtered]);

  function add(key: string) {
    if (value.length >= MAX_ICONS || selectedSet.has(key)) return;
    onChange([...value, key]);
  }

  function remove(key: string) {
    onChange(value.filter((k) => k !== key));
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-muted-foreground">
        Card Icons ({value.length}/{MAX_ICONS})
      </label>

      {/* Selected icons */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((key) => {
            const entry = CATALOG_MAP.get(key);
            if (!entry) return null;
            const { Icon } = entry;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs"
              >
                <Icon className="size-3.5" />
                {entry.label}
                <button
                  type="button"
                  onClick={() => remove(key)}
                  className="ml-0.5 rounded-sm p-0.5 hover:bg-muted transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Toggle picker */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {open ? "Close picker" : value.length >= MAX_ICONS ? "Change icons..." : "Add icons..."}
      </button>

      {/* Picker dropdown */}
      {open && (
        <div className="rounded-lg border border-border bg-card p-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search icons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              autoFocus
            />
          </div>

          {/* Icon grid by category */}
          <div className="max-h-72 overflow-y-auto space-y-3">
            {[...grouped.entries()].map(([category, entries]) => (
              <div key={category}>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category} ({entries.length})
                </p>
                <div className="grid grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-10">
                  {entries.map((entry) => {
                    const isSelected = selectedSet.has(entry.key);
                    const disabled = !isSelected && value.length >= MAX_ICONS;
                    const { Icon } = entry;
                    return (
                      <button
                        key={entry.key}
                        type="button"
                        title={entry.label}
                        disabled={disabled}
                        onClick={() =>
                          isSelected ? remove(entry.key) : add(entry.key)
                        }
                        className={`flex flex-col items-center gap-0.5 rounded-md p-1.5 text-[10px] transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                            : disabled
                              ? "opacity-30 cursor-not-allowed"
                              : "hover:bg-muted"
                        }`}
                      >
                        <Icon className="size-5" />
                        <span className="truncate w-full text-center leading-tight">
                          {entry.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No icons match &quot;{query}&quot;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
