"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "dotschool-theme";

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

export function ThemeToggle({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
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
        "flex size-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0 active:scale-100",
        onDark
          ? "text-white/75 hover:bg-white/10 hover:text-white"
          : "text-foreground/70 hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[1.1rem] origin-center rotate-0 transition-transform duration-200 ease-in-out motion-reduce:transition-none dark:rotate-180"
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
