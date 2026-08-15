import { PageFrame } from './PageFrame';

export function LoadingPollPage() {
  return (
    <PageFrame>
      <main className="mx-auto w-full max-w-290 flex-1 px-4 py-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
          <div className="h-80 animate-pulse rounded-3xl bg-surface" />
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-2xl bg-surface" />
            {[0, 1, 2].map((item) => (
              <div
                className="h-20 animate-pulse rounded-2xl bg-surface"
                key={item}
              />
            ))}
          </div>
        </div>
      </main>
    </PageFrame>
  );
}
