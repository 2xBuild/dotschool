import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

type MarketingShellProps = {
  children: React.ReactNode;
  /** Navbar without section links—brand and theme only */
  minimalNav?: boolean;
};

export function MarketingShell({
  children,
  minimalNav = false,
}: MarketingShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <SiteHeader minimalNav={minimalNav} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
