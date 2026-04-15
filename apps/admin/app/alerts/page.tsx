import { redirect } from "next/navigation";

import { getAdminUser, isMod } from "@/server/auth/access";
import { AdminShell } from "@/components/layout/admin-shell";
import { AlertComposer } from "@/components/alert/alert-composer";
import { getAllBatches } from "@/server/admin/batch-queries";

export default async function AlertsPage() {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  if (!isMod(user)) redirect("/");

  const allBatches = await getAllBatches();

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Send notifications and announcements to batch members
          </p>
        </div>
        <AlertComposer
          batches={allBatches.map((b) => ({
            id: b.id,
            title: b.title,
            batchNumber: b.batchNumber,
          }))}
        />
      </div>
    </AdminShell>
  );
}
