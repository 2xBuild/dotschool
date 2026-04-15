import { redirect, notFound } from "next/navigation";

import { getAdminUser, isMod, isAdmin } from "@/server/auth/access";
import { AdminShell } from "@/components/layout/admin-shell";
import { BatchDetailClient } from "@/components/batch/batch-detail-client";
import {
  getAssignableVolunteers,
  getBatchById,
  getBatchEnrollments,
  getBatchTestSubmissions,
  getBatchVolunteersList,
} from "@/server/admin/batch-queries";
import { getModulesForBatch } from "@/server/admin/module-queries";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAdminUser();
  if (!user) redirect("/login");

  const batch = await getBatchById(id);
  if (!batch) notFound();

  const [enrollments, volunteers, modules, volunteerCandidates, testSubmissions] =
    await Promise.all([
      getBatchEnrollments(id),
      getBatchVolunteersList(id),
      getModulesForBatch(id),
      getAssignableVolunteers(),
      getBatchTestSubmissions(id),
    ]);

  return (
    <AdminShell user={user}>
      <BatchDetailClient
        batch={batch}
        enrollments={enrollments}
        volunteers={volunteers}
        volunteerCandidates={volunteerCandidates}
        modules={modules}
        testSubmissions={testSubmissions}
        canManage={isMod(user)}
        isAdmin={isAdmin(user)}
      />
    </AdminShell>
  );
}
