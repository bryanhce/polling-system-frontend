import type { PollAnswer } from '@/api/polls';

interface AnswerFeedProps {
  answers: PollAnswer[];
  error: string;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function AnswerFeed({
  answers,
  error,
  canLoadMore,
  isLoadingMore,
  onLoadMore,
}: AnswerFeedProps) {
  return (
    <section aria-labelledby="answers-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[0.78rem] font-extrabold tracking-[0.12em] text-secondary uppercase">
            The conversation
          </p>
          <h2
            className="mt-1 mb-0 font-display text-[clamp(1.7rem,3vw,2.35rem)] tracking-[-0.04em] text-ink"
            id="answers-title"
          >
            Anonymous answers
          </h2>
          <p
            className="m-0 text-sm leading-[1.45] text-muted-ink"
            aria-live="polite"
          >
            {`${answers.length} ${answers.length === 1 ? 'voice' : 'voices'} heard.`}
          </p>
        </div>
      </div>
      <div className="mt-2 max-h-[calc(100svh-12rem)] overflow-y-auto pr-1 sm:pr-2">
        {error ? (
          <div
            className="mt-5 rounded-2xl border border-danger/35 bg-[#fff1f2] p-4 text-[#a62c3b]"
            role="alert"
          >
            <p className="m-0 font-bold">{error}</p>
          </div>
        ) : null}

        {!error && answers.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-secondary/45 bg-[#effcfc] p-6 text-center">
            <span className="text-3xl text-secondary" aria-hidden="true">
              ✦
            </span>
            <p className="mt-2 mb-0 font-display text-xl text-ink">
              No answers yet
            </p>
            <p className="mt-2 mb-0 text-sm leading-normal text-muted-ink">
              Be the first to chime in.
            </p>
          </div>
        ) : null}

        {!error && answers.length > 0 ? (
          <ol className="mt-5 list-none space-y-3 p-0">
            {answers.map((item, index) => (
              <li
                className="rounded-2xl border border-border bg-surface px-4 py-4 text-[0.98rem] leading-[1.55] text-ink shadow-[4px_5px_0_rgba(23,33,58,0.04)]"
                key={`${item.answer}-${index}`}
              >
                {item.answer}
              </li>
            ))}
          </ol>
        ) : null}
        {canLoadMore && !error ? (
          <button
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-extrabold text-primary transition-colors hover:bg-[#f7f4ff] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading answers…' : 'Load more answers'}
          </button>
        ) : null}
      </div>
    </section>
  );
}
