import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { getAdminUser } from "@/server/auth/access";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAllBatches } from "@/server/admin/batch-queries";

export default async function BatchesPage() {
  const user = await getAdminUser();
  if (!user) redirect("/login");

  const allBatches = await getAllBatches();

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Batches</h1>
            <p className="text-sm text-muted-foreground">
              Manage all cohort batches
            </p>
          </div>
          <Link
            href="/batches/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            New Batch
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Starts
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Seats
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Enrolled
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Test
                </th>
              </tr>
            </thead>
            <tbody>
              {allBatches.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border last:border-0 hover:bg-primary/[0.03] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/batches/${b.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {b.title}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">
                      #{b.batchNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === "confirmed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {b.startsAt
                      ? b.startsAt.toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{b.totalSeats}</td>
                  <td className="px-4 py-3">{b.enrollmentCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {b.questionSetId ?? "None"}
                  </td>
                </tr>
              ))}
              {allBatches.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No batches yet
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
