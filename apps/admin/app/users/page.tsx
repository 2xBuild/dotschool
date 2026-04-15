import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";

import { getAdminUser, isMod } from "@/server/auth/access";
import { AdminShell } from "@/components/layout/admin-shell";
import { getRoleUsers, getUsers } from "@/server/admin/user-queries";
import { UserSearch } from "@/components/user/user-search";

const roleMeta = {
  admin: {
    label: "Admin",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  mod: {
    label: "Moderator",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  volunteer: {
    label: "Contributor",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
} as const;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  if (!isMod(user)) redirect("/");

  const { q } = await searchParams;
  const [allUsers, roleUsers] = await Promise.all([getUsers(q), getRoleUsers()]);

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Search and manage user accounts and tags
          </p>
        </div>

        <UserSearch defaultValue={q} />

        <div className="ml-auto w-full max-w-lg overflow-hidden rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <div>
              <h2 className="font-semibold tracking-tight">Admin Team Roles</h2>
              <p className="text-xs text-muted-foreground">
                Admins, mods, contributors
              </p>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {roleUsers.map((roleUser) => (
                <tr
                  key={roleUser.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/${roleUser.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      {roleUser.image ? (
                        <img
                          src={roleUser.image}
                          alt=""
                          className="size-6 rounded-full"
                        />
                      ) : (
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                          {(roleUser.name ?? roleUser.email ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">
                        {roleUser.name ?? roleUser.email ?? "Unknown"}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {roleUser.roles.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleMeta[role].className}`}
                        >
                          {roleMeta[role].label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/users/${roleUser.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 font-medium hover:bg-accent"
                    >
                      <Pencil className="size-3" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {roleUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No admins, moderators, or contributors found yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Username</th>
                <th className="px-4 py-3 text-left font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/${u.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      {u.image ? (
                        <img
                          src={u.image}
                          alt=""
                          className="size-6 rounded-full"
                        />
                      ) : (
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                          {(u.name ?? u.email ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">
                        {u.name ?? u.email ?? "Unknown"}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.username ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.lastLoginAt?.toLocaleDateString() ?? "-"}
                  </td>
                </tr>
              ))}
              {allUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {q ? "No users match your search" : "No users yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
