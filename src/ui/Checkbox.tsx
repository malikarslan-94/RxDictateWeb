import { useId } from 'react';
import type { ReactNode } from 'react';

import { cx } from '@/utils/classes';

import { Icon } from './Icon';

export type CheckboxProps = {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** A line under the label, e.g. "Leave unticked on a shared computer". */
  hint?: string;
  disabled?: boolean;
};

/** A square tick box with its label, both clickable. */
export function Checkbox({
  label,
  checked,
  onChange,
  hint,
  disabled = false,
}: CheckboxProps) {
  const id = useId();
  return (
    <div className={cx('flex gap-3', disabled && 'opacity-50')}>
      <span className="relative mt-0.5 flex size-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="peer absolute inset-0 cursor-pointer appearance-none rounded-xs border-2 border-border bg-surface checked:border-primary checked:bg-primary"
        />
        <Icon
          name="check"
          className="pointer-events-none relative m-auto hidden size-3.5 text-ink-on-primary peer-checked:block"
        />
      </span>
      <div>
        <label htmlFor={id} className="cursor-pointer text-body">
          {label}
        </label>
        {hint ? (
          <p id={`${id}-hint`} className="text-meta text-ink-secondary">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
