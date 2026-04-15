"use client";

import { useState } from "react";
import { Shield, ShieldCheck, Tag, X, Plus } from "lucide-react";
import { grantTag, revokeTag } from "@/server/admin/user-actions";

const allTags = ["admin", "mod"] as const;
type Tag = (typeof allTags)[number];

const tagMeta: Record<Tag, { icon: React.ElementType; color: string }> = {
  admin: {
    icon: Shield,
    color:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  mod: {
    icon: ShieldCheck,
    color:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

const unknownTagMeta = {
  icon: Tag,
  color: "bg-muted text-muted-foreground",
} as const;

function metaForTag(tag: string) {
  return tagMeta[tag as Tag] ?? unknownTagMeta;
}

type TagManagerProps = {
  userId: string;
  currentTags: string[];
  canManage: boolean;
};

export function TagManager({ userId, currentTags, canManage }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>(currentTags);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingTags = allTags.filter((t) => !tags.includes(t));

  async function handleGrant(tag: Tag) {
    setLoading(true);
    setError(null);
    const res = await grantTag(userId, tag);
    if ("error" in res) {
      setError(res.error ?? "Failed to grant tag");
    } else {
      setTags((prev) => [...prev, tag]);
    }
    setLoading(false);
  }

  async function handleRevoke(tag: string) {
    setLoading(true);
    setError(null);
    const res = await revokeTag(userId, tag);
    if ("error" in res) {
      setError(res.error ?? "Failed to revoke tag");
    } else {
      setTags((prev) => prev.filter((t) => t !== tag));
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">No tags assigned</p>
        )}
        {tags.map((tag) => {
          const { icon: Icon, color } = metaForTag(tag);
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${color}`}
            >
              <Icon className="size-3.5" />
              {tag}
              {canManage && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRevoke(tag)}
                  className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          );
        })}
      </div>

      {canManage && missingTags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Add tag:</span>
          {missingTags.map((tag) => (
            <button
              key={tag}
              type="button"
              disabled={loading}
              onClick={() => handleGrant(tag)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent disabled:opacity-50"
            >
              <Plus className="size-3" />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
