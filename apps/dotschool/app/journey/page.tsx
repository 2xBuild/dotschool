import type { Metadata } from "next";


import { MarketingShell } from "@/components/marketing/marketing-shell";
import { JSX } from "react/jsx-dev-runtime";

type Milestone = {
  sortKey: string;
  date: string;
  title: string;
  description: string | JSX.Element;
};

const MILESTONES: Milestone[] = [
  {
    sortKey: "2026-03-21",
    date: "March 21, 2026",
    title: "Idea",
    description: "The idea to innovate self study hit me first time.",
  },
  {
    sortKey: "2026-04-23",
    date: "April 23, 2026",
    title: "Launch",
    description: "The first public version of dotschool went live.",
  },
  {
    sortKey: "2026-04-26",
    date: "April 26, 2026",
    title: "Jami joining dotschool",
    description: ( <>
        {" "}
        <a
          href="https://x.com/MahraibFatima_"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Jami
        </a> liked the idea and joined the team to help in growth and operations. 
      </>),
  }
];

export const metadata: Metadata = {
  title: "Journey | dotschool",
  description:
    "How dotschool started and the milestones we achieved along the way.",
};

export default function JourneyPage() {
  const milestones = [...MILESTONES].sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  return (
    <MarketingShell minimalNav>
      <article className="mx-auto w-full max-w-3xl">
        <header className="mx-auto max-w-2xl space-y-2 text-center">
          <p className="pixel-kicker text-primary">Journey</p>
          <p className="text-sm leading-7 text-muted-foreground text-pretty sm:text-base">
         Timeline and milestones of dotschool, from the start to today.
          </p>
        </header>

        <section
          aria-label="dotschool journey timeline"
          className="relative mx-auto mt-14 max-w-2xl"
        >
          <div className="absolute bottom-0 left-[1.15rem] top-0 w-px bg-border" />

          <ol className="space-y-5">
            {milestones.map((milestone) => {
              return (
                <li
                  key={`${milestone.date}-${milestone.title}`}
                  className="relative pl-11"
                >
                  <span
                    className="absolute left-[1.15rem] top-1/2 h-px w-7 -translate-y-1/2 bg-border"
                    aria-hidden
                  />

                  <section className="min-w-0 rounded-2xl border border-border bg-transparent px-5 py-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <p className="text-sm font-medium text-foreground">
                        {milestone.title}
                      </p>
                      <p className="text-sm tabular-nums text-muted-foreground">
                        {milestone.date}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground text-pretty">
                      {milestone.description}
                    </p>
                  </section>
                </li>
              );
            })}
          </ol>
        </section>
      </article>
    </MarketingShell>
  );
}
