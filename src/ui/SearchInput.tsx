import { forwardRef } from 'react';

import { Icon } from './Icon';
import { Input } from './Input';
import type { InputProps } from './Input';
import { Kbd } from './Kbd';

export type SearchInputProps = Omit<InputProps, 'leading' | 'trailing'> & {
  /** The shortcut that focuses it, e.g. "Ctrl K" or "/". */
  shortcut?: string;
};

/** A search field: magnifier, text, and the key that jumps to it. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ shortcut, ...rest }, ref) {
    return (
      <Input
        ref={ref}
        type="search"
        leading={<Icon name="search" className="size-4 text-ink-secondary" />}
        trailing={shortcut ? <Kbd keys={shortcut} /> : undefined}
        {...rest}
      />
    );
  },
);
