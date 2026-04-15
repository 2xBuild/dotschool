import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/site/site-footer";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { VolunteerPageContent } from "@/components/volunteer/volunteer-page-content";
import { auth } from "@/server/auth/config";

export const metadata: Metadata = {
  title: "Volunteer | dotschool",
  description:
    "Join dotschool as a volunteer and help keep serious tech education free, open, and community-led.",
};

export default async function VolunteerPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const email = session?.user?.email?.trim().toLowerCase() ?? null;
  const isSignedIn = Boolean(userId && email);
  const userName =
    session?.user?.name?.trim() || (email ? email.split("@")[0] : "") || "";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="min-w-0 shrink-0">
            <Logo className="text-xl font-medium text-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="border-0" />
            <Link
              href={isSignedIn ? "/dashboard" : "/login?redirectTo=/volunteer"}
              className="inline-flex rounded-full btn-blue px-4 py-2 text-sm font-semibold transition-colors"
            >
              {isSignedIn ? "Dashboard" : "Log in"}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <VolunteerPageContent isSignedIn={isSignedIn} userName={userName} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
