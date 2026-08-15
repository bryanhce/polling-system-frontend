import { useEffect, useRef } from 'react';

interface SubmittedAnswerConfirmationProps {
  focusOnMount: boolean;
}

export function SubmittedAnswerConfirmation({
  focusOnMount,
}: SubmittedAnswerConfirmationProps) {
  const confirmationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusOnMount) confirmationRef.current?.focus();
  }, [focusOnMount]);

  return (
    <div
      className="mt-6 rounded-3xl border border-success/40 bg-[#eafaf3] p-5 text-[#176a50]"
      ref={confirmationRef}
      tabIndex={-1}
      role="status"
    >
      <p className="m-0 font-display text-2xl tracking-[-0.035em]">
        Answer sent
      </p>
      <p className="mt-2 mb-0 leading-normal">Thanks for adding your voice.</p>
    </div>
  );
}
