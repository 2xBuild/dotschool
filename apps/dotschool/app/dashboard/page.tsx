import { redirect } from "next/navigation";

import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { auth } from "@/server/auth/config";
import { getDashboardData } from "@/server/dashboard/queries";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const { error: errorParam } = await searchParams;

  if (!session?.user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const email = session.user.email?.trim().toLowerCase();
  if (!email) {
    redirect("/login?redirectTo=/dashboard");
  }

  const data = await getDashboardData(email);

  const error = typeof errorParam === "string" ? errorParam : null;

  return (
    <DashboardHome
      user={session.user}
      profile={data.profile}
      discordUsername={data.discordUsername}
      isInDiscordServer={data.isInDiscordServer}
      upcoming={data.upcoming}
      yourBatches={data.yourBatches}
      possibleBatches={data.possibleBatches}
      canVotePossibleBatches={data.canVotePossibleBatches}
      error={error}
    />
  );
}
