import { VisitStatus } from '@/constants/visits';

import { useCreateVisitMutation, useUpdateVisitStatusMutation } from '../api';

/**
 * The doctor taking a patient before any prescription exists: vitals in the
 * consult, or "Save and start prescription". `start` puts the patient on
 * today's list if they aren't already (the server returns the existing
 * visit) and a waiting visit moves to "With doctor".
 *
 * Opening a draft and approving it move the visit on the server, so the
 * prescription itself never needs this.
 */
export function useVisitLifecycle() {
  const [createVisit] = useCreateVisitMutation();
  const [updateStatus] = useUpdateVisitStatusMutation();

  const start = async (patientId: string): Promise<string> => {
    const visit = await createVisit({ patientId, reason: '' }).unwrap();
    if (visit.status === VisitStatus.waiting) {
      await updateStatus({
        id: visit.id,
        status: VisitStatus.with_doctor,
      }).unwrap();
    }
    return visit.id;
  };

  return { start };
}
