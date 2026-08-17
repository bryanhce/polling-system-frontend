import { Link } from 'react-router';
import { ConversationArtwork } from '@/components/landingPage/ConversationArtwork';

export function LandingHero() {
  return (
    <section
      className="grid items-center gap-[clamp(2.5rem,6vw,6rem)] px-[clamp(0.1rem,3vw,2rem)] md:grid-cols-[minmax(0,1.06fr)_minmax(280px,0.94fr)]"
      aria-labelledby="landing-title"
    >
      <div className="max-w-160">
        <p className="mb-3 text-[0.8rem] font-extrabold tracking-[0.12em] text-primary uppercase">
          A fresh space to listen
        </p>
        <h1
          id="landing-title"
          className="m-0 font-display text-[clamp(3rem,5.2vw,4.9rem)] font-bold tracking-[-0.065em] text-ink leading-[0.95]"
        >
          Ask one good question.{' '}
          <em className="block not-italic text-primary">Hear every voice.</em>
        </h1>
        <p className="mt-[1.45rem] mb-7 max-w-124 text-[clamp(1rem,1.5vw,1.125rem)] leading-[1.65] text-muted-ink">
          Make a quick poll, share it with your people, and let the honest
          answers roll in.
        </p>
        <Link
          className="inline-flex min-h-13 min-w-50 items-center justify-center gap-4 rounded-2xl bg-primary py-1 pr-[1.15rem] pl-[1.45rem] font-extrabold text-white no-underline shadow-[0_8px_0_#4e26c8,0_14px_22px_rgba(109,61,242,0.18)] transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#5d2ee0] active:translate-y-1 active:shadow-[0_4px_0_#4e26c8] motion-reduce:transition-none max-md:flex max-md:w-full"
          to="/polls/new"
        >
          <span>Create a poll</span>
          <span
            className="inline-flex size-9 items-center justify-center rounded-[0.7rem] bg-white/20 text-xl"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
        <p className="mt-[1.15rem] text-[0.825rem] text-muted-ink">
          No account. No setup. Just a good question.
        </p>
      </div>
      <ConversationArtwork />
    </section>
  );
}
