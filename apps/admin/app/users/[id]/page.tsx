import { redirect, notFound } from "next/navigation";

import { getAdminUser, isAdmin } from "@/server/auth/access";
import { AdminShell } from "@/components/layout/admin-shell";
import { getUserWithTags } from "@/server/admin/user-queries";
import { TagManager } from "@/components/user/tag-manager";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const adminUser = await getAdminUser();
  if (!adminUser) redirect("/login");

  const { profile, tags } = await getUserWithTags(id);
  if (!profile) notFound();

  return (
    <AdminShell user={adminUser}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {profile.image ? (
            <img
              src={profile.image}
              alt=""
              className="size-14 rounded-full"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-xl font-bold">
              {(profile.name ?? profile.email)[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {profile.name ?? profile.email}
            </h1>
            <p className="text-sm text-muted-foreground">
              @{profile.username} &middot; {profile.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Provider</p>
            <p className="text-lg font-bold">{profile.provider ?? "N/A"}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Last Login</p>
            <p className="text-lg font-bold">
              {profile.lastLoginAt?.toLocaleDateString() ?? "N/A"}
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Tags</h2>
          <TagManager
            userId={id}
            currentTags={tags.map((t) => t.tag)}
            canManage={isAdmin(adminUser)}
          />
        </section>
      </div>
    </AdminShell>
  );
}
