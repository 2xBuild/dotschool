import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Layers,
  Users,
  HandHelping,
  ClipboardList,
  ArrowRight,
  Plus,
  Clock,
  Calendar,
  UserCheck,
} from "lucide-react";

import { getAdminUser, isMod } from "@/server/auth/access";
import { AdminShell } from "@/components/layout/admin-shell";
import {
  getDashboardStats,
  getRecentBatches,
  getPendingApplications,
  getRecentSignups,
} from "@/server/admin/dashboard-queries";

const roleLabelMap: Record<string, string> = {
  developer: "Developer",
  discord_mod: "Discord Mod",
  content_writer: "Content Writer",
  mentor: "Mentor",
  other: "Other",
};

function formatDate(d: Date | null) {
  if (!d) return "TBD";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export default async function AdminDashboard() {
  const user = await getAdminUser();
  if (!user) redirect("/login");

  const modUser = isMod(user);

  const [stats, recentBatches, pendingApps, recentSignups] = await Promise.all([
    getDashboardStats(),
    getRecentBatches(),
    modUser ? getPendingApplications() : Promise.resolve([]),
    modUser ? getRecentSignups() : Promise.resolve([]),
  ]);

  const statCards = [
    {
      label: "Total Batches",
      value: stats.totalBatches,
      icon: Layers,
      href: "/batches",
    },
    ...(modUser
      ? [
          {
            label: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            href: "/users" as string | undefined,
          },
          {
            label: "Pending Applications",
            value: stats.pendingApplications,
            icon: HandHelping,
            href: "/volunteers?status=pending" as string | undefined,
            highlight: stats.pendingApplications > 0,
          },
          {
            label: "Pending Enrollments",
            value: stats.pendingEnrollments,
            icon: ClipboardList,
            href: "/batches" as string | undefined,
            highlight: stats.pendingEnrollments > 0,
          },
        ]
      : []),
  ];

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.name ?? user.email}
            </p>
          </div>
          {modUser && (
            <Link
              href="/batches/new"
              className="card-3d card-3d-interactive inline-flex items-center gap-2 !border-primary/80 !bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Plus className="size-4" />
              New Batch
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const inner = (
              <div
                className={`card-3d p-5 ${stat.href ? "card-3d-interactive" : ""} ${
                  stat.highlight
                    ? "!border-yellow-400/60 dark:!border-yellow-500/30"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted/60">
                    <stat.icon className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>
            );
            return stat.href ? (
              <Link key={stat.label} href={stat.href}>
                {inner}
              </Link>
            ) : (
              <div key={stat.label}>{inner}</div>
            );
          })}
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Recent Batches</h2>
            <Link
              href="/batches"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {recentBatches.length === 0 ? (
            <div className="card-3d flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No batches yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentBatches.map((b) => {
                const pct =
                  b.totalSeats > 0
                    ? Math.round((b.enrollmentCount / b.totalSeats) * 100)
                    : 0;

                return (
                  <Link
                    key={b.id}
                    href={`/batches/${b.id}`}
                    className="card-3d card-3d-interactive flex flex-col p-5"
                  >
                    {/* Top row: title + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold leading-tight">
                          {b.title}
                        </h3>
                        <span className="mt-0.5 inline-block text-xs text-muted-foreground">
                          Batch #{b.batchNumber}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>Starts {formatDate(b.startsAt)}</span>
                    </div>

                    {/* Enrollment bar */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-medium">
                          {b.enrollmentCount}{" "}
                          <span className="text-muted-foreground font-normal">
                            / {b.totalSeats} enrolled
                          </span>
                        </span>
                        <span className="font-medium text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`progress-fill h-full rounded-full ${
                            b.status === "confirmed"
                              ? "bg-green-500 dark:bg-green-400"
                              : "bg-yellow-500 dark:bg-yellow-400"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {modUser && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending volunteer applications */}
          <section className="card-3d overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <h2 className="flex items-center gap-2 font-semibold tracking-tight">
                Pending Applications
                {stats.pendingApplications > 0 && (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-yellow-400/20 text-xs font-bold text-yellow-700 dark:text-yellow-400">
                    {stats.pendingApplications}
                  </span>
                )}
              </h2>
              <Link
                href="/volunteers?status=pending"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {pendingApps.map((app) => (
                <Link
                  key={app.id}
                  href="/volunteers?status=pending"
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{app.email}</p>
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                      {roleLabelMap[app.role] ?? app.role}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDate(app.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
              {pendingApps.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No pending applications
                </div>
              )}
            </div>
          </section>

          {/* Recent signups */}
          <section className="card-3d overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <h2 className="flex items-center gap-2 font-semibold tracking-tight">
                <UserCheck className="size-4 text-muted-foreground" />
                Recent Signups
              </h2>
              {isMod(user) && (
                <Link
                  href="/users"
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ArrowRight className="size-3" />
                </Link>
              )}
            </div>
            <div className="divide-y divide-border">
              {recentSignups.map((u) => (
                <div
                  key={u.userId}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  {u.image ? (
                    <img
                      src={u.image}
                      alt=""
                      className="size-7 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {(u.name ?? u.email)[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {u.name ?? u.username}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </span>
                </div>
              ))}
              {recentSignups.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No users yet
                </div>
              )}
            </div>
          </section>
        </div>
        )}
      </div>
    </AdminShell>
  );
}
