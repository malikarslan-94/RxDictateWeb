import { Icon, Kbd, Spinner } from '@/ui';
import { cx } from '@/utils/classes';

import { rxCopy } from '../copy';
import { useQuickMedicine } from '../hooks/useQuickMedicine';
import type { RxEditor } from '../hooks/useRxEditor';

const copy = rxCopy.editor;

/** "Type a medicine… e.g. metf 500 1-0-1 30d", Enter, and it's a row. */
export function QuickMedicineLine({ editor }: { editor: RxEditor }) {
  const quick = useQuickMedicine(editor);
  const isOpen = quick.typedName.length > 0;

  return (
    <div className="relative">
      <div className="flex h-control items-center gap-3 rounded-control border-2 border-primary bg-surface px-4">
        {quick.isAdding ? (
          <Spinner className="size-4 text-primary" />
        ) : (
          <Icon name="plus" className="size-4 text-primary" />
        )}
        <input
          aria-label={copy.quickLabel}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          value={quick.text}
          onChange={(event) => quick.setText(event.target.value)}
          onKeyDown={quick.onKeyDown}
          placeholder={copy.quickPlaceholder}
          className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-ink-secondary"
        />
        <Kbd keys={copy.enter} />
      </div>
      {isOpen ? (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-card border border-border bg-surface py-1"
        >
          {quick.matches.map((drug, index) => (
            <li
              key={drug.id}
              role="option"
              aria-selected={index === quick.highlighted}
            >
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => quick.pick(drug)}
                className={cx(
                  'flex w-full items-center justify-between px-4 py-2 text-left',
                  index === quick.highlighted && 'bg-primary-tint',
                )}
              >
                <span className="text-body">
                  <strong>{drug.brand || drug.generic}</strong> {drug.strength}{' '}
                  {rxCopy.form[drug.form].toLowerCase()}
                </span>
                <span className="text-meta text-ink-secondary">
                  {drug.generic}
                </span>
              </button>
            </li>
          ))}
          <li
            role="option"
            aria-selected={quick.highlighted === quick.matches.length}
          >
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => quick.pick(null)}
              className={cx(
                'w-full px-4 py-2 text-left text-body text-primary-strong',
                quick.highlighted === quick.matches.length && 'bg-primary-tint',
              )}
            >
              {copy.noMatch(quick.typedName)}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
