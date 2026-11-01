import type { ReactNode } from 'react';

import { cx } from '@/utils/classes';

import { Icon } from './Icon';
import type { IconName } from './Icon';

export type BannerProps = {
  children: ReactNode;
  tone?: 'info' | 'warning' | 'danger' | 'success';
  icon?: IconName;
  /** e.g. a "Fix it" link. */
  action?: ReactNode;
};

const TONE = {
  info: 'bg-primary-tint text-ink',
  warning: 'bg-warning-soft text-warning-strong',
  danger: 'bg-danger-soft text-danger',
  success: 'bg-primary-tint text-primary-strong',
};

const ICON: Record<NonNullable<BannerProps['tone']>, IconName> = {
  info: 'alert',
  warning: 'alert',
  danger: 'alert',
  success: 'check',
};

/** A tinted strip with a message: a warning, a tip, a confirmation. */
export function Banner({ children, tone = 'info', icon, action }: BannerProps) {
  return (
    <div
      className={cx(
        'flex items-start gap-3 rounded-md px-4 py-3 text-body',
        TONE[tone],
      )}
    >
      <Icon name={icon ?? ICON[tone]} className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {action}
    </div>
  );
}
