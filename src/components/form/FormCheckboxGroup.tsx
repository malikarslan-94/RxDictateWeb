import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { Checkbox } from '@/ui';

import { FieldError } from './FieldError';

export type CheckboxOption = { value: string; label: string };

export type FormCheckboxGroupProps<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
> = {
  control: Control<T, unknown, TSubmitted>;
  /** An array field of the ticked values. */
  name: FieldPath<T>;
  label: string;
  options: readonly CheckboxOption[];
};

/** Several tick boxes bound to one array field, e.g. "Works at". */
export function FormCheckboxGroup<
  T extends FieldValues,
  TSubmitted extends FieldValues = T,
>({ control, name, label, options }: FormCheckboxGroupProps<T, TSubmitted>) {
  const { field, fieldState } = useController({ control, name });
  const chosen: string[] = field.value ?? [];
  return (
    <fieldset>
      <legend className="mb-2 text-label">{label}</legend>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={chosen.includes(option.value)}
            onChange={(isOn) =>
              field.onChange(
                isOn
                  ? [...chosen, option.value]
                  : chosen.filter((value) => value !== option.value),
              )
            }
          />
        ))}
      </div>
      <FieldError message={fieldState.error?.message} />
    </fieldset>
  );
}
