import { forwardRef, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useListbox } from '@/hooks/useListbox';
import { useMenuPlacement } from '@/hooks/useMenuPlacement';
import { cx } from '@/utils/classes';

import { Icon } from './Icon';

export type SelectOption = { value: string; label: string };

export type SelectProps = {
  label?: string;
  options: readonly SelectOption[];
  /** The chosen option's value; `''` while nothing is chosen. */
  value: string;
  onChange: (value: string) => void;
  /** Compact, for a table cell. */
  size?: 'medium' | 'small';
  disabled?: boolean;
  /** Shown while nothing is chosen. */
  placeholder?: string;
  /** Where the list opens while nothing is chosen, e.g. 9:00 am. */
  startAt?: string;
  /** Shown under the field and turns the border red. */
  error?: string;
  hint?: string;
  id?: string;
  name?: string;
  onBlur?: () => void;
  className?: string;
  'aria-label'?: string;
};

/**
 * A dropdown in the app's own look: a rounded list under the field (or over
 * it near the bottom of the window), never the browser's square one. Focus
 * stays on the field, so the keyboard works as it does on a native select.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      label,
      options,
      value,
      onChange,
      size = 'medium',
      disabled = false,
      placeholder,
      startAt,
      error,
      hint,
      id,
      name,
      onBlur,
      className,
      'aria-label': ariaLabel,
    },
    ref,
  ) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const listId = `${fieldId}-list`;
    const noteId = `${fieldId}-note`;
    const optionId = (index: number) => `${fieldId}-option-${index}`;
    const note = error || hint;

    const trigger = useRef<HTMLButtonElement | null>(null);
    const chosenIndex = options.findIndex((option) => option.value === value);
    const chosen = options[chosenIndex] ?? null;
    const box = useListbox({
      labels: options.map((option) => option.label),
      chosenIndex,
      startIndex: options.findIndex((option) => option.value === startAt),
      onChoose: (index) => onChange(options[index].value),
      disabled,
    });
    const { list, style } = useMenuPlacement({
      isOpen: box.isOpen,
      trigger,
      activeId: optionId(box.active),
      onClose: box.close,
    });

    return (
      <div className={className}>
        {label ? (
          <label htmlFor={fieldId} className="mb-2 block text-label">
            {label}
          </label>
        ) : null}
        <button
          ref={(node) => {
            trigger.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          id={fieldId}
          name={name}
          type="button"
          role="combobox"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={box.isOpen}
          aria-controls={listId}
          aria-activedescendant={box.isOpen ? optionId(box.active) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          disabled={disabled}
          onClick={box.toggle}
          onKeyDown={box.handleKeyDown}
          onBlur={() => {
            box.close();
            onBlur?.();
          }}
          className={cx(
            'flex w-full items-center gap-2 rounded-control border bg-surface pr-3 pl-4 text-left transition-colors outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:border-transparent disabled:bg-transparent',
            size === 'medium'
              ? 'h-control text-body'
              : 'h-control-sm text-meta',
            error
              ? 'border-danger'
              : box.isOpen
                ? 'border-primary'
                : 'border-border',
          )}
        >
          <span
            className={cx(
              'min-w-0 flex-1 truncate',
              !chosen && 'text-ink-secondary',
            )}
          >
            {chosen?.label ?? placeholder}
          </span>
          {disabled ? null : (
            <Icon
              name={box.isOpen ? 'chevronUp' : 'chevronDown'}
              className="size-4 shrink-0 text-ink-secondary"
            />
          )}
        </button>
        {note ? (
          <p
            id={noteId}
            className={cx(
              'mt-1 ml-3 text-meta',
              error ? 'text-danger' : 'text-ink-secondary',
            )}
          >
            {note}
          </p>
        ) : null}
        {box.isOpen
          ? createPortal(
              <ul
                ref={list}
                id={listId}
                role="listbox"
                aria-labelledby={fieldId}
                style={style}
                // Keep focus on the field, so its keys keep working.
                onMouseDown={(event) => event.preventDefault()}
                className="fixed z-55 max-h-72 overflow-y-auto rounded-card border border-border bg-surface p-1.5 shadow-menu"
              >
                {options.map((option, index) => {
                  const isChosen = index === chosenIndex;
                  return (
                    <li
                      key={option.value}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isChosen}
                      onMouseEnter={() => box.setActive(index)}
                      onClick={() => box.choose(index)}
                      className={cx(
                        'flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2 whitespace-nowrap',
                        size === 'medium' ? 'text-body' : 'text-meta',
                        index === box.active && 'bg-primary-tint',
                        isChosen && 'font-bold text-primary-strong',
                      )}
                    >
                      <span className="flex-1">{option.label}</span>
                      {isChosen ? (
                        <Icon name="check" className="size-4 shrink-0" />
                      ) : null}
                    </li>
                  );
                })}
              </ul>,
              document.body,
            )
          : null}
      </div>
    );
  },
);
