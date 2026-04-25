"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

type DirectoryCountTooltipProps = {
  className?: string;
};

export function DirectoryCountTooltip({
  className,
}: DirectoryCountTooltipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        aria-label="Explain who is included in the directory count"
        delay={100}
        type="button"
        className={cn(
          "inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <Info aria-hidden="true" className="size-3" />
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={8}>
          <Tooltip.Popup className="z-50 max-w-64 rounded-md border border-border bg-popover px-3 py-2 text-xs leading-5 text-popover-foreground shadow-md text-pretty">
            Only people who allowed it are shown here. You can change it in
            {" "}
            /profile.
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
