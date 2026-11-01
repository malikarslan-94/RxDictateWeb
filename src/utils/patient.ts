import { commonCopy } from '@/constants/copy';
import type { PatientView } from '@/contract';

/** "45 · M", or just "M" when the age isn't known. */
export function patientDetails(
  patient: Pick<PatientView, 'age' | 'sex'> | null,
): string {
  if (!patient) return '';
  const sex = commonCopy.sexShort[patient.sex];
  return patient.age === null ? sex : `${patient.age} · ${sex}`;
}
