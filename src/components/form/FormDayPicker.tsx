import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { DayPicker } from '@/ui';

import { FieldError } from './FieldError';

export type FormDayPickerProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = {
  control: Control<T, unknown, TSubmitted>;
  name: FieldPath<T>;
  label: string;
};

export function FormDayPicker<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({ control, name, label }: FormDayPickerProps<T, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <div>
      <p className="mb-2 text-label">{label}</p>
      <DayPicker
        label={label}
        value={field.value ?? []}
        onChange={field.onChange}
      />
      <FieldError message={fieldState.error?.message} />
    </div>
  );
}
