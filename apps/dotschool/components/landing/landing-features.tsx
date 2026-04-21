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
  blue?: boolean;
}

const cardBase =
  "group flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#c5d0f5] bg-transparent p-3 text-center sm:p-6";
const cardFont: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
};

const features: Feature[] = [
  {
    key: "projects",
    content: (
      <>
        <div className="mb-2 flex flex-col items-center gap-2 sm:mb-3 sm:gap-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex size-5 items-center justify-center rounded-full border border-[#c5d0f5] bg-[#eef2ff] sm:size-8"
              >
                <div className="size-2 rounded-full bg-[#8da4f2] sm:size-3.5" />
              </div>
            ))}
          </div>
          <span className="rounded-full bg-[#eef2ff] px-2.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide text-[#4a6cf7] sm:px-3 sm:py-1 sm:text-[0.6rem] sm:tracking-wider" style={cardFont}>
            Limited spots
          </span>
        </div>
        <p className="text-[0.6rem] uppercase tracking-wide text-[#555] sm:text-sm sm:tracking-widest" style={cardFont}>
          Entrance test to filter passionate, high-energy learners
        </p>
      </>
    ),
  },
  {
    key: "mentors",
    span: 2,
    content: (
      <div className="grid w-full grid-cols-3 divide-x divide-[#c5d0f5]">
        {[
          {
            label: "Weekly tests",
            icon: (
              <svg viewBox="0 0 24 24" className="size-5 sm:size-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            ),
          },
          {
            label: "Hackathons",
            icon: (
              <svg viewBox="0 0 24 24" className="size-5 sm:size-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            ),
          },
          {
            label: "Prizes",
            icon: (
              <svg viewBox="0 0 24 24" className="size-5 sm:size-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            className="flex flex-col items-center justify-center gap-1.5 px-1 py-2 sm:gap-3 sm:px-6 sm:py-4"
          >
            <div className="text-[#6b8af5]">{item.icon}</div>
            <span className="text-[0.45rem] font-semibold uppercase tracking-wide text-[#555] sm:text-xs sm:tracking-wider" style={cardFont}>
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
    blue: true,
    content: (
      <div className="flex flex-col items-center gap-1.5" style={cardFont}>
        <p className="text-[0.6rem] uppercase tracking-wide text-[#555] sm:text-sm sm:tracking-widest lg:max-w-md lg:text-base">
          Learn by building <span className="font-bold text-[#1f49ff]">real-world</span> projects. Earn <span className="font-bold text-[#1f49ff]">rewards</span>, certificates and <span className="font-bold text-[#1f49ff]">reputation</span> that matters. </p>
      </div>
    ),
  },
  {
    key: "peers",
    content: (
      <>
        <ul className="mb-3 flex list-none justify-center sm:mb-4" aria-hidden="true">
          {globalCommunityFlags.map((country, i) => (
            <li
              key={country.code}
              className={`relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white sm:size-8 ${
                i > 0 ? "-ml-2.5 sm:-ml-3" : ""
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
        <p className="text-[0.6rem] uppercase tracking-wide text-[#555] sm:text-sm sm:tracking-widest" style={cardFont}>
          Learn with cracked global peers
        </p>
      </>
    ),
  },
  {
    key: "free",
    content: (
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <span className="text-3xl font-extrabold leading-none tracking-tighter text-[#6b8af5] sm:text-6xl" style={cardFont}>
          $0
        </span>
        <div className="flex flex-col items-start gap-0.5 leading-tight sm:gap-1">
          <span className="text-[0.55rem] font-semibold uppercase tracking-wide text-[#4a6cf7] sm:text-[0.7rem] sm:tracking-widest" style={cardFont}>
            Free forever
          </span>
          <span className="text-[0.55rem] font-semibold uppercase tracking-wide text-[#555] sm:text-[0.7rem] sm:tracking-widest" style={cardFont}>
            Community driven
          </span>
          <span className="text-[0.55rem] font-semibold uppercase tracking-wide text-[#555] sm:text-[0.7rem] sm:tracking-widest" style={cardFont}>
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
      <div className="flex flex-col items-center justify-center gap-3 text-center sm:gap-5">
        <p className="text-[0.6rem] uppercase tracking-wide text-[#555] sm:text-sm sm:tracking-widest lg:text-base" style={cardFont}>
          Find your type of people and

        </p>
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 lg:gap-3">
          {[
            {
              label: "Study",
              icon: (
                <svg viewBox="0 0 24 24" className="size-3 sm:size-4 lg:size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              ),
            },
            {
              label: "Compete",
              icon: (
                <svg viewBox="0 0 24 24" className="size-3 sm:size-4 lg:size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                <svg viewBox="0 0 24 24" className="size-3 sm:size-4 lg:size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                <svg viewBox="0 0 24 24" className="size-3 sm:size-4 lg:size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
              className="flex items-center gap-0.5 rounded-full border border-[#c5d0f5] bg-[#f4f6ff] px-1.5 py-0.5 text-[#6b8af5] sm:gap-1 sm:px-2 sm:py-1 lg:gap-2 lg:px-4 lg:py-2"
            >
              {item.icon}
              <span className="text-[0.45rem] font-semibold uppercase tracking-wide sm:text-[0.6rem] sm:tracking-wider lg:text-xs" style={cardFont}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="scroll-mt-24 px-2 sm:px-12 lg:px-20 xl:px-28"
      aria-labelledby="landing-features-heading"
    >
      <div className="mb-6 sm:mb-10">
        <p className="pixel-kicker text-center text-xl text-[#1f49ff] sm:text-2xl">
          Features
        </p>
      </div>

      <div className="grid auto-rows-fr gap-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.key}
            className={`h-full ${feature.span === 2 ? "lg:col-span-2" : ""}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              delay: i * 0.06,
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1] as const,
            }}
          >
            <div className={cardBase}>{feature.content}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
