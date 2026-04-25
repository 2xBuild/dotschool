import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { DirectoryCountTooltip } from "@/components/directory/directory-count-tooltip";
import { DirectoryGrid } from "@/components/directory/directory-grid";
import { SiteFooter } from "@/components/site/site-footer";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { getDirectoryData } from "@/server/directory/queries";

export const metadata: Metadata = {
  title: "Directory | dotschool",
  description:
    "Meet the dotschool community — learners, mentors, and volunteers across every batch.",
};

export default async function DirectoryPage() {
  const people = await getDirectoryData();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <Link href="/" className="min-w-0 shrink-0">
            <Logo className="text-xl font-medium text-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="border-0" />
            <Link
              href="/dashboard"
              className="inline-flex rounded-full border-2 border-border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <div>
            <p className="pixel-kicker text-primary">Directory</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Everyone who is part of dotschool. Learners, volunteers, and mentors. all in one place.
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <span>
                {people.length} {people.length === 1 ? "person" : "people"}
              </span>
              <DirectoryCountTooltip />
            </div>
          </div>

          <DirectoryGrid people={people} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
