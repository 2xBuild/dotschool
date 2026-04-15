"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { useClickSound } from "@/hooks/use-app-sound";

type HowItWorksVisual =
  | "apply"
  | "entrance-test"
  | "selection"
  | "discord"
  | "collaborate"
  | "volunteers"
  | "compete"
  | "recognition";

type HowItWorksItem = {
  id?: string;
  title: string;
  description: string;
  visual?: HowItWorksVisual;
};

type HowItWorksProps = {
  title?: string;
  items?: HowItWorksItem[];
  autoPlayDuration?: number;
};

const DEFAULT_AUTO_PLAY_DURATION = 7000;

const HOW_IT_WORKS_ITEMS: HowItWorksItem[] = [
  {
    id: "01",
    title: "Apply for a batch.",
    description:
      "Explore and apply for interested batches. Couldn't find one? explore possible batches and vote or request one at our discord community.",
    visual: "apply",
  },
  {
    id: "02",
    title: "Join entrance test.",
    description:
      "Once the applications are closed, an entrance test is conducted around reasoning and niche questions to filter exceptional folks. Building a better circle is core of dotschool.",
    visual: "entrance-test",
  },
  {
    id: "03",
    title: "As per the batch capacitiy, final cut is out. ",
    description:
      "Based on entrance test, best scorers are picked as per the batch capacity.",
    visual: "selection",
  },
  {
    id: "04",
    title: "Discord and content",
    description:
      "You get into a Discord private community for the batch, and access content, tests and leaderboards on dotschool page. ",
    visual: "discord",
  },
  {
    id: "05",
    title: "Learn, Asks, Answer, Collab and Create together",
    description:
      "Learn with given modules and resources, ask questions, answer others, collaborate and create together.",
    visual: "collaborate",
  },
  {
    id: "06",
    title: "Volunteer-powered",
    description:
      "The program is run by volunteers who can offer their experience and time to help you with the right resources to learn, answer doubts and more.",
    visual: "volunteers",
  },
  {
    id: "07",
    title: "Join weekly tests or hackathons.",
    description:
      "Stay up to date with weekly tests to climb on leaderboard, or participate in hackathons whenever announced.",
    visual: "compete",
  },
  {
    id: "08",
    title: "Get recognized for your work.",
    description:
      "Join sponsored hackathons and win prizes. Earn badges and get noticed by your helping nature and consistency.",
    visual: "recognition",
  },
];

const HOW_IT_WORKS_VISUALS: HowItWorksVisual[] = [
  "apply",
  "entrance-test",
  "selection",
  "discord",
  "collaborate",
  "volunteers",
  "compete",
  "recognition",
];

function VisualFrame({
  visual,
  description,
}: {
  visual: HowItWorksVisual;
  description: string;
}) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-7 overflow-hidden rounded-[2rem] bg-[#1f49ff] px-6 py-8 font-mono md:gap-9 md:px-10 md:py-12">
      <p className="max-w-xl text-pretty text-center text-sm leading-relaxed text-white/88 md:text-[0.98rem]">
        {description}
      </p>
      <div className="relative flex w-full items-center justify-center">
        <VisualArt visual={visual} />
      </div>
    </div>
  );
}

function VisualArt({ visual }: { visual: HowItWorksVisual }) {
  switch (visual) {
    case "apply":
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="w-full max-w-[30rem] space-y-3">
            {[
              { name: "Web Development", slots: "400 seats" },
              { name: "AI Engineer", slots: "500 seats", active: true },
              { name: "Complete DSA", slots: "800 seats" },
              { name: "Chesscamp: 200 to 2000 elo", slots: "1000 seats" },
            ].map((batch) => (
              <div
                key={batch.name}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-5 py-3.5 transition-colors",
                  batch.active
                    ? "border border-white bg-white/10"
                    : "border border-white/15 bg-transparent",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      batch.active ? "bg-white" : "bg-white/30",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      batch.active ? "text-white" : "text-white/60",
                    )}
                  >
                    {batch.name}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[0.65rem] uppercase tracking-wider",
                    batch.active ? "text-white/80" : "text-white/40",
                  )}
                >
                  {batch.slots}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "entrance-test": {
      const facts: { label: string; value: string; icon: React.ReactNode }[] = [
        {
          label: "Format",
          value: "MCQ Test",
          icon: (
            <>
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </>
          ),
        },
        {
          label: "Questions",
          value: "20 Qs",
          icon: (
            <>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </>
          ),
        },
        {
          label: "Duration",
          value: "10 mins",
          icon: (
            <>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </>
          ),
        },
      ];

      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="flex w-full max-w-[32rem] flex-wrap items-center justify-center gap-3">
            {facts.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[#1f49ff]">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {f.icon}
                  </svg>
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-[0.55rem] uppercase tracking-widest text-white/55">
                    {f.label}
                  </span>
                  <span className="text-[0.82rem] font-medium text-white">
                    {f.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "selection":
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="w-full max-w-[30rem] space-y-2">
            {[
              { rank: "01", selected: true },
              { rank: "02", selected: true },
              { rank: "03", selected: true },
              { rank: "04", selected: false },
              { rank: "05", selected: false },
            ].map((row) => (
              <div
                key={row.rank}
                className={cn(
                  "flex items-center gap-4 rounded-xl px-4 py-3 transition-opacity",
                  row.selected
                    ? "border border-white/30 bg-white/10"
                    : "border border-dashed border-white/15 opacity-40",
                )}
              >
                <span className="text-[0.7rem] tabular-nums text-white/60">
                  {row.rank}
                </span>
                <div className="flex-1">
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      row.selected ? "w-32 bg-white/40" : "w-24 bg-white/15",
                    )}
                  />
                </div>
                {row.selected ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="size-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "discord":
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="flex w-full max-w-[32rem] gap-3 rounded-[1.75rem] border border-white/20 bg-white/5 p-4">
            <div className="flex w-24 flex-col gap-1.5 rounded-xl bg-white/5 p-2.5">
              {["general", "projects", "help", "random"].map((ch, i) => (
                <div
                  key={ch}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-1.5 py-1",
                    i === 1 ? "bg-white/15" : "",
                  )}
                >
                  <span className="text-[0.6rem] text-white/40">#</span>
                  <span
                    className={cn(
                      "h-1.5 rounded-full",
                      i === 1 ? "w-10 bg-white/70" : "w-8 bg-white/25",
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="flex-1 space-y-2.5 rounded-xl bg-white/5 p-3">
              <div className="h-2 w-14 rounded-full bg-white/25" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-2">
                  <span className="size-5 shrink-0 rounded-full bg-white/25" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-1.5 w-14 rounded-full bg-white/35" />
                    <div className="h-1.5 w-24 rounded-full bg-white/15" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "collaborate": {
      const actions: { label: string; icon: React.ReactNode }[] = [
        {
          label: "Learn",
          icon: (
            <>
              <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5z" />
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            </>
          ),
        },
        {
          label: "Ask",
          icon: (
            <>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </>
          ),
        },
        {
          label: "Answer",
          icon: (
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          ),
        },
        {
          label: "Collab",
          icon: (
            <>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </>
          ),
        },
        {
          label: "Create",
          icon: (
            <>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </>
          ),
        },
      ];

      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div
              aria-hidden
              className="absolute left-6 right-6 top-7 h-px border-t border-dashed border-white/25"
            />
            <div className="relative flex items-start gap-4 md:gap-6">
              {actions.map((a) => (
                <div
                  key={a.label}
                  className="flex w-14 flex-col items-center gap-2 md:w-16"
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-white text-[#1f49ff] shadow-[0_0_0_4px_rgba(31,73,255,1)] md:size-14">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {a.icon}
                    </svg>
                  </span>
                  <span className="text-[0.6rem] font-medium uppercase tracking-wider text-white/80">
                    {a.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "volunteers":
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="grid w-full max-w-[28rem] grid-cols-2 gap-3 md:gap-4">
            {[
              { role: "Mentor", bars: 3 },
              { role: "Reviewer", bars: 2 },
              { role: "Organizer", bars: 3 },
              { role: "Builder", bars: 2 },
            ].map((v, i) => (
              <div
                key={v.role}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3.5",
                  i % 3 === 0
                    ? "border-white/50 bg-white/10"
                    : "border-white/20 bg-white/5",
                )}
              >
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full border",
                    i % 3 === 0 ? "border-white bg-white/15" : "border-white/35 bg-white/5",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-[0.75rem] font-medium uppercase tracking-wider text-white">
                    {v.role}
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="h-1.5 w-full rounded-full bg-white/25" />
                    {v.bars >= 2 && <div className="h-1.5 w-3/4 rounded-full bg-white/15" />}
                    {v.bars >= 3 && <div className="h-1.5 w-1/2 rounded-full bg-white/10" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "compete":
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="w-full max-w-[30rem] space-y-3">
            <div className="mb-1 flex items-center justify-between text-[0.65rem] uppercase tracking-widest text-white/50">
              <span>Leaderboard</span>
              <span>Week 14</span>
            </div>
            {[
              { rank: "1", width: "w-full", top: true },
              { rank: "2", width: "w-5/6", top: false },
              { rank: "3", width: "w-3/4", top: false },
              { rank: "4", width: "w-2/3", top: false },
              { rank: "5", width: "w-1/2", top: false },
            ].map((row) => (
              <div key={row.rank} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[0.7rem] font-medium tabular-nums",
                    row.top
                      ? "bg-white text-[#1f49ff]"
                      : "border border-white/25 text-white/60",
                  )}
                >
                  {row.rank}
                </span>
                <div className="flex-1">
                  <div
                    className={cn(
                      "h-2.5 rounded-full",
                      row.top ? "bg-white" : "bg-white/25",
                      row.width,
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "recognition":
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="flex items-end gap-8 md:gap-10">
            {[
              { size: "size-16 md:size-20", icon: "medal" },
              { size: "size-24 md:size-28", icon: "trophy" },
              { size: "size-16 md:size-20", icon: "star" },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border",
                    i === 1
                      ? "border-2 border-white bg-white/15"
                      : "border-white/35 bg-white/5",
                    b.size,
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={cn(i === 1 ? "size-10 md:size-12" : "size-7 md:size-9", "text-white")}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {b.icon === "trophy" ? (
                      <>
                        <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0012 0V2z" />
                      </>
                    ) : b.icon === "medal" ? (
                      <>
                        <circle cx="12" cy="15" r="6" />
                        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                      </>
                    ) : (
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    )}
                  </svg>
                </div>
                <div
                  className={cn(
                    "h-1 rounded-full",
                    i === 1 ? "w-12 bg-white/50" : "w-8 bg-white/25",
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function HowItWorks({
  title = "How it works",
  items = HOW_IT_WORKS_ITEMS,
  autoPlayDuration = DEFAULT_AUTO_PLAY_DURATION,
}: HowItWorksProps) {
  const tabItems = items.length > 0 ? items : HOW_IT_WORKS_ITEMS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [playClick] = useClickSound();
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % tabItems.length);
  }, [tabItems.length]);

  const handleTabClick = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      playClick();
      setActiveIndex(index);
      setIsPaused(false);
    },
    [activeIndex, playClick],
  );

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (tabItems.length <= 1 || shouldReduceMotion || isPaused || !isInView) return;

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayDuration);

    return () => clearInterval(interval);
  }, [tabItems.length, autoPlayDuration, shouldReduceMotion, isPaused, isInView, handleNext]);

  const panelVariants = {
    enter: {
      y: 32,
      opacity: 0,
    },
    center: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: -32,
      opacity: 0,
    },
  };

  const activeItem = tabItems[activeIndex];
  const activeVisual =
    activeItem.visual ?? HOW_IT_WORKS_VISUALS[activeIndex % HOW_IT_WORKS_VISUALS.length];

  return (
    <section ref={sectionRef} className="w-full py-8 md:py-14 lg:py-18">
      <div className="mx-auto w-full px-4 md:px-8 lg:px-12 xl:px-20">
        <div className="mb-10">
          <p className="pixel-kicker text-center text-2xl text-[#1f49ff]">{title}</p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-16">
          <div className="order-1 flex lg:col-span-7">
            <div
              className="relative w-full"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative min-h-[420px] overflow-hidden rounded-[2.25rem] border border-[#1f49ff] bg-[#1f49ff] p-2 shadow-sm md:min-h-[520px]">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={activeItem.id ?? activeItem.title}
                    variants={panelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.15, ease: "easeOut" }
                        : {
                            y: { duration: 0.45, ease: "easeOut" },
                            opacity: { duration: 0.3, ease: "easeOut" },
                          }
                    }
                    className="absolute inset-2"
                  >
                    <VisualFrame
                      visual={activeVisual}
                      description={activeItem.description}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="order-2 flex flex-col justify-between lg:col-span-5">
            <div className="flex flex-col">
              {tabItems.map((item, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    key={item.id ?? item.title}
                    type="button"
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "group relative flex items-start gap-4 border-t border-border/35 py-4 text-left transition-colors duration-150 first:border-0 md:py-5",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground/70 hover:text-foreground",
                    )}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-border/60">
                      {isActive ? (
                        <motion.div
                          key={`progress-${index}-${isPaused}-${isInView}`}
                          className="absolute inset-0 origin-top bg-[#1f49ff]"
                          initial={{ scaleY: shouldReduceMotion ? 1 : 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{
                            duration: shouldReduceMotion ? 0.15 : autoPlayDuration / 1000,
                            ease: shouldReduceMotion ? "easeOut" : "linear",
                          }}
                        />
                      ) : null}
                    </div>

                    <span
                      className={cn(
                        "mt-1 pl-4 text-[9px] font-medium tabular-nums md:pl-6 md:text-[10px]",
                        isActive ? "text-[#1f49ff]" : "text-brutal-navy/40",
                      )}
                    >
                      {item.id ?? String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex flex-1 flex-col gap-2 pr-2">
                      <span
                        className={cn(
                          "text-balance text-sm leading-tight font-normal md:text-[0.97rem] lg:text-[1.05rem]",
                          isActive ? "text-[#1f49ff]" : "text-brutal-navy",
                        )}
                      >
                        {item.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
