import { Avatar, BrandMark, Button, Icon, IconButton, Wordmark } from '@/ui';
import { cx } from '@/utils/classes';

import { shellCopy } from '../copy';
import type { Shell } from '../hooks/useShell';
import { LocationSwitcher } from './LocationSwitcher';
import { NavItem } from './NavItem';

/**
 * The menu down the left of every signed-in page. Beside the consult page it
 * folds to a rail of icons, since that page has its own patient list.
 */
export function Sidebar({ shell }: { shell: Shell }) {
  const compact = shell.isCompact;
  const action = shell.isDoctor
    ? { label: shellCopy.nav.newPrescription, onClick: shell.startPrescription }
    : { label: shellCopy.addPatient, onClick: shell.addPatient };

  return (
    <aside
      className={cx(
        'flex h-screen shrink-0 flex-col gap-6 border-r border-border bg-surface py-6',
        compact ? 'w-rail items-center px-2' : 'w-sidebar px-4',
      )}
    >
      <div className="flex items-center gap-3 px-2">
        <BrandMark />
        {compact ? null : (
          <div className="min-w-0">
            <p className="truncate">
              <Wordmark />
            </p>
            <p className="truncate text-meta text-ink-secondary">
              {shell.clinicName}
            </p>
          </div>
        )}
      </div>

      {compact ? null : <LocationSwitcher shell={shell} />}

      {compact ? (
        <IconButton icon="plus" label={action.label} onClick={action.onClick} />
      ) : (
        <Button
          label={action.label}
          icon={<Icon name="plus" className="size-4" />}
          fullWidth
          onClick={action.onClick}
        />
      )}

      <nav aria-label={shellCopy.nav.label} className="flex flex-col gap-4">
        <ul className="flex flex-col gap-1">
          {shell.nav.map((entry) => (
            <NavItem
              key={entry.key}
              entry={entry}
              compact={compact}
              badge={shell.badges[entry.key]}
            />
          ))}
        </ul>
        {compact || shell.soon.length === 0 ? null : (
          <div className="flex flex-col gap-1">
            <p className="px-4 text-group text-ink-secondary uppercase">
              {shellCopy.comingSoon}
            </p>
            <ul className="flex flex-col gap-1">
              {shell.soon.map((entry) => (
                <NavItem key={entry.key} entry={entry} soon />
              ))}
            </ul>
          </div>
        )}
      </nav>

      <div
        className={cx(
          'mt-auto flex items-center gap-2 border-t border-border pt-4',
          compact ? 'w-full flex-col' : '',
        )}
      >
        <button
          type="button"
          onClick={shell.openProfile}
          aria-label={shell.profileLabel}
          title={shell.profileLabel}
          className={cx(
            'flex min-w-0 items-center gap-3 rounded-full text-left transition-colors hover:bg-primary-tint',
            compact ? 'p-0.5' : 'flex-1 py-1 pr-3 pl-1',
          )}
        >
          <Avatar name={shell.userName} tone="warm" />
          {compact ? null : (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body font-bold">
                {shell.userName}
              </span>
              <span className="block text-meta text-ink-secondary">
                {shell.roleLabel}
              </span>
            </span>
          )}
        </button>
        <IconButton
          icon="logOut"
          label={shellCopy.logout}
          tone="danger"
          className="bg-danger-soft"
          onClick={shell.askLogout}
        />
      </div>
    </aside>
  );
}
