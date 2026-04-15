import { redirect } from "next/navigation";

import { getAdminUser, isMod } from "@/server/auth/access";
import { AdminShell } from "@/components/layout/admin-shell";
import { getVolunteerApplications } from "@/server/admin/volunteer-queries";
import { VolunteerApplicationList } from "@/components/volunteer/application-list";

export default async function VolunteersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  if (!isMod(user)) redirect("/");

  const { status } = await searchParams;
  const filter =
    status === "pending" || status === "accepted" || status === "declined"
      ? status
      : undefined;

  const applications = await getVolunteerApplications(filter);

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Volunteer Applications
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and manage volunteer applications
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[undefined, "pending", "accepted", "declined"].map((s) => (
            <a
              key={s ?? "all"}
              href={s ? `/volunteers?status=${s}` : "/volunteers"}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                filter === s || (!filter && !s)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </a>
          ))}
        </div>

        <VolunteerApplicationList applications={applications} />
      </div>
    </AdminShell>
  );
}
