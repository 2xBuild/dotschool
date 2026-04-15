import Link from "next/link";

import { Logo } from "@/components/brand/logo";

import { SiteNav } from "./site-nav";

type SiteHeaderProps = {
  /** Generic bar: brand + theme only */
  minimalNav?: boolean;
};

export function SiteHeader({ minimalNav = false }: SiteHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="inline-flex min-w-0 shrink-0 items-center no-underline"
        >
          <Logo />
        </Link>
        <SiteNav
          minimal={minimalNav}
          className="max-sm:w-full max-sm:justify-start"
        />
      </div>
    </header>
  );
}
