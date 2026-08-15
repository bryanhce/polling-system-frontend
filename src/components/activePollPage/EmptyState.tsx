import { Link } from 'react-router';

interface EmptyStateProps {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function EmptyState({
  title,
  description,
  retryLabel,
  onRetry,
}: EmptyStateProps) {
  return (
    <main className="mx-auto flex w-full max-w-180 flex-1 items-center px-4 py-10 sm:px-8">
      <section className="w-full rounded-3xl border border-border bg-surface p-7 text-center shadow-[10px_12px_0_rgba(109,61,242,0.1),0_16px_30px_rgba(23,33,58,0.07)]">
        <span className="text-4xl text-primary" aria-hidden="true">
          ✦
        </span>
        <h1 className="mt-3 mb-0 font-display text-3xl tracking-[-0.04em] text-ink">
          {title}
        </h1>
        <p className="mt-3 mb-0 leading-[1.55] text-muted-ink">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onRetry && retryLabel ? (
            <button
              className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-extrabold text-white"
              type="button"
              onClick={onRetry}
            >
              {retryLabel}
            </button>
          ) : null}
          <Link
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-extrabold text-ink no-underline"
            to="/"
          >
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
