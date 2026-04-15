"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/site/theme-toggle";

const links = [
  { href: "/mission", label: "Mission" },
  { href: "/fund", label: "Fund" },
] as const;

type SiteNavProps = {
  className?: string;
  /** High-contrast links on dark landing-style headers */
  variant?: "default" | "onDark";
  /** Logo + theme only; no in-site nav links */
  minimal?: boolean;
};

export function SiteNav({
  className,
  variant = "default",
  minimal = false,
}: SiteNavProps) {
  const pathname = usePathname();
  const onDark = variant === "onDark";

  return (
    <nav
      className={cn(
        "flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm",
        className,
      )}
      aria-label="Site"
    >
      {!minimal &&
        links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "transition-colors",
                onDark
                  ? active
                    ? "font-medium text-white"
                    : "text-zinc-500 hover:text-white"
                  : active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      <ThemeToggle onDark={onDark} />
    </nav>
  );
}
