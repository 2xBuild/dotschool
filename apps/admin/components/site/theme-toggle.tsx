"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "dotschool-admin-theme";

type Theme = "light" | "dark";

function resolveTheme(): Theme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle({ className }: { className?: string }) {
  useEffect(() => {
    applyTheme(resolveTheme());
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const currentTheme = document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-full border border-transparent text-foreground/70 transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[1.1rem] rotate-0 transition-transform duration-200 dark:rotate-180"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
        <path d="M12 7 17.4 3.6" />
        <path d="M12 12 19.2 7.5" />
        <path d="M12 17 17.4 13.6" />
      </svg>
    </button>
  );
}
