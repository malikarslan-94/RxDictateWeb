import type { Control } from 'react-hook-form';

import {
  FormDayPicker,
  FormInput,
  FormPhoneInput,
  FormTimeInput,
} from '@/components';

import { clinicCopy } from '../copy';
import type { LocationFormInput, LocationFormValues } from '../schemas';

const copy = clinicCopy.location;

export type LocationFieldsProps = {
  control: Control<LocationFormInput, unknown, LocationFormValues>;
};

/** Where a location is and when it's open, as setup and Settings ask for it. */
export function LocationFields({ control }: LocationFieldsProps) {
  return (
    <>
      <FormInput
        control={control}
        name="name"
        label={copy.name}
        placeholder={copy.namePlaceholder}
      />
      <FormInput
        control={control}
        name="address"
        label={copy.address}
        placeholder={copy.addressPlaceholder}
      />
      <FormPhoneInput
        control={control}
        name="phone"
        label={copy.phone}
        hint={copy.phoneHint}
      />
      <FormDayPicker control={control} name="days" label={copy.days} />
      <div className="grid grid-cols-2 gap-4">
        <FormTimeInput control={control} name="opensAt" label={copy.opensAt} />
        <FormTimeInput
          control={control}
          name="closesAt"
          label={copy.closesAt}
        />
      </div>
    </>
  );
}
