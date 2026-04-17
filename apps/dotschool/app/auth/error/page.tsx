import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/site/site-footer";
import { ThemeToggle } from "@/components/site/theme-toggle";

export const metadata: Metadata = {
  title: "Authentication Error | dotschool",
  description: "Something went wrong during authentication.",
};

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server error",
    description:
      "There is a problem with the server configuration. Please try again later.",
  },
  AccessDenied: {
    title: "Access denied",
    description: "You do not have permission to sign in.",
  },
  Verification: {
    title: "Verification failed",
    description:
      "The verification link may have expired or already been used. Please try signing in again.",
  },
  EmailExists: {
    title: "Email already registered",
    description:
      "This email is already linked to another provider. Please sign in with the original provider.",
  },
  Default: {
    title: "Something went wrong",
    description:
      "An unexpected error occurred during authentication. Please try again.",
  },
};

type ErrorPageProps = {
  searchParams: Promise<{ error?: string; provider?: string }>;
};

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const { error, provider } = await searchParams;
  const { title, description } =
    errorMessages[error ?? ""] ?? errorMessages.Default;

  return (
    <div className="bg-background text-foreground">
      <header className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <Link href="/" className="inline-flex min-w-0 shrink-0 items-center">
            <Logo className="text-xl font-medium text-foreground" />
          </Link>
          <ThemeToggle className="rounded-full border border-border bg-card" />
        </div>
      </header>

      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-6 px-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7 text-red-600 dark:text-red-400"
              aria-hidden
            >
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {error === "EmailExists" && provider ? (
                <>
                  This email is already registered with{" "}
                  <span className="font-semibold text-foreground">
                    {provider}
                  </span>
                  . Please sign in with {provider} instead.
                </>
              ) : (
                description
              )}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Back to login
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Go to homepage
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
