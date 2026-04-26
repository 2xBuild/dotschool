import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BatchDetailView } from "@/components/dashboard/batch-detail-view";
import type { BatchProgramDetails } from "@/components/dashboard/batch-types";
import { getConfirmedBatchWithMemberCount } from "@/server/batches/detail";
import { getBatchModules } from "@/server/batches/modules";
import { getBatchPeers } from "@/server/batches/peers";
import {
  attachVolunteerRatings,
  getBatchVolunteers,
} from "@/server/batches/volunteers";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getConfirmedBatchWithMemberCount(id);
  if (!data) {
    return { title: "Batch" };
  }
  return {
    title: `${data.batch.title} · Batch`,
    description: data.batch.description?.trim() ?? undefined,
  };
}

export default async function BatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getConfirmedBatchWithMemberCount(id);
  if (!data) {
    notFound();
  }

  const { batch, memberCount, isEnrolled, enrollmentStatus, canOptOut } = data;
  const [volunteersRaw, modules, { peers, currentUserId }] = await Promise.all([
    getBatchVolunteers(batch.id),
    getBatchModules(batch.id),
    getBatchPeers(batch.id),
  ]);
  const volunteers = await attachVolunteerRatings(
    batch.id,
    volunteersRaw,
    currentUserId,
  );
  const members = peers.map((p) => ({ ...p, role: null }));

  const details: BatchProgramDetails = {
    roadmap: batch.roadmap ?? null,
    process: batch.process ?? null,
    projects: batch.projects ?? null,
    leaderboard: batch.leaderboard ?? null,
    rewardPool: batch.rewardPool ?? null,
    hackathon: batch.hackathon ?? null,
    tips: batch.tips ?? null,
    rules: batch.rules ?? null,
  };

  return (
    <BatchDetailView
      title={batch.title}
      description={batch.description}
      startsAt={batch.startsAt!}
      endsAt={batch.endsAt}
      memberCount={memberCount}
      details={details}
      volunteers={volunteers}
      modules={modules}
      isEnrolled={isEnrolled}
      enrollmentStatus={enrollmentStatus}
      canOptOut={canOptOut}
      batchId={batch.id}
      members={members}
    />
  );
}
