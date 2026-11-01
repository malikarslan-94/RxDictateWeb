import { StateMessage } from '@/components';
import { Banner, Dialog, Icon, SearchInput, Spinner } from '@/ui';

import { templatesCopy } from '../copy';
import { useTemplatePicker } from '../hooks/useTemplatePicker';
import type { UseTemplatePickerOptions } from '../hooks/useTemplatePicker';

const copy = templatesCopy.picker;

export type TemplatePickerDialogProps = UseTemplatePickerOptions & {
  /** The prescription already has lines: the template adds to them. */
  isAdding: boolean;
  /** Why the last one didn't apply. */
  error?: string;
};

/** The doctor's templates, to start a prescription from or add to it. */
export function TemplatePickerDialog({
  isAdding,
  error,
  ...options
}: TemplatePickerDialogProps) {
  const picker = useTemplatePicker(options);

  return (
    <Dialog
      title={isAdding ? copy.addTitle : copy.title}
      description={isAdding ? copy.description : undefined}
      width="wide"
      onClose={options.onClose}
    >
      <SearchInput
        value={picker.text}
        onChange={(event) => picker.setText(event.target.value)}
        placeholder={copy.searchPlaceholder}
        aria-label={copy.searchPlaceholder}
      />
      {error ? <Banner tone="danger">{error}</Banner> : null}
      {picker.rows.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {picker.rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                aria-label={copy.use(row.name)}
                disabled={picker.isBusy}
                onClick={row.pick}
                className="flex w-full items-center gap-3 rounded-card border border-border p-4 text-left transition-colors hover:border-primary disabled:cursor-wait"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-strong">
                  <Icon name="template" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{row.name}</span>
                  <span className="block text-meta text-ink-secondary">
                    {row.summary}
                  </span>
                  {row.medicineLine ? (
                    <span className="block truncate text-meta">
                      {row.medicineLine}
                    </span>
                  ) : null}
                </span>
                {row.isPicking ? (
                  <Spinner className="size-5 text-primary" />
                ) : (
                  <Icon
                    name="chevronRight"
                    className="size-4 text-ink-secondary"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <StateMessage
          isLoading={picker.isLoading}
          error={picker.error}
          onRetry={picker.retry}
          empty={picker.isSearching ? copy.noMatch : copy.empty}
        />
      )}
    </Dialog>
  );
}
