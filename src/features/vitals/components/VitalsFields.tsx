import type { Control } from 'react-hook-form';

import { FormInput } from '@/components';

import { VITALS_FIELDS, VITALS_ROWS } from '../constants';
import type { VitalsField } from '../constants';
import { vitalsCopy } from '../copy';
import type { VitalsFormInput, VitalsFormValues } from '../schemas';

export type VitalsFieldsProps = {
  control: Control<VitalsFormInput, unknown, VitalsFormValues>;
  /** Under a reading outside the normal range, as it's typed. */
  warnings: Partial<Record<VitalsField, string>>;
};

/** BP, pulse, temperature, weight and SpO₂, two to a row. */
export function VitalsFields({ control, warnings }: VitalsFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      {VITALS_ROWS.flat().map((field) => (
        <FormInput
          key={field}
          control={control}
          name={field}
          label={vitalsCopy.withUnit(
            vitalsCopy.fields[field],
            VITALS_FIELDS[field].unit,
          )}
          placeholder={vitalsCopy.placeholders[field]}
          inputMode={VITALS_FIELDS[field].inputMode}
          maxLength={VITALS_FIELDS[field].maxLength}
          warning={warnings[field]}
        />
      ))}
    </div>
  );
}
