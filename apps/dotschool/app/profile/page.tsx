import { redirect } from "next/navigation";

import { ProfilePageView } from "@/components/profile/profile-page-view";
import { auth } from "@/server/auth/config";
import { updateProfile } from "@/server/profile/actions";
import { USERNAME_INPUT_PATTERN } from "@/server/profile/username";
import { getProfilePageData } from "@/server/profile/queries";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?redirectTo=/profile");
  }

  const email = session.user.email?.trim().toLowerCase();
  if (!email) {
    redirect("/login?redirectTo=/profile");
  }

  const { profile, canManageSupport } = await getProfilePageData(email);

  const displayName =
    profile?.name?.trim() || session.user.name?.trim() || email.split("@")[0] || "Learner";
  const avatarUrl = profile?.image?.trim() || session.user.image?.trim() || null;

  return (
    <ProfilePageView
      displayName={displayName}
      email={email}
      avatarUrl={avatarUrl}
      canManageSupport={canManageSupport}
      profile={profile}
      usernameInputPattern={USERNAME_INPUT_PATTERN}
      updateProfileAction={updateProfile}
    />
  );
}
