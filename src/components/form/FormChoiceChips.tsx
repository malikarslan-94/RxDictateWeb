import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { FilterChip } from '@/ui';

import { FieldError } from './FieldError';

export type ChoiceOption<V extends string> = { label: string; value: V };

export type FormChoiceChipsProps<
  T extends FieldValues,
  V extends string,
  TSubmitted extends FieldValues = T,
> = {
  control: Control<T, unknown, TSubmitted>;
  /** `null` until chosen: nothing is picked for the user. */
  name: FieldPath<T>;
  label: string;
  options: readonly ChoiceOption<V>[];
};

/**
 * One choice from a row of chips that wraps, for options too long or too
 * many for `FormSegmented`: a report's type.
 */
export function FormChoiceChips<
  T extends FieldValues,
  V extends string,
  TSubmitted extends FieldValues = T,
>({ control, name, label, options }: FormChoiceChipsProps<T, V, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-2 text-label">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={field.value === option.value}
            onClick={() => field.onChange(option.value)}
          />
        ))}
      </div>
      <FieldError message={fieldState.error?.message} />
    </div>
  );
}
