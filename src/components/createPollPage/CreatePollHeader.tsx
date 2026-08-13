import { Link } from 'react-router';
import { BrandLink } from '../shared/BrandLink';

export function CreatePollHeader() {
  return (
    <header className="mx-auto flex min-h-19 w-full max-w-290 items-center justify-between px-4 sm:min-h-22 sm:px-8 lg:px-10">
      <BrandLink />
      <Link
        className="hidden min-h-11 items-center font-extrabold text-primary no-underline sm:inline-flex"
        to="/"
      >
        ← Back home
      </Link>
    </header>
  );
}
