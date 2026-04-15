"use client";

import Link from "next/link";
import { useState } from "react";
import type { Session } from "next-auth";

import { Logo } from "@/components/brand/logo";
import { BatchTabs, type BatchTabItem } from "@/components/dashboard/batch-tabs";
import { DiscordJoinButton } from "@/components/dashboard/discord-join-button";
import {
  PossibleBatches,
  type PossibleBatchItem,
} from "@/components/dashboard/possible-batches";
import { SiteFooter } from "@/components/site/site-footer";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useSoftClickSound } from "@/hooks/use-app-sound";

type DashboardProfile = {
  name: string | null;
  username: string;
  image: string | null;
};

const ERROR_MESSAGES: Record<string, string> = {
  "not-enrolled": "You need to join the batch before taking the entrance test.",
  "batch-not-found": "The batch you're looking for doesn't exist.",
  "missing-batch": "No batch was specified for the test.",
  "account-not-found": "Your account could not be found. Please try signing in again.",
  "test-unavailable": "The entrance test is not available for this batch yet.",
};

type DashboardHomeProps = {
  user: Session["user"];
  profile: DashboardProfile | null;
  discordUsername: string | null;
  isInDiscordServer: boolean;
  upcoming: BatchTabItem[];
  yourBatches: BatchTabItem[];
  possibleBatches: PossibleBatchItem[];
  canVotePossibleBatches: boolean;
  error: string | null;
};

function toInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pt-6">
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/50 dark:bg-red-950/30">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-red-600 dark:text-red-400" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <p className="flex-1 text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-red-400 transition-colors hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function DashboardHome({
  user,
  profile,
  discordUsername,
  isInDiscordServer,
  upcoming,
  yourBatches,
  possibleBatches,
  canVotePossibleBatches,
  error,
}: DashboardHomeProps) {
  const [playSoftClick] = useSoftClickSound();
  const [showError, setShowError] = useState(!!error);
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.") : null;

  const displayName =
    profile?.name?.trim() || user?.name?.trim() || user?.email?.split("@")[0] || "Learner";
  const initials = toInitials(displayName);
  const avatarUrl = profile?.image?.trim() || user?.image?.trim() || null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="border-b-2 border-border bg-background">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/dashboard" className="min-w-0 shrink-0">
            <Logo className="text-xl font-medium tracking-tight text-foreground" />
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="border-0" />
            <Link
              href="/profile"
              className="flex h-8 min-w-0 max-w-[14rem] items-center gap-1.5 rounded-full border-2 border-border bg-card pl-1 pr-2.5 transition-colors hover:bg-muted"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-6 shrink-0 rounded-full border border-border object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-brutal-lime text-[10px] font-semibold leading-none text-brutal-navy">
                  {initials || "DS"}
                </div>
              )}
              <span className="truncate text-xs font-medium">{displayName}</span>
            </Link>
          </div>
        </div>
      </header>

      {showError && errorMessage && (
        <ErrorBanner message={errorMessage} onDismiss={() => { playSoftClick(); setShowError(false); }} />
      )}

      <main className="flex-1 px-6 py-10 sm:py-14">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-14">
          <BatchTabs
            upcoming={upcoming}
            yourBatches={yourBatches}
          >
            <PossibleBatches
              items={possibleBatches}
              canVote={canVotePossibleBatches}
            />
          </BatchTabs>

          {!isInDiscordServer && (
            <div className="mt-24 flex flex-col items-center gap-3 sm:mt-32">
              <p className="text-sm text-muted-foreground">
                Stay in touch with dotschool community
              </p>
              <DiscordJoinButton discordUsername={discordUsername} />
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
