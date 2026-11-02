import type { Control } from 'react-hook-form';

import { FormChoiceChips, FormInput } from '@/components';
import { SPECIALTIES, SPECIALTY_LABELS } from '@/contract';

import { clinicCopy } from '../copy';
import type { ProfileValues } from '../schemas';

const copy = clinicCopy.profile;

const SPECIALTY_OPTIONS = SPECIALTIES.map((specialty) => ({
  value: specialty,
  label: SPECIALTY_LABELS[specialty],
}));

export type ProfileFieldsProps = {
  control: Control<ProfileValues>;
  /** The clinic's own name, which the team sees. Setup leaves it for Settings. */
  showClinicName?: boolean;
  /** What the doctor practises, from the shared list. Asked in Settings. */
  showSpecialties?: boolean;
};

/** The doctor's name and credentials: everything above the line on a printout. */
export function ProfileFields({
  control,
  showClinicName = false,
  showSpecialties = false,
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
      {showSpecialties ? (
        <FormChoiceChips
          control={control}
          name="specialties"
          label={copy.specialties}
          hint={copy.specialtiesHint}
          options={SPECIALTY_OPTIONS}
          multiple
        />
      ) : null}
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
