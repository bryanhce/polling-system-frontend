import { BrandLink } from '../shared/BrandLink';
import { LiveStatus } from './LiveStatus';

interface PollHeaderProps {
  status: 'active' | 'closed';
  canClose: boolean;
  onCloseRequest: () => void;
}

export function PollHeader({
  status,
  canClose,
  onCloseRequest,
}: PollHeaderProps) {
  return (
    <header className="mx-auto flex min-h-19 w-full max-w-290 items-center justify-between gap-4 px-4 sm:min-h-22 sm:px-8 lg:px-10">
      <BrandLink />
      <div className="flex items-center gap-3">
        <LiveStatus status={status} />
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
    </header>
  );
}
