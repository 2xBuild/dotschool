import { SiteFooter } from "@/components/site/site-footer";

import HowItWorks from "./how-it-works";
import { LandingFeatures } from "./landing-features";
import { LandingHeroBlock } from "./landing-hero-block";
import { LandingVolunteers } from "./landing-volunteers";

export function Landing() {
  return (
    <div className="landing-light flex min-h-full flex-col bg-[#f3f6fb] text-[#111111]">
      <main className="px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto flex max-w-[1540px] flex-col gap-8 pb-10 sm:gap-16 sm:pb-14">
          <LandingHeroBlock />

          <LandingFeatures />

          <HowItWorks autoPlayDuration={7000} />

          <LandingVolunteers />
        </div>
      </main>

      <SiteFooter forceBlueTheme />
    </div>
  );
}
