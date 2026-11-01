import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { Checkbox } from '@/ui';

export type FormCheckboxProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = {
  control: Control<T, unknown, TSubmitted>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
};

export function FormCheckbox<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({ control, name, label, hint }: FormCheckboxProps<T, TSubmitted>) {
  const { field } = useController({ control, name });
  return (
    <Checkbox
      label={label}
      hint={hint}
      checked={!!field.value}
      onChange={field.onChange}
    />
  );
}
