import type { Poll } from '@/api/polls';
import { LiveStatus } from '@/components/activePollPage/LiveStatus';

interface QuestionCardProps {
  poll: Poll;
  canClose: boolean;
  copyLabel: string;
  onCloseRequest: () => void;
  onCopyLink: () => void;
}

export function QuestionCard({
  poll,
  canClose,
  copyLabel,
  onCloseRequest,
  onCopyLink,
}: QuestionCardProps) {
  return (
    <section
      className="rounded-3xl border border-border bg-surface p-5 shadow-[10px_12px_0_rgba(109,61,242,0.1),0_16px_30px_rgba(23,33,58,0.07)] sm:p-7"
      aria-labelledby="poll-question"
    >
      <p className="m-0 text-[0.78rem] font-extrabold tracking-[0.12em] text-primary uppercase">
        The question
      </p>
      <h1
        className="mt-3 mb-0 font-display text-[clamp(2rem,5vw,3.1rem)] leading-[1.03] tracking-[-0.045em] text-ink"
        id="poll-question"
      >
        {poll.question}
      </h1>
      {poll.description ? (
        <p className="mt-5 mb-0 text-[1rem] leading-[1.6] text-muted-ink">
          {poll.description}
        </p>
      ) : null}
      <p className="mt-5 mb-0 text-sm leading-[1.45] text-muted-ink">
        Answers are anonymous — share what you think.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <LiveStatus status={poll.status} />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-3.5 text-sm font-extrabold text-ink transition-colors hover:bg-canvas"
            type="button"
            onClick={onCopyLink}
          >
            {copyLabel}
          </button>
          {canClose ? (
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-danger/45 bg-surface px-3.5 text-sm font-extrabold text-danger transition-colors hover:bg-[#fff1f2]"
              type="button"
              onClick={onCloseRequest}
            >
              Close poll
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
