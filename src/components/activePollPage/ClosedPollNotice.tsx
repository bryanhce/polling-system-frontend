interface ClosedPollNoticeProps {
  message: string;
}

export function ClosedPollNotice({ message }: ClosedPollNoticeProps) {
  return (
    <div className="mt-6 rounded-3xl border border-border bg-[#f3f5f9] p-5">
      <p className="m-0 font-display text-2xl tracking-[-0.035em] text-ink">
        Final results
      </p>
      <p className="mt-2 mb-0 leading-normal text-muted-ink">
        {message ||
          'This poll is closed. You can still read every answer below.'}
      </p>
    </div>
  );
}
