"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { SiDiscord, SiGithub } from "react-icons/si";
import type { IconType } from "react-icons";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { useClickSound } from "@/hooks/use-app-sound";

const providers = [
  {
    id: "google" as const,
    label: "Google",
    Icon: FcGoogle,
    iconClassName: "",
  },
  {
    id: "github" as const,
    label: "GitHub",
    Icon: SiGithub,
    iconClassName: "text-[#24292f] dark:text-white",
  },
  {
    id: "discord" as const,
    label: "Discord",
    Icon: SiDiscord,
    iconClassName: "text-[#5865f2]",
  },
] as const satisfies ReadonlyArray<{
  id: "google" | "github" | "discord";
  label: string;
  Icon: IconType;
  iconClassName: string;
}>;

type LoginPanelProps = {
  redirectTo?: string;
  className?: string;
};

export function LoginPanel({
  redirectTo = "/dashboard",
  className,
}: LoginPanelProps) {
  const [playClick] = useClickSound();

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-sm space-y-8 px-4",
        className,
      )}
      aria-labelledby="login-heading"
    >
      <div className="flex flex-col items-center gap-3">
        <Logo className="text-2xl" />
        <p
          id="login-heading"
          className="text-center text-sm text-muted-foreground"
        >
          Login with any of the given method
        </p>
      </div>

      <div className="space-y-2">
        {providers.map(({ id, label, Icon, iconClassName }) => (
          <button
            key={id}
            type="button"
            onClick={() => { playClick(); void signIn(id, { redirectTo }); }}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Icon className={cn("size-5 shrink-0", iconClassName)} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By signing in you agree to our{" "}
        <a href="/terms" className="underline hover:text-foreground">
          Terms &amp; Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
