import { skipToken } from '@reduxjs/toolkit/query';
import { useParams } from 'react-router';

import { ErrorCode } from '@/constants/errorCodes';
import { printCopy } from '@/constants/printCopy';
import { messageFor, toApiError } from '@/lib/api';
import { formatPrintDate } from '@/utils/date';
import { doctorTitle } from '@/utils/text';

import { useGetVerificationQuery } from '../api';
import { CheckState } from '../constants';
import { verificationCopy as copy } from '../copy';
import { toCheckedMedicine } from '../utils';

/**
 * What a printout's QR opens: the prescription as the doctor approved it, to
 * hold against the paper. Anyone may look; the server gives only what a
 * pharmacist needs.
 */
export function useRxCheck() {
  const { code = '' } = useParams<{ code: string }>();
  const check = useGetVerificationQuery(code || skipToken);
  const failure = check.error ? toApiError(check.error) : null;
  const view = check.data ?? null;

  const state: CheckState = check.isLoading
    ? CheckState.loading
    : view
      ? view.status
      : !code || failure?.code === ErrorCode.NOT_FOUND
        ? CheckState.notFound
        : CheckState.error;

  const doctorName = view ? doctorTitle(view.doctor.name) : '';
  const approvedOn = view ? formatPrintDate(view.approvedAt) : '';

  return {
    state,
    error:
      state === CheckState.error && failure ? messageFor(failure) : undefined,
    retry: check.refetch,
    summary:
      view?.status === CheckState.replaced && view.replacedBy
        ? copy.replaced.line(
            view.replacedBy.number,
            formatPrintDate(view.replacedBy.approvedAt),
          )
        : copy.valid.line(doctorName, approvedOn),
    rxId: view ? copy.rxId(view.number) : '',
    approvedOn,
    doctor: view
      ? {
          name: doctorName,
          detail: copy.detail([
            view.doctor.qualifications.join(', '),
            view.doctor.speciality,
          ]),
          pmdc: view.doctor.pmdcNo ? copy.pmdc(view.doctor.pmdcNo) : '',
        }
      : null,
    clinic: view ? view.clinic : null,
    patient: view
      ? copy.detail([
          view.patient.initials,
          printCopy.ageSexValue(
            view.patient.age,
            printCopy.sex[view.patient.sex],
          ),
        ])
      : '',
    medicines: view ? view.medicines.map(toCheckedMedicine) : [],
  };
}
