import { forwardRef } from 'react';

import { Input } from './Input';
import type { InputProps } from './Input';

export type DateInputProps = Omit<InputProps, 'type'>;

/**
 * The browser's own date picker, dressed like `Input`. Its value is
 * `YYYY-MM-DD`, as are `min` and `max`.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput(props, ref) {
    return <Input ref={ref} type="date" {...props} />;
  },
);
