import { DEFAULT_BATCH_CARD_ICON_SETS } from "@/lib/batch-card-icon-defaults";

const MAX_KEYS = 6;

function parseCardIconKeys(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim().toLowerCase());
  } catch {
    return [];
  }
}

function stableIconFallbackBucket(batchId: string): number {
  let h = 0;
  for (let i = 0; i < batchId.length; i++) {
    h = (Math.imul(31, h) + batchId.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function effectiveCardIconKeys(raw: string | null, batchId: string): string[] {
  const parsed = parseCardIconKeys(raw).slice(0, MAX_KEYS);
  if (parsed.length > 0) {
    return parsed;
  }
  const bucket = stableIconFallbackBucket(batchId);
  const set = DEFAULT_BATCH_CARD_ICON_SETS[bucket % DEFAULT_BATCH_CARD_ICON_SETS.length]!;
  return [...set];
}
