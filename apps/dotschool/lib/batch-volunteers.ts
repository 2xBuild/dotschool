export type BatchVolunteer = {
  userId: string;
  name: string;
  username: string;
  image: string | null;
  role: string;
};

const ROLE_LABELS: Record<string, string> = {
  developer: "Developer",
  discord_mod: "Discord Moderator",
  content_writer: "Content Writer",
  mentor: "Mentor",
  other: "Volunteer",
};

export function roleName(role: string) {
  return ROLE_LABELS[role] ?? role;
}
