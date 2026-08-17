import { useEffect, useRef } from 'react';

interface ClosePollDialogProps {
  isOpen: boolean;
  isClosing: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClosePollDialog({
  isOpen,
  isClosing,
  error,
  onCancel,
  onConfirm,
}: ClosePollDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-surface p-0 text-ink shadow-[0_22px_60px_rgba(23,33,58,0.24)] backdrop:bg-ink/35"
      ref={dialogRef}
      aria-labelledby="close-poll-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!isClosing) onCancel();
      }}
      onClose={() => {
        if (isOpen && !isClosing) onCancel();
      }}
    >
      <div className="p-6 sm:p-7">
        <p className="m-0 text-[0.78rem] font-extrabold tracking-[0.12em] text-danger uppercase">
          Irreversible action
        </p>
        <h2
          className="mt-2 mb-0 font-display text-3xl tracking-[-0.04em]"
          id="close-poll-title"
        >
          Close this poll?
        </h2>
        <p className="mt-3 mb-0 leading-[1.55] text-muted-ink">
          No new answers can be added once the poll is closed. Existing answers
          will remain visible.
        </p>
        {error ? (
          <p
            className="mt-4 mb-0 rounded-xl bg-[#fff1f2] p-3 text-sm font-bold text-[#a62c3b]"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-xl border border-border px-4 font-extrabold text-ink"
            type="button"
            onClick={onCancel}
            disabled={isClosing}
          >
            Cancel
          </button>
          <button
            className="min-h-11 rounded-xl bg-danger px-4 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            onClick={onConfirm}
            disabled={isClosing}
          >
            {isClosing ? 'Closing poll...' : 'Close poll'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
