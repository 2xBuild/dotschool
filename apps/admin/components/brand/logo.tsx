import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

/**
 * Wordmark: rounded-square mark + "school" in Open Sauce Sans.
 */
export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-[0.2em] font-semibold leading-none tracking-tight text-foreground select-none",
        className,
      )}
      style={{ fontFamily: "var(--font-open-sauce)" }}
      role="img"
      aria-label="dotschool"
    >
      <span
        className="box-border size-[0.67em] shrink-0 rounded-[20%] bg-foreground"
        aria-hidden
      />
      <span className="inline-block h-[1.2em] leading-none" aria-hidden>
        school
      </span>
    </div>
  );
}
