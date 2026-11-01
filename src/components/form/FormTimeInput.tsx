import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { TimeInput } from '@/ui';

export type FormTimeInputProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = {
  control: Control<T, unknown, TSubmitted>;
  /** An `HH:mm` field, the API's own format. */
  name: FieldPath<T>;
  label: string;
  /** Shown while no time is chosen. */
  placeholder?: string;
  containerClassName?: string;
};

/** A time of day from the app's own list, bound to an `HH:mm` field. */
export function FormTimeInput<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({
  control,
  name,
  label,
  placeholder,
  containerClassName,
}: FormTimeInputProps<T, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <TimeInput
      ref={field.ref}
      label={label}
      name={field.name}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      placeholder={placeholder}
      error={fieldState.error?.message}
      className={containerClassName}
    />
  );
}
