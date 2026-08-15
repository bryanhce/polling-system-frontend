interface LiveStatusProps {
  status: 'active' | 'closed';
}

export function LiveStatus({ status }: LiveStatusProps) {
  const isLive = status === 'active';

  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 rounded-full px-3 text-[0.78rem] font-extrabold ${
        isLive ? 'bg-success/15 text-[#137255]' : 'bg-[#e9edf5] text-[#41506c]'
      }`}
      role="status"
    >
      <span
        className={`size-2 rounded-full ${isLive ? 'bg-success' : 'bg-[#71809b]'}`}
        aria-hidden="true"
      />
      {isLive ? 'Live' : 'Closed'}
    </span>
  );
}
