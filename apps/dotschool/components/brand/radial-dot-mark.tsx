import { cn } from "@/lib/utils";
import { RADIAL_DOT_SPOKES } from "@/lib/radial-dot-mark";

type RadialDotMarkProps = {
  className?: string;
};

/** Circle + six radial lines (24×24 viewBox), same motif as the wordmark. */
export function RadialDotMark({ className }: RadialDotMarkProps) {
  return (
    <svg
      className={cn("block shrink-0 text-foreground", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      {RADIAL_DOT_SPOKES.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
