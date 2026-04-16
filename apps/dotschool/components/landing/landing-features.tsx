"use client";

import { motion } from "motion/react";

const globalCommunityFlags = [
  { code: "us", name: "United States" },
  { code: "in", name: "India" },
  { code: "jp", name: "Japan" },
  { code: "kr", name: "South Korea" },
  { code: "br", name: "Brazil" },
  { code: "de", name: "Germany" },
  { code: "id", name: "Indonesia" },
  { code: "mx", name: "Mexico" },
  { code: "gb", name: "United Kingdom" },
  { code: "za", name: "South Africa" },
  { code: "ph", name: "Philippines" },
] as const;

interface Feature {
  key: string;
  content: React.ReactNode;
  span?: 2;
}

const cardBase =
  "flex h-full flex-col items-center justify-center rounded-2xl border border-[#1f49ff]/10 bg-transparent p-6 text-center";
const cardFont: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
};

const features: Feature[] = [
  {
    key: "projects",
    content: (
      <>
        <div className="mb-3 flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex size-8 items-center justify-center rounded-full border border-[#1f49ff]/20 bg-[#1f49ff]/10"
              >
                <div className="size-3.5 rounded-full bg-[#1f49ff]/40" />
              </div>
            ))}
          </div>
          <span className="rounded-full bg-[#1f49ff]/10 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-[#1f49ff]" style={cardFont}>
            Limited spots
          </span>
        </div>
        <p className="text-sm uppercase tracking-widest text-[#555]" style={cardFont}>
          Entrance test to filter passionate, high-energy learners
        </p>
      </>
    ),
  },
  {
    key: "mentors",
    span: 2,
    content: (
      <div className="grid w-full grid-cols-3 divide-x divide-[#1f49ff]/10">
        {[
          {
            label: "Weekly tests",
            icon: (
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            ),
          },
          {
            label: "Hackathons",
            icon: (
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            ),
          },
          {
            label: "Prizes",
            icon: (
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0012 0V2z" />
              </svg>
            ),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center gap-3 px-6 py-4"
          >
            <div className="text-[#1f49ff]">{item.icon}</div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#555]" style={cardFont}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "paths",
    span: 2,
    content: (
      <div className="flex flex-col items-center gap-1.5" style={cardFont}>
        <p className="text-sm uppercase tracking-widest text-[#555] lg:max-w-md lg:text-base">
          Learn by building <span className="font-bold">real-world</span> projects. Earn <span className="font-bold">rewards</span>, certificates and <span className="font-bold">reputation</span> that matters. </p>
      </div>
    ),
  },
  {
    key: "peers",
    content: (
      <>
        <ul className="mb-4 flex list-none justify-center" aria-hidden="true">
          {globalCommunityFlags.map((country, i) => (
            <li
              key={country.code}
              className={`relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white ${
                i > 0 ? "-ml-3" : ""
              }`}
              style={{ zIndex: globalCommunityFlags.length - i }}
              title={country.name}
            >
              <span
                className={`fi fi-${country.code} fis block !h-full !w-full bg-cover bg-center`}
              />
            </li>
          ))}
        </ul>
        <p className="text-sm uppercase tracking-widest text-[#555]" style={cardFont}>
          Learn with cracked global peers
        </p>
      </>
    ),
  },
  {
    key: "free",
    content: (
      <div className="flex items-center justify-center gap-4">
        <span className="text-6xl font-extrabold leading-none tracking-tighter text-[#1f49ff]" style={cardFont}>
          $0
        </span>
        <div className="flex flex-col items-start gap-1 leading-tight">
          <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#1f49ff]" style={cardFont}>
            Free forever
          </span>
          <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#555]" style={cardFont}>
            Community driven
          </span>
          <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#555]" style={cardFont}>
            Open source
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "compete",
    span: 2,
    content: (
      <div className="flex flex-col items-center justify-center gap-5 text-center">
        <p className="text-sm uppercase tracking-widest text-[#555] lg:text-base" style={cardFont}>
          Find your type of people and

        </p>
        <div className="flex flex-nowrap items-center justify-center gap-1.5 lg:gap-3">
          {[
            {
              label: "Study",
              icon: (
                <svg viewBox="0 0 24 24" className="size-4 lg:size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              ),
            },
            {
              label: "Compete",
              icon: (
                <svg viewBox="0 0 24 24" className="size-4 lg:size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0012 0V2z" />
                </svg>
              ),
            },
            {
              label: "Collab",
              icon: (
                <svg viewBox="0 0 24 24" className="size-4 lg:size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              ),
            },
            {
              label: "Chill",
              icon: (
                <svg viewBox="0 0 24 24" className="size-4 lg:size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1 rounded-full border border-[#1f49ff]/15 bg-[#1f49ff]/[0.04] px-2 py-1 text-[#1f49ff] lg:gap-2 lg:px-4 lg:py-2"
            >
              {item.icon}
              <span className="text-[0.6rem] font-semibold uppercase tracking-wider lg:text-xs" style={cardFont}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
};

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="scroll-mt-24 px-6 sm:px-12 lg:px-20 xl:px-28"
      aria-labelledby="landing-features-heading"
    >
      <div className="mb-10">
        <p className="pixel-kicker text-center text-2xl text-[#1f49ff]">
          Features
        </p>
      </div>

      <motion.div
        className="grid auto-rows-fr gap-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.key}
            className={`h-full ${feature.span === 2 ? "lg:col-span-2" : ""}`}
            variants={cardVariants}
            custom={i}
          >
            <div className={cardBase}>{feature.content}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
