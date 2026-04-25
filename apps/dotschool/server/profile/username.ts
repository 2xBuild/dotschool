const USERNAME_MIN_LENGTH = 4;
const USERNAME_MAX_LENGTH = 32;
export const DEFAULT_USERNAME_MAX_ATTEMPTS = 20;

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

function pickFirstNameToken(name: string) {
  return name.trim().split(/\s+/)[0] ?? "";
}

function buildRandomNumericSuffix() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function buildDefaultUsername(name: string | null | undefined) {
  const firstName = pickFirstNameToken(name ?? "");
  const nameToken = stripToAlphaNumeric(firstName);
  const base = ensureStartsWithLetter(nameToken || "user");
  const suffix = buildRandomNumericSuffix();
  const candidate = `${base.slice(0, USERNAME_MAX_LENGTH - suffix.length)}${suffix}`;

  if (candidate.length >= USERNAME_MIN_LENGTH && isValidUsername(candidate)) {
    return candidate;
  }

  return `user${suffix}`;
}
