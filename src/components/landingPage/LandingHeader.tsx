import { BrandLink } from '../shared/BrandLink';

export function LandingHeader() {
  return (
    <header className="mx-auto flex min-h-19 w-full max-w-290 items-center justify-between px-4 sm:min-h-22 sm:px-8 lg:px-10">
      <BrandLink />
      <span className="hidden text-sm text-muted-ink sm:block">
        Anonymous polling, made human
      </span>
    </header>
  );
}
