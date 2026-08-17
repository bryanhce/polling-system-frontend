import { CreatePollForm } from '@/components/createPollPage/CreatePollForm';
import { CreatePollHeader } from '@/components/createPollPage/CreatePollHeader';
import { CreatePollIntroduction } from '@/components/createPollPage/CreatePollIntroduction';

export function CreatePollPage() {
  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden bg-canvas">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <span className="absolute top-[13%] left-[5%] size-4 rounded-full bg-highlight" />
        <span className="absolute top-[29%] right-[7%] size-7 rounded-full bg-secondary/80" />
        <span className="absolute right-[13%] bottom-[12%] text-4xl text-primary">
          ✦
        </span>
        <span className="absolute bottom-[22%] left-[8%] hidden text-3xl text-secondary sm:block">
          ✦
        </span>
      </div>
      <CreatePollHeader />
      <main className="mx-auto flex w-full max-w-180 flex-1 items-center px-4 py-10 sm:px-8 sm:py-14">
        <section className="w-full" aria-labelledby="new-poll-title">
          <CreatePollIntroduction />
          <CreatePollForm />
        </section>
      </main>
    </div>
  );
}
