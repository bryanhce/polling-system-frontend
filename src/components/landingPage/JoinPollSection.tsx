import { useId, useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from 'react-router';

const POLL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

function getPollIdFromReference(reference: string): string | null {
  const trimmedReference = reference.trim();
  if (POLL_ID_PATTERN.test(trimmedReference)) return trimmedReference;

  try {
    const url = new URL(trimmedReference, window.location.origin);
    const pollId = url.pathname.match(/^\/polls\/([^/]+)\/?$/)?.[1];
    const decodedPollId = pollId ? decodeURIComponent(pollId) : null;
    return decodedPollId && POLL_ID_PATTERN.test(decodedPollId)
      ? decodedPollId
      : null;
  } catch (error) {
    console.error('Failed to parse poll reference URL:', error);
    return null;
  }
}

export function JoinPollSection() {
  const navigate = useNavigate();
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const [pollReference, setPollReference] = useState('');
  const [error, setError] = useState('');

  function handleJoin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const pollId = getPollIdFromReference(pollReference);
    if (!pollId) {
      setError('Enter a poll ID or a complete link to a poll.');
      return;
    }
    navigate(`/polls/${encodeURIComponent(pollId)}`);
  }

  return (
    <section
      className="mx-auto mt-[clamp(4rem,10vw,7.5rem)] max-w-196"
      aria-labelledby="join-title"
    >
      <div className="rounded-3xl border border-border/90 bg-surface p-[clamp(1.25rem,4vw,2.1rem)] shadow-[12px_14px_0_rgba(22,191,198,0.13),0_18px_35px_rgba(23,33,58,0.08)] max-sm:rounded-[1.25rem] max-sm:shadow-[7px_8px_0_rgba(22,191,198,0.13),0_14px_28px_rgba(23,33,58,0.07)]">
        <div className="mb-[1.35rem] flex items-center gap-3.5">
          <span
            className="inline-flex size-[3.1rem] rotate-35 items-center justify-center rounded-[0.9rem] bg-[#dffafb] text-2xl text-[#087d84]"
            aria-hidden="true"
          >
            ↗
          </span>
          <div>
            <p className="mb-1 text-xs font-extrabold tracking-[0.12em] text-primary uppercase">
              Already have a poll?
            </p>
            <h2
              id="join-title"
              className="m-0 font-display text-2xl leading-none tracking-[-0.04em] text-ink sm:text-3xl"
            >
              Join the conversation
            </h2>
          </div>
        </div>
        <form onSubmit={handleJoin} noValidate>
          <label
            className="mb-2 block text-sm font-extrabold text-ink"
            htmlFor={inputId}
          >
            Poll ID or link
          </label>
          <div className="flex gap-2.5 max-sm:flex-col">
            <input
              className="min-h-13 min-w-0 flex-1 rounded-[0.9rem] border-[1.5px] border-border bg-[#fffdf8] px-3.5 text-ink placeholder:text-[#8590a5] aria-invalid:border-danger"
              id={inputId}
              name="poll-reference"
              type="text"
              value={pollReference}
              onChange={(event) => {
                setPollReference(event.target.value);
                if (error) setError('');
              }}
              placeholder="Paste your poll link"
              aria-describedby={error ? `${hintId} ${errorId}` : hintId}
              aria-invalid={Boolean(error)}
              autoComplete="off"
            />
            <button
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-1 font-extrabold whitespace-nowrap text-white transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#2d3b5c] motion-reduce:transition-none max-sm:w-full"
              type="submit"
            >
              Join poll <span aria-hidden="true">→</span>
            </button>
          </div>
          <p
            className="mt-2 text-xs leading-[1.35] text-muted-ink"
            id={hintId}
          >
            Paste a link or enter the poll ID you received.
          </p>
          {error ? (
            <p
              className="mt-2 text-xs leading-[1.35] font-bold text-[#b53142]"
              id={errorId}
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </form>
      </div>
      <p className="mx-auto mt-6 text-center text-sm text-muted-ink">
        <span className="mr-1.5 text-success" aria-hidden="true">
          ✦
        </span>{' '}
        Answers stay anonymous, so every voice can be heard.
      </p>
    </section>
  );
}
