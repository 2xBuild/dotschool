const USERNAME_MIN_LENGTH = 4;
const USERNAME_MAX_LENGTH = 32;

// 4-32 chars; letters, numbers, underscore, and dot only.
export const USERNAME_PATTERN = new RegExp(
  `^[a-z0-9._]{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}}$`,
);

// HTML input pattern attribute equivalent (no anchors)
export const USERNAME_INPUT_PATTERN = `[a-z0-9._]{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}}`;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string) {
  return USERNAME_PATTERN.test(value);
}

function stripToAlphaNumeric(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function ensureStartsWithLetter(value: string) {
  if (!value) {
    return "user";
  }

  if (/^[a-z]/.test(value)) {
    return value;
  }

  return `u${value}`;
}

export function buildDefaultUsername(email: string, userId: string) {
  const localPart = email.split("@")[0] ?? "";
  const localToken = stripToAlphaNumeric(localPart);
  const userToken = stripToAlphaNumeric(userId);

  const base = ensureStartsWithLetter(localToken || userToken.slice(0, 12));
  const suffix = userToken.slice(0, 8) || "acct00";
  const candidate = `${base.slice(0, USERNAME_MAX_LENGTH - 1 - suffix.length)}.${suffix}`;

  if (candidate.length >= USERNAME_MIN_LENGTH && isValidUsername(candidate)) {
    return candidate;
  }

  return `user.${suffix}`;
}
