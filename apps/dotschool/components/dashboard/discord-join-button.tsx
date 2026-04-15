"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { SiDiscord } from "react-icons/si";

import { updateDiscordUsername } from "@/server/profile/actions";
import { cn } from "@/lib/utils";

type DiscordJoinButtonProps = {
  discordUsername: string | null;
};

const DISCORD_INVITE_URL = "https://discord.gg/dotschool";

export function DiscordJoinButton({ discordUsername }: DiscordJoinButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const linked = Boolean(discordUsername);

  function handleButtonClick() {
    if (linked) {
      window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer");
      return;
    }
    setShowForm(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateDiscordUsername(formData);
      window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer");
      setShowForm(false);
    });
  }

  if (showForm && !linked) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-stretch"
      >
        <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 shadow-sm">
          <span className="text-sm font-medium text-muted-foreground">@</span>
          <input
            type="text"
            name="discordUsername"
            required
            autoFocus
            minLength={2}
            maxLength={32}
            pattern="[a-zA-Z0-9._]{2,32}"
            placeholder="discord_handle"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {pending ? "Saving…" : "Save & join"}
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
    >
      <SiDiscord className="size-4" aria-hidden />
      Join Discord
    </button>
  );
}
