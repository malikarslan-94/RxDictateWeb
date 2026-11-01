import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { PageHeader } from '@/components';
import { Icon } from '@/ui';
import { cx } from '@/utils/classes';

import { SETTINGS_SECTIONS } from '../constants';
import { settingsCopy } from '../copy';

export type SettingsLayoutProps = {
  title: string;
  /** e.g. "Add assistant" at the top right. */
  actions?: ReactNode;
  children: ReactNode;
};

/** Every Settings page: the menu of sections on the left, the page beside it. */
export function SettingsLayout({
  title,
  actions,
  children,
}: SettingsLayoutProps) {
  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader
        icon="settings"
        title={settingsCopy.title}
        meta={title}
        actions={actions}
      />
      <div className="flex items-start gap-8">
        <nav aria-label={settingsCopy.title} className="w-56 shrink-0">
          <ul className="flex flex-col gap-1">
            {SETTINGS_SECTIONS.map((section) => (
              <li key={section.key}>
                <NavLink
                  to={section.path}
                  className={({ isActive }) =>
                    cx(
                      'flex items-center gap-3 rounded-full px-4 py-2.5 text-body font-bold transition-colors',
                      isActive
                        ? 'bg-surface text-primary-strong'
                        : 'hover:bg-surface',
                    )
                  }
                >
                  <Icon name={section.icon} className="size-5" />
                  {settingsCopy.sections[section.key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex max-w-4xl min-w-0 flex-1 flex-col gap-5">
          {children}
        </div>
      </div>
    </div>
  );
}
