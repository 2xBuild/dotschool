import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiBuymeacoffee } from "react-icons/si";

import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/site/site-footer";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { getFundPageData, type FundSupportPerson } from "@/server/fund/queries";

export const metadata: Metadata = {
  title: "Fund | dotschool",
  description:
    "Support the dotschool mission — keep tech education free, open, and community-led.",
};

export default async function FundPage() {
  const { creator, organisationSupportUrl, volunteers } = await getFundPageData();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="min-w-0 shrink-0">
            <Logo className="text-xl font-medium text-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="border-0" />
            <Link
              href="/volunteer"
              className="inline-flex rounded-full btn-blue px-4 py-2 text-sm font-semibold transition-colors"
            >
              Volunteer
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
        <article className="mx-auto w-full max-w-3xl">
          <p className="pixel-kicker text-primary">Fund dotschool</p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Sponsors and donations keep the mission alive without ads, charges,
            or obstacles. It is your way to say thank you for their great work.
          </p>

          <section className="mt-10">
            <p className="text-sm text-muted-foreground">
              Credits, compute, hosting or any in-kind help that helps to operate and make it better is highly welcomed. 
            </p>
            <div className="mt-4">
              <a
                href={organisationSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full btn-blue px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                Support the organisation
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </div>
          </section>

          {creator && (
            <section className="mt-14">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                DotSchool Creator
              </p>
            
              <div className="mt-4">
                <PersonRow person={creator} />
              </div>
            </section>
          )}

          <section className="mt-14">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Volunteers
            </p>
            <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
              Goes directly to them.
            </p>

            {volunteers.length > 0 ? (
              <div className="mt-4 divide-y divide-border">
                {volunteers.map((person, i) => (
                  <PersonRow
                    key={`${person.name}-${person.role}-${i}`}
                    person={person}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Nothing to see here yet. As volunteers add a BuyMeCoffee or funding link in their profile, they appear here.
              </p>
            )}
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

function PersonRow({ person }: { person: FundSupportPerson }) {
  const initials = person.name
    .split(" ")
    .map((p) => p[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 py-4">
      {person.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.image}
          alt=""
          className="size-9 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {initials || "DS"}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{person.name}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{person.role}</span>
          {person.batchCount > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>
                {person.batchCount} {person.batchCount === 1 ? "batch" : "batches"}
              </span>
            </>
          )}
        </div>
      </div>

      {person.supportUrl ? (
        <a
          href={person.supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground transition-colors hover:text-[#ffdd00]"
          title={`Buy ${person.name} a coffee`}
        >
          <SiBuymeacoffee className="size-5" aria-hidden /> Buy Coffee
        </a>
      ) : null}
    </div>
  );
}
