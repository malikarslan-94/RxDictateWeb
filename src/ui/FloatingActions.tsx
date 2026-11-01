import type { ReactNode } from 'react';

export type FloatingActionsProps = {
  /** Shown only while the page's own actions are out of sight. */
  visible: boolean;
  /** e.g. "Unsaved changes". */
  message: string;
  /** The action, e.g. Save. */
  children: ReactNode;
};

/**
 * A bar that floats at the bottom right of the page while there's something
 * to save and the page's own Save is scrolled out of sight. Put it after
 * that Save: it's a zero-height slot that's always there, so showing or
 * hiding it never moves the page.
 */
export function FloatingActions({
  visible,
  message,
  children,
}: FloatingActionsProps) {
  return (
    <div className="pointer-events-none sticky bottom-6 z-30 h-0">
      {visible ? (
        <div
          role="region"
          aria-label={message}
          className="pointer-events-auto absolute right-0 bottom-0 flex items-center gap-4 rounded-full border border-border bg-surface py-2 pr-2 pl-5 shadow-menu"
        >
          <p className="flex items-center gap-2 text-meta font-bold whitespace-nowrap">
            <span className="size-2 rounded-full bg-warning" />
            {message}
          </p>
          {children}
        </div>
      ) : null}
    </div>
  );
}
