import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { Textarea } from '@/ui';
import type { TextareaProps } from '@/ui';

export type FormTextareaProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = Omit<TextareaProps, 'value' | 'onChange' | 'onBlur' | 'error' | 'name'> & {
  control: Control<T, unknown, TSubmitted>;
  name: FieldPath<T>;
};

export function FormTextarea<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({ control, name, ...props }: FormTextareaProps<T, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Textarea
      {...props}
      name={field.name}
      value={field.value ?? ''}
      onChange={(event) => field.onChange(event.target.value)}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
