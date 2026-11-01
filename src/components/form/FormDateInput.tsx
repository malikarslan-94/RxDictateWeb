import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { DateInput } from '@/ui';

export type FormDateInputProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = {
  control: Control<T, unknown, TSubmitted>;
  /** A `YYYY-MM-DD` field, the API's own format. */
  name: FieldPath<T>;
  label: string;
  hint?: string;
  /** The earliest and latest days it allows, as `YYYY-MM-DD`. */
  min?: string;
  max?: string;
  containerClassName?: string;
};

/** The browser's date picker, bound to a `YYYY-MM-DD` field. */
export function FormDateInput<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({
  control,
  name,
  label,
  hint,
  min,
  max,
  containerClassName,
}: FormDateInputProps<T, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <DateInput
      label={label}
      hint={hint}
      min={min}
      max={max}
      containerClassName={containerClassName}
      ref={field.ref}
      name={field.name}
      value={field.value ?? ''}
      onChange={(event) => field.onChange(event.target.value)}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
