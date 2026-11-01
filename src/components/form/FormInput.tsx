import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { Input } from '@/ui';
import type { InputProps } from '@/ui';

export type FormInputProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = Omit<InputProps, 'value' | 'onChange' | 'onBlur' | 'error' | 'name'> & {
  /** Typed values `T`; what submit receives may differ (`TSubmitted`). */
  control: Control<T, unknown, TSubmitted>;
  name: FieldPath<T>;
};

/** `Input` bound to a react-hook-form field: value, changes and its error. */
export function FormInput<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({ control, name, ...inputProps }: FormInputProps<T, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Input
      {...inputProps}
      ref={field.ref}
      name={field.name}
      value={field.value ?? ''}
      onChange={(event) => field.onChange(event.target.value)}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
