import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { FieldError } from '@/components';
import { Avatar, SearchInput, Spinner, TextLink } from '@/ui';

import { patientsCopy } from '../copy';
import { usePatientField } from '../hooks/usePatientField';

const copy = patientsCopy.chooser;

export type FormPatientFieldProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = {
  /** Typed values `T`; what submit receives may differ (`TSubmitted`). */
  control: Control<T, unknown, TSubmitted>;
  /** A patient id field, `''` until one is chosen. */
  name: FieldPath<T>;
  label: string;
  /** Opened for one patient: shown, not changed. */
  locked?: boolean;
};

/** A form's patient: who's chosen, or a search to choose them. */
export function FormPatientField<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({
  control,
  name,
  label,
  locked = false,
}: FormPatientFieldProps<T, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  const chooser = usePatientField(field.value ?? '', field.onChange);

  return (
    <div>
      <p className="mb-2 text-label">{label}</p>
      {chooser.chosen ? (
        <div className="flex min-h-control items-center gap-3 rounded-control border border-border bg-surface px-4 py-2">
          <Avatar name={chooser.chosen.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-bold">
              {chooser.chosen.name}
            </p>
            <p className="truncate text-meta text-ink-secondary">
              {chooser.chosen.details}
            </p>
          </div>
          {locked ? null : (
            <TextLink label={copy.change} onClick={chooser.change} />
          )}
        </div>
      ) : chooser.isLoadingChosen ? (
        <div className="flex h-control items-center px-4 text-primary">
          <Spinner className="size-4" />
        </div>
      ) : (
        <>
          <SearchInput
            ref={field.ref}
            value={chooser.text}
            onChange={(event) => chooser.setText(event.target.value)}
            onBlur={field.onBlur}
            placeholder={copy.placeholder}
            aria-label={label}
            aria-invalid={fieldState.error ? true : undefined}
          />
          {chooser.isSearching ? (
            <div className="flex justify-center py-3 text-primary">
              <Spinner className="size-4" />
            </div>
          ) : null}
          {chooser.rows.length > 0 ? (
            <ul className="mt-2 flex max-h-60 flex-col overflow-y-auto rounded-card border border-border">
              {chooser.rows.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={row.choose}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-primary-tint"
                  >
                    <Avatar name={row.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-body font-bold">
                        {row.name}
                      </span>
                      <span className="block truncate text-meta text-ink-secondary">
                        {row.details}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {chooser.emptyText ? (
            <p className="mt-2 text-meta text-ink-secondary">
              {chooser.emptyText}
            </p>
          ) : null}
        </>
      )}
      <FieldError message={fieldState.error?.message} />
    </div>
  );
}
