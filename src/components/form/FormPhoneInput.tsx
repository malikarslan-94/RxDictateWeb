import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { PhoneInput } from '@/ui';
import type { PhoneInputProps } from '@/ui';

export type FormPhoneInputProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = Omit<
  PhoneInputProps,
  'value' | 'onChange' | 'onBlur' | 'error' | 'name'
> & {
  control: Control<T, unknown, TSubmitted>;
  name: FieldPath<T>;
};

/** `PhoneInput` bound to a form field. The field holds what was typed. */
export function FormPhoneInput<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({ control, name, ...inputProps }: FormPhoneInputProps<T, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <PhoneInput
      {...inputProps}
      ref={field.ref}
      name={field.name}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
