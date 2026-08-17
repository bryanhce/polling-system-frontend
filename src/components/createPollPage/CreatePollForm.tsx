import { useId, useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { createPoll } from '@/api/polls';
import { PollTextarea } from '@/components/createPollPage/PollTextarea';

const QUESTION_LIMIT = 500;
const DESCRIPTION_LIMIT = 2000;

function validateQuestion(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter a question before launching your poll.';
  if (trimmed.length > QUESTION_LIMIT)
    return `Keep your question to ${QUESTION_LIMIT} characters or fewer.`;
  return '';
}

export function CreatePollForm() {
  const navigate = useNavigate();
  const questionId = useId();
  const descriptionId = useId();
  const questionHintId = useId();
  const descriptionHintId = useId();
  const questionErrorId = useId();
  const descriptionErrorId = useId();
  const submitErrorId = useId();
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuestionError = validateQuestion(question);
    const trimmedDescription = description.trim();
    const nextDescriptionError =
      trimmedDescription.length > DESCRIPTION_LIMIT
        ? `Keep the description to ${DESCRIPTION_LIMIT} characters or fewer.`
        : '';
    setQuestionError(nextQuestionError);
    setDescriptionError(nextDescriptionError);
    setFormError('');
    if (nextQuestionError || nextDescriptionError) return;
    setIsSubmitting(true);
    try {
      const pollId = await createPoll({
        question: question.trim(),
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
      });
      // TODO: Replace transient router state with backend-provided viewer ownership.
      // Refreshing intentionally loses this MVP-only creator signal.
      navigate(`/polls/${encodeURIComponent(pollId)}`, {
        state: { isCreator: true },
      });
    } catch {
      setFormError(
        'We couldn’t launch your poll just now. Your words are safe—please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-3xl border border-border bg-surface p-5 shadow-[12px_14px_0_rgba(109,61,242,0.11),0_18px_35px_rgba(23,33,58,0.08)] sm:p-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <PollTextarea
        label="Question"
        fieldId={questionId}
        hintId={questionHintId}
        errorId={questionErrorId}
        name="question"
        value={question}
        error={questionError}
        placeholder="What would you like to ask?"
        hint={`Make it clear and open-ended. Up to ${QUESTION_LIMIT} characters.`}
        limit={QUESTION_LIMIT}
        minHeightClassName="min-h-35"
        required
        onChange={(value) => {
          setQuestion(value);
          if (questionError) setQuestionError('');
        }}
        onBlur={() => setQuestionError(validateQuestion(question))}
      />
      <div className="mt-7">
        <PollTextarea
          label="Description"
          fieldId={descriptionId}
          hintId={descriptionHintId}
          errorId={descriptionErrorId}
          name="description"
          value={description}
          error={descriptionError}
          placeholder="Add helpful context, if you’d like."
          hint="A little context can help people give more useful answers."
          limit={DESCRIPTION_LIMIT}
          minHeightClassName="min-h-27"
          onChange={(value) => {
            setDescription(value);
            if (descriptionError) setDescriptionError('');
            if (formError) setFormError('');
          }}
        />
      </div>
      {formError ? (
        <div
          className="mt-6 rounded-2xl border border-danger/35 bg-[#fff1f2] px-4 py-3 text-[0.9rem] font-semibold leading-[1.45] text-[#a62c3b]"
          id={submitErrorId}
          role="alert"
        >
          {formError}
        </div>
      ) : null}
      <button
        className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-2 font-extrabold text-white shadow-[0_7px_0_#4e26c8,0_13px_21px_rgba(109,61,242,0.18)] transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#5d2ee0] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 motion-reduce:transition-none"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Launching poll…' : 'Launch poll'}{' '}
        <span aria-hidden="true">{isSubmitting ? '…' : '→'}</span>
      </button>
      <p className="mt-4 mb-0 text-center text-[0.8rem] leading-[1.4] text-muted-ink">
        You can share the link as soon as your poll launches.
      </p>
    </form>
  );
}
