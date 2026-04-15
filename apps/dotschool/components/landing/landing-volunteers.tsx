import { ArrowUpRight, BadgeDollarSignIcon } from "lucide-react";
import { SoundLink } from "@/components/landing/sound-link";

const supporters = ["YOU", "OR", "YOUR", "COMPANY", "HERE"];
const ctaButtonSizeClassName =
  "mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f49ff]";

export function LandingVolunteers() {
  return (
    <section
      id="volunteers"
      className="scroll-mt-24 px-6 sm:px-12 lg:px-20 xl:px-28"
      aria-labelledby="landing-volunteers-heading"
    >
      <div className="mx-auto max-w-2xl py-10 text-center sm:py-16">
        <p className="pixel-kicker text-[#1f49ff]">Contribute</p>

        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-6 text-[#666] sm:text-base">
          Share your expertise, operate batches, write content etc. Give back to the community. 
        </p>

        <div className="flex items-center justify-center gap-2">
          <SoundLink
            href="/volunteer"
            className={`${ctaButtonSizeClassName} bg-[#1f49ff] text-white hover:bg-[#1a3fd9]`}
          >
            Be volunteer
            <ArrowUpRight className="size-4 stroke-[2]" />
          </SoundLink>
          <SoundLink
            href="/fund"
            className={`${ctaButtonSizeClassName} border border-[#1f49ff] bg-[#f6f9ff] text-[#1f49ff] hover:bg-[#ecf1ff]`}
          >
            Fund
            <BadgeDollarSignIcon className="size-4 stroke-[2]" />
          </SoundLink>
        </div>
      </div>

      <div className="border-t border-[#1f49ff]/8 py-8 sm:py-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-[#1f49ff]/35">
          Supported by
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-14">
          {supporters.map((name) => (
            <span
              key={name}
              className="text-[1.05rem] font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-open-sauce)",
                color: "#1f49ff",
                opacity: 0.16,
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
