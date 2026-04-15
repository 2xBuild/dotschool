import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginPanel } from "@/components/auth/login-panel";
import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/site/site-footer";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { auth } from "@/server/auth/config";

export const metadata: Metadata = {
  title: "Login | dotschool",
  description: "Sign in to access your dotschool dashboard and programs.",
};

function normalizeRedirectTo(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return "/dashboard";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

type LoginPageProps = {
  searchParams: Promise<{ redirectTo?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo: redirectToParam } = await searchParams;
  const redirectTo = normalizeRedirectTo(redirectToParam);
  const session = await auth();

  if (session?.user) {
    redirect(redirectTo);
  }

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
        <LoginPanel redirectTo={redirectTo} />
      </main>
      <SiteFooter />
    </div>
  );
}
