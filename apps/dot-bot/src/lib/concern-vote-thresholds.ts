/** Minimum total voters (up + down) before a mute can be applied. */
export const MIN_VOTERS_FOR_MUTE = 7;

/**
 * For the creator's requested action (mute/block) to fire:
 * - Total voters must be >= 10% of all registered members
 * - Upvote-to-downvote ratio must be >= HEALTHY_RATIO (10x)
 */
export const VOTER_PERCENT_FOR_ACTION = 0.1;
export const HEALTHY_RATIO = 10;

export const MUTE_DURATION_MS = 60 * 60 * 1000;
