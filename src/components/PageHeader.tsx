import type { ReactNode } from 'react';

import { Icon } from '@/ui';
import type { IconName } from '@/ui';

export type PageHeaderProps = {
  /** The page's own icon, the same one its menu line shows. */
  icon: IconName;
  title: string;
  /** The line under the title: a count, the date and the clinic. */
  meta?: ReactNode;
  /** Right-aligned: a search, the bell, an "Add" button. */
  actions?: ReactNode;
};

/**
 * The top of every page: a white card with the page's icon, its title and a
 * line under it, and the page's actions on the right.
 */
export function PageHeader({ icon, title, meta, actions }: PageHeaderProps) {
  return (
    <header className="flex items-center gap-5 rounded-card border border-border bg-surface px-6 py-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-tint text-primary-strong">
        <Icon name={icon} className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="text-screen-title">{title}</h1>
        {meta ? (
          <p className="mt-1 text-meta text-ink-secondary">{meta}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      ) : null}
    </header>
  );
}
