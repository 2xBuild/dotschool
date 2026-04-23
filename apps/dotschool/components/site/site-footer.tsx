import Link from "next/link";

import { DISCORD_INVITE_URL } from "@/lib/discord";
import { cn } from "@/lib/utils";

type SiteFooterProps = {
  variant?: "default" | "brutalist";
  /** When true, keep the blue brand footer in light appearance (ignores site dark mode). */
  forceBlueTheme?: boolean;
  className?: string;
};

const linkClass = (brutalist: boolean, forceBlueTheme: boolean) =>
  cn(
    "text-xs transition-colors",
    brutalist
      ? "text-brutal-navy/80 hover:text-brutal-navy"
      : forceBlueTheme
        ? "text-white/75 hover:text-white"
        : "text-white/75 hover:text-white dark:text-muted-foreground dark:hover:text-foreground",
  );

export function SiteFooter({
  variant = "default",
  forceBlueTheme = false,
  className,
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const brutalist = variant === "brutalist";
  const blue = !brutalist && forceBlueTheme;

  return (
    <footer
      className={cn(
        "mt-auto border-t",
        brutalist
          ? "border-t-2 border-brutal-navy bg-brutal-surface"
          : cn(
              "relative overflow-hidden border-white/25 bg-[#1f49ff] text-white",
              !blue && "dark:border-border dark:bg-muted/30 dark:text-foreground",
            ),
        className,
      )}
    >
      {!brutalist ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),linear-gradient(180deg,#3158ff_0%,#1f49ff_60%,#2552ff_100%)]",
            !blue && "dark:bg-none",
          )}
        />
      ) : null}
      <div
        className={cn(
          "mx-auto px-6 py-12",
          !brutalist && "relative z-10",
          brutalist ? "max-w-6xl" : "max-w-5xl",
        )}
      >
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div
              className={cn(
                "inline-flex items-center gap-[0.2em] text-3xl font-semibold leading-none tracking-tight select-none sm:text-5xl",
                brutalist
                  ? "text-foreground opacity-70"
                  : cn("text-white", !blue && "dark:text-foreground dark:opacity-70"),
              )}
              style={{ fontFamily: "var(--font-open-sauce)" }}
              role="img"
              aria-label="dotschool"
            >
              <span
                className={cn(
                  "size-[0.67em] shrink-0 translate-y-[0.06em] rounded-[20%]",
                  brutalist ? "bg-foreground" : cn("bg-white", !blue && "dark:bg-foreground"),
                )}
                aria-hidden
              />
              <span aria-hidden>school</span>
            </div>

            <p
              className={cn(
                "mt-2 text-sm",
                brutalist
                  ? "text-brutal-navy/60"
                  : cn("text-white/80", !blue && "dark:text-muted-foreground"),
              )}
            >
              self study tech like never before
            </p>

            <p
              className={cn(
                "mt-4 text-xs",
                brutalist
                  ? "text-brutal-navy/60"
                  : cn("text-white/65", !blue && "dark:text-muted-foreground"),
              )}
            >
              © {year} dotschool
            </p>
          </div>

          <nav className="text-left" aria-label="Footer">
            <h3
              className={cn(
                "mb-3 text-xs font-semibold uppercase tracking-wider",
                brutalist
                  ? "text-brutal-navy"
                  : cn("text-white", !blue && "dark:text-muted-foreground"),
              )}
            >
              Links
            </h3>
            <ul className="grid grid-cols-3 gap-x-12 gap-y-2">
              <li>
                <Link href="/mission" className={linkClass(brutalist, blue)}>
                  Mission
                </Link>
              </li>
              <li>
                <Link href="/volunteer" className={linkClass(brutalist, blue)}>
                  Volunteer
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/2xBuild/dotschool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass(brutalist, blue)}
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/terms" className={linkClass(brutalist, blue)}>
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/fund" className={linkClass(brutalist, blue)}>
                  Fund
                </Link>
              </li>
              <li>
                <a
                  href="https://x.com/izzhanu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass(brutalist, blue)}
                >
                  X
                </a>
              </li>
              <li>
                <Link href="/dashboard" className={linkClass(brutalist, blue)}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className={linkClass(brutalist, blue)}>
                  Sign in
                </Link>
              </li>
              <li>
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass(brutalist, blue)}
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@dotschool.org"
                  className={linkClass(brutalist, blue)}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
