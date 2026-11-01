import { NavLink } from 'react-router';

import { Icon } from '@/ui';
import { cx } from '@/utils/classes';

import type { NavEntry } from '../constants';
import { shellCopy } from '../copy';

export type NavItemProps = {
  entry: NavEntry;
  /** Icon only, on the narrow rail beside the consult page. */
  compact?: boolean;
  /** Not built yet: muted, and never shown as the current page. */
  soon?: boolean;
  /** How many wait there, e.g. new reports. Nothing at zero. */
  badge?: number;
};

/** One line of the menu. */
export function NavItem({
  entry,
  compact = false,
  soon = false,
  badge = 0,
}: NavItemProps) {
  const name = shellCopy.nav[entry.key];
  const label = badge > 0 ? shellCopy.withCount(name, badge) : name;
  return (
    <li>
      <NavLink
        to={entry.path}
        title={compact ? label : undefined}
        aria-label={compact || badge > 0 ? label : undefined}
        className={({ isActive }) =>
          cx(
            'relative flex items-center gap-3 rounded-full text-body font-bold transition-colors',
            compact ? 'size-11 justify-center' : 'px-4 py-2.5',
            isActive && !soon
              ? 'bg-primary-soft text-primary-strong'
              : 'hover:bg-neutral-soft',
            soon && 'text-ink-secondary',
          )
        }
      >
        <Icon name={entry.icon} className="size-5 shrink-0" />
        {compact ? null : <span className="flex-1">{name}</span>}
        {badge > 0 ? (
          <span
            aria-hidden
            className={cx(
              'flex h-5 min-w-5 items-center justify-center rounded-full bg-badge px-1.5 text-chip text-ink-on-primary',
              compact && 'absolute -top-0.5 -right-0.5',
            )}
          >
            {badge}
          </span>
        ) : null}
      </NavLink>
    </li>
  );
}
