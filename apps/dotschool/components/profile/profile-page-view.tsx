import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { LogoutButton } from "@/components/profile/logout-button";
import { ProfileHeaderCard } from "@/components/profile/profile-header-card";
import { SiteFooter } from "@/components/site/site-footer";
import { ThemeToggle } from "@/components/site/theme-toggle";
import type { ProfilePageProfile } from "@/server/profile/queries";

type ProfilePageViewProps = {
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  canManageSupport: boolean;
  profile: ProfilePageProfile | null;
  usernameInputPattern: string;
  updateProfileAction: (formData: FormData) => Promise<void>;
  updateDirectoryPreferenceAction: (showInDirectory: boolean) => Promise<boolean>;
};

export function ProfilePageView({
  displayName,
  email,
  avatarUrl,
  canManageSupport,
  profile,
  usernameInputPattern,
  updateProfileAction,
  updateDirectoryPreferenceAction,
}: ProfilePageViewProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="border-b-2 border-border bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <Link href="/dashboard" className="min-w-0 shrink-0">
            <Logo className="text-lg font-medium tracking-tight text-foreground sm:text-xl" />
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle className="border-0" />
            <Link
              href="/dashboard"
              className="inline-flex rounded-full border-2 border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted sm:px-4 sm:py-2"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <ProfileHeaderCard
            displayName={displayName}
            email={email}
            avatarUrl={avatarUrl}
            canManageSupport={canManageSupport}
            username={profile?.username ?? null}
            about={profile?.about ?? null}
            provider={profile?.provider ?? null}
            socials={profile?.socials ?? null}
            showInDirectory={profile?.showInDirectory ?? true}
            usernameInputPattern={usernameInputPattern}
            updateProfileAction={updateProfileAction}
            updateDirectoryPreferenceAction={updateDirectoryPreferenceAction}
          />
        </div>
      </main>

      <div className="border-t-2 border-border bg-background px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex w-full max-w-6xl justify-center">
          <LogoutButton />
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
