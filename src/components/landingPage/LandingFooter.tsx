import { Link } from 'react-router';

export function LandingFooter() {
  return (
    <footer className="mx-auto mt-auto flex min-h-20 w-full max-w-290 items-center justify-between border-t border-dashed border-muted-ink/30 px-4 text-xs text-muted-ink sm:px-8 lg:px-10 max-sm:min-h-0 max-sm:flex-col max-sm:items-start max-sm:justify-center max-sm:gap-2 max-sm:py-4">
      <span>Made for curious teams and candid conversations.</span>
      <Link className="font-extrabold text-primary" to="/polls/new">
        Start a poll
      </Link>
    </footer>
  );
}
