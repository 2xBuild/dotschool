"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { SiDiscord, SiGithub } from "react-icons/si";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";

const providers = [
  { id: "google", label: "Google", Icon: FcGoogle, iconCls: "" },
  {
    id: "github",
    label: "GitHub",
    Icon: SiGithub,
    iconCls: "text-[#24292f] dark:text-white",
  },
  {
    id: "discord",
    label: "Discord",
    Icon: SiDiscord,
    iconCls: "text-[#5865f2]",
  },
] as const;

export default function LoginPage() {
  return (
    <div className="bg-background text-foreground">
      <header className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <Link href="/" className="inline-flex min-w-0 shrink-0 items-center">
            <Logo className="text-xl" />
          </Link>
          <ThemeToggle className="rounded-full border border-border bg-card" />
        </div>
      </header>

      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-8 px-4">
          <div className="flex flex-col items-center gap-3">
            <Logo className="text-2xl" />
            <p className="text-center text-sm text-muted-foreground">
              Login with any of the given method
            </p>
          </div>

          <div className="space-y-2">
            {providers.map(({ id, label, Icon, iconCls }) => (
              <button
                key={id}
                type="button"
                onClick={() => signIn(id, { redirectTo: "/" })}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Icon className={`size-5 shrink-0 ${iconCls}`} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        © 2026 dotschool admin
      </footer>
    </div>
  );
}
