import { commonCopy } from '@/constants/copy';
import { cx } from '@/utils/classes';

import { Icon } from './Icon';
import type { IconName } from './Icon';
import { IconButton } from './IconButton';

export type ToastTone = 'success' | 'danger';

export type ToastProps = {
  tone: ToastTone;
  /** One line each: what happened, or what went wrong. */
  messages: readonly string[];
  onClose: () => void;
};

const LOOK: Record<ToastTone, { icon: IconName; badge: string; edge: string }> =
  {
    success: {
      icon: 'check',
      badge: 'bg-success-soft text-primary-strong',
      edge: 'border-l-success',
    },
    danger: {
      icon: 'alert',
      badge: 'bg-danger-soft text-danger',
      edge: 'border-l-danger',
    },
  };

/**
 * A passing message: a tick for something done, a warning for something
 * that failed. Not a modal; it never takes focus.
 */
export function Toast({ tone, messages, onClose }: ToastProps) {
  const look = LOOK[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx(
        'pointer-events-auto flex w-toast max-w-full items-start gap-3 rounded-card border border-l-4 border-border bg-surface p-4 shadow-menu motion-safe:animate-toast-in',
        look.edge,
      )}
    >
      <span
        className={cx(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          look.badge,
        )}
      >
        <Icon name={look.icon} className="size-4" />
      </span>
      <ul className="min-w-0 flex-1 self-center">
        {messages.map((message) => (
          <li key={message} className="text-body font-bold">
            {message}
          </li>
        ))}
      </ul>
      <IconButton
        icon="close"
        label={commonCopy.close}
        size="small"
        tone="plain"
        onClick={onClose}
      />
    </div>
  );
}
