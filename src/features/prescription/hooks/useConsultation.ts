import { skipToken } from '@reduxjs/toolkit/query';
import { useParams, useSearchParams } from 'react-router';

import { commonCopy } from '@/constants/copy';
import { ErrorCode } from '@/constants/errorCodes';
import { useGetPatientQuery } from '@/features/patients';
import { useListTodayVisitsQuery, useVisitLifecycle } from '@/features/visits';
import { toVitalReadings, useGetVisitVitalsQuery } from '@/features/vitals';
import { messageFor, toApiError } from '@/lib/api';
import { formatClockTime, formatShortDate, fromDateString } from '@/utils/date';
import { maskE164 } from '@/utils/phone';

import { rxCopy } from '../copy';

/**
 * The patient at the top of the workspace, and their visit today.
 *
 * Opened without a visit (from Patients, a search, or once they've been
 * seen), their visit today is still this one: a patient is on a day's list
 * once. Without it, the prescription written today would look empty.
 */
export function useConsultation() {
  const { patientId = '' } = useParams<{ patientId: string }>();
  const [search, setSearch] = useSearchParams();
  const visitId = search.get('visitId');

  const patient = useGetPatientQuery(patientId || skipToken);
  const visits = useListTodayVisitsQuery();
  const visit =
    visits.data?.find((item) =>
      visitId ? item.id === visitId : item.patientId === patientId,
    ) ?? null;
  const activeVisitId = visitId ?? visit?.id ?? null;
  const vitals = useGetVisitVitalsQuery(activeVisitId ?? skipToken);
  const lifecycle = useVisitLifecycle();

  // Vitals need a visit. Not on today's list yet, start one, and keep its id
  // in the address so the header and the draft both see it.
  const ensureVisit = async (): Promise<string> => {
    if (activeVisitId) return activeVisitId;
    const startedId = await lifecycle.start(patientId);
    setSearch({ visitId: startedId }, { replace: true });
    return startedId;
  };

  // No vitals for this visit is normal (a doctor-added patient skips them).
  const isVitalsMissing =
    !activeVisitId ||
    vitals.data === null ||
    (vitals.error !== undefined &&
      toApiError(vitals.error).code === ErrorCode.NOT_FOUND);

  const data = patient.data;
  const copy = rxCopy.workspace;

  return {
    patientId,
    visitId: activeVisitId,
    /** False until today's list says whether the patient has a visit. */
    isVisitKnown: !!visitId || !visits.isLoading,
    reason: visit?.reason ?? '',
    isLoading: patient.isLoading,
    error: patient.error ? messageFor(toApiError(patient.error)) : undefined,
    name: data?.name ?? '',
    line: data
      ? copy.patientLine([
          data.age !== null ? String(data.age) : '',
          commonCopy.sexLong[data.sex],
          data.mrNo,
          data.phone ? maskE164(data.phone) : '',
          data.lastVisitDate
            ? copy.lastVisit(
                formatShortDate(fromDateString(data.lastVisitDate)),
              )
            : '',
        ])
      : '',
    allergies: data?.allergies ?? [],
    allergyChip:
      data && data.allergies.length > 0
        ? rxCopy.allergy(data.allergies.join(', '))
        : null,
    conditions:
      data && data.conditions.length > 0
        ? rxCopy.conditions(data.conditions.join(', '))
        : null,
    /** The readings themselves, for the vitals dialog to start from. */
    vitals: vitals.data ?? null,
    vitalsReadings: vitals.data ? toVitalReadings(vitals.data) : [],
    vitalsNote: vitals.data
      ? rxCopy.vitals.recordedAt(formatClockTime(vitals.data.recordedAt))
      : isVitalsMissing
        ? rxCopy.vitals.none
        : null,
    vitalsAction: vitals.data ? rxCopy.vitals.edit : rxCopy.vitals.add,
    // Until they've loaded, an empty dialog could overwrite real readings.
    canEditVitals: !vitals.isLoading,
    ensureVisit,
    patient: data ?? null,
  };
}
