import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { recordVitalsBodySchema } from '@/contract';
import type { RecordVitalsBody } from '@/contract';

import { useRecordVitalsMutation } from '../api';
import { vitalsFormSchema } from '../schemas';
import { flagNotes, toVitalsBody, toVitalsInput } from '../utils';

/**
 * Vitals typed as part of another form, e.g. adding a patient: the fields,
 * out-of-range readings marked as they're typed, and a way to save them
 * once that form has a visit to save them against.
 */
export function useVitalsEntry() {
  const { control, trigger, getValues } = useForm({
    resolver: zodResolver(vitalsFormSchema),
    defaultValues: toVitalsInput(null),
  });
  const typed = useWatch({ control });
  const [record] = useRecordVitalsMutation();

  return {
    control,
    warnings: flagNotes(typed),
    /**
     * What to send: false when a reading is wrong (its field says why),
     * null when nothing was typed.
     */
    read: async (): Promise<RecordVitalsBody | false | null> => {
      if (!(await trigger())) return false;
      const values = vitalsFormSchema.parse(getValues());
      const body = recordVitalsBodySchema.safeParse(toVitalsBody(values, null));
      // Every field is valid, so the only way to fail is "no reading".
      return body.success ? body.data : null;
    },
    save: (visitId: string, body: RecordVitalsBody) =>
      record({ visitId, body }).unwrap(),
  };
}

export type VitalsEntry = ReturnType<typeof useVitalsEntry>;
