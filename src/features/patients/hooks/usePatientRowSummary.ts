import type { PatientView } from '@/contract';

import { useGetPatientRxSummaryQuery } from '../api';
import { patientsCopy } from '../copy';
import { lastDiagnosis, visitorTag } from '../utils';

/** A row's last diagnosis, and whether the patient is new or a regular. */
export function usePatientRowSummary(patient: PatientView) {
  const summary = useGetPatientRxSummaryQuery(patient.id);
  const diagnosis = summary.data ? lastDiagnosis(summary.data) : '';

  return {
    isLoading: summary.isLoading,
    diagnosis: diagnosis || patientsCopy.list.noDiagnosis,
    hasDiagnosis: diagnosis !== '',
    visitor: summary.data
      ? visitorTag(summary.data, patient.lastVisitDate)
      : null,
  };
}
