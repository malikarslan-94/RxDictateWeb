import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { Select } from '@/ui';
import type { SelectOption } from '@/ui';

export type FormSelectProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = {
  control: Control<T, unknown, TSubmitted>;
  /** A string field; `''` while nothing is chosen. */
  name: FieldPath<T>;
  label: string;
  options: readonly SelectOption[];
  /** Shown while nothing is chosen. */
  placeholder?: string;
  hint?: string;
};

/** One choice from the app's own dropdown, bound to a form field. */
export function FormSelect<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({
  control,
  name,
  label,
  options,
  placeholder,
  hint,
}: FormSelectProps<T, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Select
      ref={field.ref}
      label={label}
      name={field.name}
      options={options}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      placeholder={placeholder}
      hint={hint}
      error={fieldState.error?.message}
    />
  );
}
