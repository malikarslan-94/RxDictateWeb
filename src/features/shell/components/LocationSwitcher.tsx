import { Icon, Popover } from '@/ui';
import { cx } from '@/utils/classes';

import { shellCopy } from '../copy';
import type { Shell } from '../hooks/useShell';

/** "Working at": the location this tab works at, and the menu to change it. */
export function LocationSwitcher({ shell }: { shell: Shell }) {
  const { switcher } = shell;
  return (
    <Popover
      isOpen={switcher.isOpen}
      onClose={switcher.close}
      className="w-72"
      anchor={
        <button
          type="button"
          onClick={switcher.toggle}
          disabled={!shell.canOpenSwitcher}
          aria-expanded={switcher.isOpen}
          className="flex w-full items-center gap-3 rounded-md border border-border px-3 py-2 text-left enabled:hover:border-primary"
        >
          <Icon name="mapPin" className="size-5 shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block text-group text-ink-secondary uppercase">
              {shellCopy.workingAt}
            </span>
            <span className="block truncate text-body font-bold">
              {switcher.current?.name}
            </span>
          </span>
          {shell.canOpenSwitcher ? (
            <Icon name="chevronDown" className="size-4 shrink-0" />
          ) : null}
        </button>
      }
    >
      <p className="px-3 py-2 text-meta text-ink-secondary">
        {shellCopy.chooseLocation}
      </p>
      <ul className="flex flex-col">
        {switcher.options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={option.choose}
              className={cx(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-primary-tint',
                option.isActive && 'bg-primary-tint',
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-bold">
                  {option.name}
                </span>
                {option.details ? (
                  <span className="block truncate text-meta text-ink-secondary">
                    {option.details}
                  </span>
                ) : null}
              </span>
              {option.isActive ? (
                <Icon name="check" className="size-4 text-primary" />
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      {shell.canManageLocations ? (
        <button
          type="button"
          onClick={shell.manageLocations}
          className="mt-1 flex w-full items-center gap-2 rounded-md border-t border-border px-3 py-2 text-left text-meta font-bold text-primary-strong hover:bg-primary-tint"
        >
          <Icon name="settings" className="size-4" />
          {shellCopy.manageLocations}
        </button>
      ) : null}
    </Popover>
  );
}
