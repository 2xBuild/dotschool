import { redirect } from "next/navigation";

import { getAdminUser, isMod } from "@/server/auth/access";
import { AdminShell } from "@/components/layout/admin-shell";
import { BatchForm } from "@/components/batch/batch-form";
import { getNextBatchNumber } from "@/server/admin/batch-queries";

export default async function NewBatchPage() {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  if (!isMod(user)) redirect("/");

  const nextBatchNumber = await getNextBatchNumber();

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Batch</h1>
          <p className="text-sm text-muted-foreground">
            Launch a new cohort batch
          </p>
        </div>
        <BatchForm suggestedBatchNumber={nextBatchNumber} />
      </div>
    </AdminShell>
  );
}
