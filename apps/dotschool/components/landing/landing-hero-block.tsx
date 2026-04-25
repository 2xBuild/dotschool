import { ArrowUpRight, Plus, Users } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SoundLink } from "@/components/landing/sound-link";

import { StudyIllus } from "./study-illus";

const navButtonSize = "inline-flex h-6 items-center justify-center gap-1 rounded-full px-2.5 text-[0.65rem] font-semibold sm:h-9 sm:gap-2 sm:px-5 sm:text-sm";

const missionButtonClassName =
  `${navButtonSize} border border-white/28 bg-white/10 text-white shadow-none transition-colors duration-200 hover:bg-white hover:text-[#1f49ff]`;

const directoryButtonClassName =
  "inline-flex size-6 items-center justify-center rounded-full border border-white/28 bg-white/10 text-white shadow-none transition-colors duration-200 hover:bg-white hover:text-[#1f49ff] sm:size-9";

const joinButtonClassName =
  `${navButtonSize} border border-white bg-white text-[#1f49ff] shadow-none transition-colors duration-200 hover:bg-white/90`;

export function LandingHeroBlock() {
  return (
    <section
      className="landing-hero-shell relative overflow-hidden rounded-[1.65rem] bg-[#1f49ff] text-white"
      aria-labelledby="landing-hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),linear-gradient(180deg,#3158ff_0%,#1f49ff_60%,#2552ff_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/25" />

      <div className="relative z-10 flex min-h-[580px] flex-col px-5 pb-0 pt-5 sm:min-h-[700px] sm:px-8 sm:pb-10 sm:pt-6 lg:min-h-[760px] lg:px-12 lg:pb-0">
        <div className="flex items-start justify-between gap-4">
          <Logo className="text-base text-white sm:text-2xl [&>span:first-of-type]:bg-white" />

          <div className="flex items-center gap-2">
            <SoundLink
              href="/dir"
              className={directoryButtonClassName}
              aria-label="Directory"
            >
              <Users className="size-3 stroke-[1.8] sm:size-4" aria-hidden />
            </SoundLink>
            <SoundLink href="/mission" className={missionButtonClassName}>
              Our mission
              <ArrowUpRight className="size-3 stroke-[1.8] sm:size-4" aria-hidden />
            </SoundLink>
          </div>
        </div>

        <div className="mt-6 flex flex-1 items-end justify-center sm:mt-8 sm:items-center lg:mt-10">
          <div className="relative flex min-h-[420px] w-full max-w-[1180px] items-center justify-center pb-20 sm:min-h-[520px] sm:pb-28 lg:min-h-[620px] lg:pb-32">
            <div className="relative z-10 flex max-w-[54rem] flex-col items-center justify-center text-center">
              <p
                className="pixel-kicker text-[0.72rem] font-medium uppercase tracking-[0.28em] text-white/68 sm:text-xs"
              >
                only platform to 
              </p>
              <h1
                id="landing-hero-heading"
                className="landing-display mt-3 max-w-[16ch] text-balance text-[2.2rem] leading-[1.05] text-white sm:mt-4 sm:text-[2.8rem] lg:text-7xl"
                style={{ fontFamily: "var(--font-open-sauce)", textTransform: "none" }}
              >
                Self Study like never before
              </h1>
              <p
                className="mt-3 max-w-sm text-pretty text-sm leading-5 text-white/80 sm:mt-4 sm:text-md sm:leading-6 sm:max-w-lg"
                style={{ fontFamily: "var(--font-open-sauce)" }}
              >
                with cracked peers and mentors. build, compete, chill, climb leaderboard, earn prizes and recognition.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                <SoundLink
                  href="/login"
                  className={joinButtonClassName + " bg-white/80 hover:bg-white/95"}
                  style={{
                    boxShadow:
                      "0 2px 18px 0 rgba(60,80,255,0.09), 0 2px 4px 0 rgba(31,73,255,0.09)",
                  }}
                >
                  <Plus className="size-4 stroke-[2]" aria-hidden />
                  Join school
                </SoundLink>
                <a
                  href="https://github.com/2xBuild/dotschool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 transition-colors duration-200 hover:bg-white hover:text-[#1f49ff]"
                  aria-label="GitHub"
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-px left-1/2 z-20 w-[100vw] -translate-x-1/2 opacity-90 sm:bottom-0 lg:-bottom-10">
              <StudyIllus className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
