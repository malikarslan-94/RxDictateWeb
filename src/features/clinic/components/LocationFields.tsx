import type { Control } from 'react-hook-form';

import {
  FormDayPicker,
  FormInput,
  FormPhoneInput,
  FormSelect,
  FormTimeInput,
} from '@/components';
import { PROVINCES, PROVINCE_LABELS } from '@/contract';

import { clinicCopy } from '../copy';
import type { LocationFormInput, LocationFormValues } from '../schemas';

const copy = clinicCopy.location;

const PROVINCE_OPTIONS = PROVINCES.map((province) => ({
  value: province,
  label: PROVINCE_LABELS[province],
}));

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
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          control={control}
          name="province"
          label={copy.province}
          options={PROVINCE_OPTIONS}
          placeholder={copy.provincePlaceholder}
        />
        <FormInput
          control={control}
          name="city"
          label={copy.city}
          placeholder={copy.cityPlaceholder}
          autoComplete="address-level2"
        />
      </div>
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
