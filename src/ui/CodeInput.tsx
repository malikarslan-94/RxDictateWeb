import { useRef } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';

import { commonCopy } from '@/constants/copy';
import { cx } from '@/utils/classes';

export type CodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called once every box is filled, e.g. to verify straight away. */
  onComplete?: (value: string) => void;
  length: number;
  label: string;
  hasError?: boolean;
  /** Dots instead of digits, for a PIN. */
  masked?: boolean;
  autoFocus?: boolean;
};

/**
 * One box per digit. Typing moves on, Backspace moves back, and pasting the
 * whole code fills every box.
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  length,
  label,
  hasError = false,
  masked = false,
  autoFocus = false,
}: CodeInputProps) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  const set = (next: string) => {
    const code = next.replace(/\D/g, '').slice(0, length);
    onChange(code);
    boxes.current[Math.min(code.length, length - 1)]?.focus();
    if (code.length === length) onComplete?.(code);
  };

  const typeAt = (index: number, typed: string) => {
    const digit = typed.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    set(value.slice(0, index) + digit);
  };

  const keyAt = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace') return;
    event.preventDefault();
    set(value.slice(0, Math.max(0, value.length > index ? index : index - 1)));
  };

  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    set(event.clipboardData.getData('text'));
  };

  return (
    <div role="group" aria-label={label} className="flex gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            boxes.current[index] = element;
          }}
          aria-label={commonCopy.codeDigit(label, index + 1)}
          type={masked ? 'password' : 'text'}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          maxLength={1}
          value={digit}
          onChange={(event) => typeAt(index, event.target.value)}
          onKeyDown={(event) => keyAt(index, event)}
          onPaste={paste}
          onFocus={(event) => event.target.select()}
          className={cx(
            'size-14 rounded-md border bg-surface text-center text-title outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            hasError ? 'border-danger' : 'border-border',
          )}
        />
      ))}
    </div>
  );
}
