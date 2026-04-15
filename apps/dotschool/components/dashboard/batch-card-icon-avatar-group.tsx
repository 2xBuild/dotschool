"use client";

import { resolveBatchCardIcons } from "@/components/dashboard/batch-card-icon-registry";
import type { BatchListCardStyleSet } from "@/components/dashboard/batch-list-card-styles";
import { cn } from "@/lib/utils";

type BatchCardIconAvatarGroupProps = {
  iconKeys: string[];
  s: Pick<BatchListCardStyleSet, "avatarGroupChip" | "icon">;
};

export function BatchCardIconAvatarGroup({
  iconKeys,
  s,
}: BatchCardIconAvatarGroupProps) {
  const resolved = resolveBatchCardIcons(iconKeys);
  if (resolved.length === 0) return null;

  return (
    <ul
      className="flex list-none justify-end pl-2"
      aria-label="Technologies for this batch"
    >
      {resolved.map((item, i) => {
        const { Icon } = item;
        return (
          <li
            key={`${item.key}-${i}`}
            className={cn(
              "relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 sm:size-7",
              s.avatarGroupChip,
              i > 0 && "-ml-2 sm:-ml-2",
            )}
            style={{ zIndex: i }}
          >
            {item.kind === "lucide" ? (
              <Icon
                strokeWidth={1.65}
                className={cn("size-[0.8rem] sm:size-[0.85rem]", s.icon)}
                aria-hidden
              />
            ) : (
              <Icon
                className={cn("size-[0.8rem] sm:size-[0.85rem]", s.icon)}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
