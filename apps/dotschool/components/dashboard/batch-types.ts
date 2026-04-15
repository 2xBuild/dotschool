export type BatchProgramDetails = {
  roadmap: string | null;
  process: string | null;
  projects: string | null;
  leaderboard: string | null;
  rewardPool: string | null;
  hackathon: string | null;
  tips: string | null;
  rules: string | null;
};

export function batchHasProgramDetails(d: BatchProgramDetails | null | undefined): boolean {
  if (!d) return false;
  return Object.values(d).some((v) => typeof v === "string" && v.trim().length > 0);
}
