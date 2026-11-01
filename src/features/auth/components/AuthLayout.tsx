import type { ReactNode } from 'react';

import { HeroPanel } from './HeroPanel';

/** Sign-in pages: the hero on the left, the step on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <HeroPanel />
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
