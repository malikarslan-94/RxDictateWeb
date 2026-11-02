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
  /**
   * One value, `null` until chosen: nothing is picked for the user. With
   * `multiple`, a list of values, empty until some are picked.
   */
  name: FieldPath<T>;
  label: string;
  options: readonly ChoiceOption<V>[];
  /** Any number may be picked: each chip turns on and off. */
  multiple?: boolean;
  hint?: string;
};

/**
 * A choice from a row of chips that wraps, for options too long or too many
 * for `FormSegmented`: a report's type, or a doctor's specialties.
 */
export function FormChoiceChips<
  T extends FieldValues,
  V extends string,
  TSubmitted extends FieldValues = T,
>({
  control,
  name,
  label,
  options,
  multiple = false,
  hint,
}: FormChoiceChipsProps<T, V, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  const picked: readonly string[] = multiple ? (field.value ?? []) : [];
  const isPicked = (value: V) =>
    multiple ? picked.includes(value) : field.value === value;
  const choose = (value: V) =>
    field.onChange(
      multiple
        ? isPicked(value)
          ? picked.filter((item) => item !== value)
          : [...picked, value]
        : value,
    );
  return (
    <div role={multiple ? 'group' : 'radiogroup'} aria-label={label}>
      <p className="mb-2 text-label">{label}</p>
      {hint ? (
        <p className="mb-2 text-meta text-ink-secondary">{hint}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={isPicked(option.value)}
            onClick={() => choose(option.value)}
          />
        ))}
      </div>
      <FieldError message={fieldState.error?.message} />
    </div>
  );
}
