import { useId, useRef, useState } from 'react';
import type { SubmitEvent } from 'react';

const ANSWER_LIMIT = 1000;

interface AnswerComposerProps {
  isSubmitting: boolean;
  error: string;
  onSubmit: (answer: string, initiatedWithKeyboard: boolean) => void;
}

export function AnswerComposer({
  isSubmitting,
  error,
  onSubmit,
}: AnswerComposerProps) {
  const answerId = useId();
  const hintId = useId();
  const errorId = useId();
  const [answer, setAnswer] = useState('');
  const [validationError, setValidationError] = useState('');
  const keyboardSubmit = useRef(false);
  const trimmedAnswer = answer.trim();
  const displayedError = validationError || error;

  function validate(value: string) {
    if (!value.trim()) return 'Write an answer before sending it.';
    if (value.trim().length > ANSWER_LIMIT)
      return `Keep your answer to ${ANSWER_LIMIT} characters or fewer.`;
    return '';
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validate(answer);
    setValidationError(nextError);
    if (nextError) return;
    onSubmit(trimmedAnswer, keyboardSubmit.current);
    keyboardSubmit.current = false;
  }

  return (
    <section
      className="mt-6 rounded-3xl border border-border bg-surface p-5 shadow-[8px_10px_0_rgba(22,191,198,0.1),0_14px_26px_rgba(23,33,58,0.06)] sm:p-6"
      aria-labelledby="answer-title"
    >
      <h2
        className="m-0 font-display text-2xl tracking-[-0.035em] text-ink"
        id="answer-title"
      >
        Add your voice
      </h2>
      <p className="mt-2 mb-0 text-sm leading-[1.45] text-muted-ink">
        Answers are anonymous — share what you think.
      </p>
      <form className="mt-4" onSubmit={handleSubmit} noValidate>
        <label
          className="mb-2 block text-[0.94rem] font-extrabold text-ink"
          htmlFor={answerId}
        >
          Your answer{' '}
          <span className="text-danger" aria-label="required">
            *
          </span>
        </label>
        <textarea
          className="min-h-31 w-full resize-y rounded-2xl border-[1.5px] border-border bg-[#fffdf8] px-4 py-3.5 leading-normal text-ink placeholder:text-[#8590a5] aria-invalid:border-danger"
          id={answerId}
          value={answer}
          maxLength={ANSWER_LIMIT + 1}
          aria-describedby={displayedError ? `${hintId} ${errorId}` : hintId}
          aria-invalid={Boolean(displayedError)}
          placeholder="Share your thoughts…"
          onChange={(event) => {
            setAnswer(event.target.value);
            if (validationError) setValidationError('');
          }}
          onBlur={() => setValidationError(validate(answer))}
        />
        <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[0.8rem] leading-[1.4] text-muted-ink">
          <span id={hintId}>
            Be thoughtful and specific. Up to {ANSWER_LIMIT} characters.
          </span>
          <span aria-live="polite">
            {answer.length}/{ANSWER_LIMIT}
          </span>
        </div>
        {displayedError ? (
          <p
            className="mt-2 mb-0 text-[0.82rem] font-bold text-danger"
            id={errorId}
            role="alert"
          >
            {displayedError}
          </p>
        ) : null}
        <button
          className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2 font-extrabold text-white shadow-[0_7px_0_#4e26c8,0_13px_21px_rgba(109,61,242,0.18)] transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#5d2ee0] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 motion-reduce:transition-none"
          type="submit"
          disabled={
            !trimmedAnswer ||
            trimmedAnswer.length > ANSWER_LIMIT ||
            isSubmitting
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              keyboardSubmit.current = true;
            }
          }}
        >
          {isSubmitting ? 'Sending answer…' : 'Send answer'}
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  );
}
