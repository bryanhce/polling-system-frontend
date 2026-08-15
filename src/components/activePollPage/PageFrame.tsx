import type { ReactNode } from 'react';

interface PageFrameProps {
  children: ReactNode;
}

export function PageFrame({ children }: PageFrameProps) {
  return <div className="flex min-h-svh flex-col bg-canvas">{children}</div>;
}
