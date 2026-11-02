import { useState } from 'react';
import type { BaseSyntheticEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';

import { Action } from '@/constants/roles';
import { consultPath } from '@/constants/routes';
import type { PatientView } from '@/contract';
import { useCreateVisitMutation, useVisitLifecycle } from '@/features/visits';
import { useVitalsEntry } from '@/features/vitals';
import { useCan } from '@/hooks/useCan';
import { messageFor, toApiError } from '@/lib/api';

import { useCreatePatientMutation } from '../api';
import { patientsCopy } from '../copy';
import { addPatientSchema } from '../schemas';
import type { AddPatientInput } from '../schemas';

const copy = patientsCopy.add;

/**
 * Add a patient. For the doctor, "Save and start prescription" puts them on
 * today's list as "With doctor" and opens the workspace. The assistant never
 * starts a prescription: their "Save and add to today's list" gives them the
 * next token, with the vitals they took, if any. "Save only" just saves
 * them; vitals belong to a visit, so they ask for the list.
 */
export function useAddPatient({
  name = '',
  onSaved,
}: {
  /** Prefilled from a search that found no one. */
  name?: string;
  onSaved: () => void;
}) {
  const navigate = useNavigate();
  // Whoever can prescribe starts one; the others take vitals for the list.
  const canPrescribe = useCan(Action['prescription.create']);
  const visits = useVisitLifecycle();
  const [createVisit] = useCreateVisitMutation();
  const [createPatient] = useCreatePatientMutation();
  const vitals = useVitalsEntry();
  const [isSaving, setIsSaving] = useState(false);
  // Saved but the visit failed: retry only the visit, never save twice.
  const [saved, setSaved] = useState<PatientView | null>(null);

  const defaults: AddPatientInput = {
    name,
    phone: '',
    age: '',
    sex: null,
    allergies: '',
    noKnownAllergies: false,
    conditions: '',
  };
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(addPatientSchema),
    defaultValues: defaults,
  });
  const noKnownAllergies = useWatch({ control, name: 'noKnownAllergies' });

  const save =
    (thenContinue: boolean) => async (event?: BaseSyntheticEvent) => {
      event?.preventDefault();
      // Checked alongside the patient's fields, so every mistake shows at once.
      const readings = canPrescribe ? null : await vitals.read();
      await handleSubmit(async (values) => {
        if (readings === false) return;
        if (readings && !thenContinue) {
          setError('root', { message: copy.vitalsNeedList });
          return;
        }
        setIsSaving(true);
        try {
          const patient =
            saved ??
            (await createPatient({
              name: values.name,
              phone: values.phone,
              age: values.age,
              sex: values.sex,
              // "No known allergies" wins over anything typed before ticking it.
              allergies: values.noKnownAllergies ? [] : values.allergies,
              noKnownAllergies: values.noKnownAllergies,
              conditions: values.conditions,
            }).unwrap());
          setSaved(patient);
          if (thenContinue && canPrescribe) {
            const visitId = await visits.start(patient.id);
            navigate(consultPath(patient.id, visitId));
          } else if (thenContinue) {
            const visit = await createVisit({
              patientId: patient.id,
              reason: '',
            }).unwrap();
            if (readings) await vitals.save(visit.id, readings);
          }
          onSaved();
        } catch (error) {
          setError('root', { message: messageFor(toApiError(error)) });
        } finally {
          setIsSaving(false);
        }
      })();
    };

  return {
    control,
    noKnownAllergies,
    saveAndContinue: save(true),
    continueLabel: canPrescribe ? copy.saveAndStart : copy.saveAndList,
    continueNote: canPrescribe ? copy.startNote : copy.listNote,
    saveOnly: save(false),
    /** The assistant takes vitals as they add someone; the doctor doesn't. */
    vitals: canPrescribe ? null : vitals,
    isSaving,
    formError: formState.errors.root?.message,
  };
}
