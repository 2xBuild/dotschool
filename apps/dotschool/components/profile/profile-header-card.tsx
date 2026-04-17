"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ArrowUpRight, BadgeCheck, PencilLine } from "lucide-react";
import { SiDiscord, SiX } from "react-icons/si";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { SubmitStatusButton } from "@/components/ui/status-button";
import { DISCORD_INVITE_URL } from "@/lib/discord";
import { cn } from "@/lib/utils";
import { useClickSound, useSoftClickSound } from "@/hooks/use-app-sound";

type Socials = {
  discord?: {
    username?: string | null;
    userId?: string | null;
  } | null;
  support?: {
    label?: string | null;
    url?: string | null;
  } | null;
  twitter?: {
    username?: string | null;
  } | null;
};

type ProfileHeaderCardProps = {
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  canManageSupport: boolean;
  username: string | null;
  about: string | null;
  provider: string | null;
  socials: Socials | null;
  usernameInputPattern: string;
  updateProfileAction: (formData: FormData) => Promise<void>;
};

const MAX_PROFILE_NAME_LENGTH = 80;
const MAX_ABOUT_LENGTH = 300;
const inputClasses =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50";

function toInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

function formatProvider(provider: string | null) {
  if (!provider) {
    return null;
  }

  return provider
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type SocialRowProps = {
  icon: ReactNode;
  label: string;
  value: string;
  placeholder: string;
  isEditing: boolean;
  inputName: string;
  linkHref?: string | null;
  linkLabel?: string;
};

function SocialRow({
  icon,
  label,
  value,
  placeholder,
  isEditing,
  inputName,
  linkHref,
  linkLabel = "Open",
}: SocialRowProps) {
  return (
    <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {isEditing ? (
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm sm:min-w-64">
              <span className="text-sm font-medium text-muted-foreground">@</span>
              <input
                type="text"
                name={inputName}
                maxLength={32}
                defaultValue={value}
                placeholder="username"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          ) : (
            <p
              className={cn(
                "text-sm",
                value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {value ? `@${value}` : placeholder}
            </p>
          )}
        </div>
      </div>

      {!isEditing && linkHref ? (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 self-start text-sm font-medium text-primary hover:underline sm:self-center"
        >
          {linkLabel}
          <ArrowUpRight className="size-3.5" />
        </a>
      ) : null}
    </div>
  );
}

export function ProfileHeaderCard({
  displayName,
  email,
  avatarUrl,
  canManageSupport,
  username,
  about,
  provider,
  socials,
  usernameInputPattern,
  updateProfileAction,
}: ProfileHeaderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const initials = toInitials(displayName);
  const providerLabel = formatProvider(provider);
  const [playClick] = useClickSound();
  const [playSoftClick] = useSoftClickSound();
  const discordUsername = socials?.discord?.username ?? "";
  const supportLabel = socials?.support?.label ?? "";
  const supportUrl = socials?.support?.url ?? "";
  const twitterUsername = socials?.twitter?.username ?? "";

  return (
    <form action={updateProfileAction} className="space-y-6">
      <Card className="rounded-4xl border border-border bg-card py-0 shadow-sm">
        <CardHeader className="border-b border-border px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-headline text-2xl leading-tight text-balance sm:text-3xl">
                Personal details
              </CardTitle>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { playSoftClick(); setIsEditing(false); }}
                  className="h-12 w-28 rounded-full"
                >
                  Cancel
                </Button>
                <SubmitStatusButton
                  idleLabel="Save"
                  className="h-12 w-28 rounded-full"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => { playClick(); setIsEditing(true); }}
                className="h-11 rounded-full px-5"
              >
                <PencilLine className="size-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="size-20 rounded-full border-2 border-border object-cover shadow-sm sm:size-24"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full border-2 border-border bg-brutal-lime text-xl font-semibold text-brutal-navy shadow-sm sm:size-24 sm:text-2xl">
                {initials || "DS"}
              </div>
            )}

            <div className="min-w-0 space-y-1">
              <p className="font-headline text-2xl leading-tight text-balance sm:text-3xl">
                {displayName}
              </p>
              <p
                className={cn(
                  "text-sm font-medium",
                  username ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {username ? `@${username}` : "No username"}
              </p>
              {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
              {providerLabel ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BadgeCheck className="size-3.5" />
                  <span>Signed in with {providerLabel}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Display name</p>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={MAX_PROFILE_NAME_LENGTH}
                  defaultValue={displayName}
                  autoComplete="name"
                  className={cn(inputClasses, "font-headline text-base")}
                />
              ) : (
                <p className="text-sm text-foreground">{displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Username</p>
              {isEditing ? (
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 shadow-sm">
                  <span className="text-sm font-medium text-muted-foreground">@</span>
                  <input
                    type="text"
                    name="username"
                    required
                    pattern={usernameInputPattern}
                    minLength={4}
                    maxLength={32}
                    defaultValue={username ?? ""}
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="nickname"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
              ) : (
                <p className={cn("text-sm", username ? "text-foreground" : "text-muted-foreground")}>
                  {username ? `@${username}` : "Not added"}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <p className="text-sm font-medium text-foreground">About</p>
              {isEditing ? (
                <textarea
                  name="about"
                  maxLength={MAX_ABOUT_LENGTH}
                  rows={4}
                  placeholder="Tell us a little about yourself..."
                  defaultValue={about ?? ""}
                  className={cn(inputClasses, "resize-none leading-6")}
                />
              ) : (
                <p className={cn("text-sm leading-6 text-pretty", about ? "text-foreground" : "text-muted-foreground")}>
                  {about || "No bio yet."}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-4xl border border-border bg-card py-0 shadow-sm">
        <CardHeader className="border-b border-border px-6 py-6 sm:px-8">
          <CardTitle className="font-headline text-xl text-balance">Socials</CardTitle>
        </CardHeader>

        <CardContent className="px-0 py-0">
          <div className="divide-y divide-border">
            <SocialRow
              label="Discord"
              icon={<SiDiscord className="size-4" />}
              value={discordUsername}
              placeholder="Not added"
              isEditing={isEditing}
              inputName="discordUsername"
              linkHref={DISCORD_INVITE_URL}
              linkLabel="Join"
            />

            <SocialRow
              label="Twitter"
              icon={<SiX className="size-4" />}
              value={twitterUsername}
              placeholder="Not added"
              isEditing={isEditing}
              inputName="twitterUsername"
              linkHref={twitterUsername ? `https://x.com/${twitterUsername}` : null}
            />

            {canManageSupport ? (
              <div className="px-6 py-4">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
                      <ArrowUpRight className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Support</p>
                      {!isEditing ? (
                        <p
                          className={cn(
                            "truncate text-sm",
                            supportUrl ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {supportUrl ? supportLabel || "Support" : "Not added"}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {!isEditing && supportUrl ? (
                    <a
                      href={supportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-primary hover:underline sm:self-center"
                    >
                      Open
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  ) : null}
                </div>

                {isEditing ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input
                      type="url"
                      name="supportUrl"
                      defaultValue={supportUrl}
                      placeholder="https://buymeacoffee.com/you"
                      autoCapitalize="none"
                      spellCheck={false}
                      autoComplete="url"
                      className={inputClasses}
                    />
                    <input
                      type="text"
                      name="supportLabel"
                      maxLength={40}
                      defaultValue={supportLabel}
                      placeholder="Support"
                      className={inputClasses}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

    </form>
  );
}
