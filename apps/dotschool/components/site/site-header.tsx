import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

import { SiteNav } from "./site-nav";

type SiteHeaderProps = {
  /** Generic bar: brand + theme only */
  minimalNav?: boolean;
};

export function SiteHeader({ minimalNav = false }: SiteHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className={cn("mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4", !minimalNav && "flex-wrap")}>
        <Link
          href="/"
          className="inline-flex min-w-0 shrink-0 items-center no-underline"
        >
          <Logo />
        </Link>
        <SiteNav
          minimal={minimalNav}
          className={minimalNav ? "" : "max-sm:w-full max-sm:justify-start"}
        />
      </div>
    </header>
  );
}
