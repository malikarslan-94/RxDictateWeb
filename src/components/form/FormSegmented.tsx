import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { Segmented } from '@/ui';
import type { SegmentedOption } from '@/ui';

import { FieldError } from './FieldError';

export type FormSegmentedProps<
  T extends FieldValues,
  V extends string,
  TSubmitted extends FieldValues = T,
> = {
  control: Control<T, unknown, TSubmitted>;
  name: FieldPath<T>;
  label: string;
  options: readonly SegmentedOption<V>[];
};

/** `Segmented` bound to a form field, full width, with a label and error. */
export function FormSegmented<
  T extends FieldValues,
  V extends string,
  TSubmitted extends FieldValues = T,
>({ control, name, label, options }: FormSegmentedProps<T, V, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <div>
      <p className="mb-2 text-label">{label}</p>
      <Segmented
        fullWidth
        label={label}
        options={options}
        value={field.value ?? null}
        onChange={field.onChange}
      />
      <FieldError message={fieldState.error?.message} />
    </div>
  );
}
