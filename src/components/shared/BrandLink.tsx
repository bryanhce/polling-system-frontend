import { Link } from 'react-router';

export function BrandLink() {
  return (
    <Link
      className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-[-0.04em] text-ink no-underline"
      to="/"
      aria-label="Aethelgard Voice home"
    >
      <span
        className="inline-flex size-8 rotate-[-8deg] items-center justify-center rounded-[50%_50%_48%_52%] bg-ink text-sm text-white"
        aria-hidden="true"
      >
        A
      </span>
      <span>Aethelgard Voice</span>
    </Link>
  );
}
