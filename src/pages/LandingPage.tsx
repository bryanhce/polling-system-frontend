import { JoinPollSection } from '@/components/landingPage/JoinPollSection';
import { LandingFooter } from '@/components/landingPage/LandingFooter';
import { LandingHeader } from '@/components/landingPage/LandingHeader';
import { LandingHero } from '@/components/landingPage/LandingHero';

export function LandingPage() {
  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <span className="absolute top-[22%] left-[4.5%] hidden size-4.25 rounded-full bg-primary opacity-80 sm:block" />
        <span className="absolute right-[6%] bottom-[21%] size-7 rounded-full bg-secondary" />
        <span className="absolute bottom-[16%] left-[7%] text-[34px] leading-none text-highlight">
          ✦
        </span>
        <span className="absolute top-[18%] right-[4%] hidden text-[34px] leading-none text-secondary sm:block">
          ✦
        </span>
      </div>
      <LandingHeader />
      <main className="mx-auto max-w-290 px-4 pt-[clamp(1.5rem,6vw,5.25rem)] pb-10 sm:px-8 sm:pb-14 lg:px-10">
        <LandingHero />
        <JoinPollSection />
      </main>
      <LandingFooter />
    </div>
  );
}
