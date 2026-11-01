import type { Control } from 'react-hook-form';

import { FormInput } from '@/components';

import { clinicCopy } from '../copy';
import type { ProfileValues } from '../schemas';

const copy = clinicCopy.profile;

export type ProfileFieldsProps = {
  control: Control<ProfileValues>;
  /** The clinic's own name, which the team sees. Setup leaves it for Settings. */
  showClinicName?: boolean;
};

/** The doctor's name and credentials: everything above the line on a printout. */
export function ProfileFields({
  control,
  showClinicName = false,
}: ProfileFieldsProps) {
  return (
    <>
      <FormInput
        control={control}
        name="fullName"
        label={copy.fullName}
        placeholder={copy.fullNamePlaceholder}
        autoComplete="name"
      />
      <FormInput
        control={control}
        name="qualifications"
        label={copy.qualifications}
        placeholder={copy.qualificationsPlaceholder}
      />
      <FormInput
        control={control}
        name="speciality"
        label={copy.speciality}
        placeholder={copy.specialityPlaceholder}
      />
      <FormInput
        control={control}
        name="pmdcNo"
        label={copy.pmdcNo}
        placeholder={copy.pmdcNoPlaceholder}
        hint={copy.pmdcNoHint}
      />
      {showClinicName ? (
        <FormInput
          control={control}
          name="clinicName"
          label={copy.clinicName}
          hint={copy.clinicNameHint}
        />
      ) : null}
    </>
  );
}
