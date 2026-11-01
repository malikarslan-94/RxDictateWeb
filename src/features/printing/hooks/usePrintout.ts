import { skipToken } from '@reduxjs/toolkit/query';

import { Role } from '@/constants/roles';
import {
  useGetMeQuery,
  useGetPracticeQuery,
  useListLocationsQuery,
} from '@/features/clinic';
import { useGetPatientQuery } from '@/features/patients';
import {
  buildPrintout,
  useGetPrescriptionPdfMutation,
  useGetPrescriptionQuery,
} from '@/features/prescription';
import { useGetVisitVitalsQuery } from '@/features/vitals';
import { messageFor, toApiError } from '@/lib/api';
import { selectActiveRole } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

import { WHATSAPP_URL } from '../constants';
import { printingCopy } from '../copy';

/**
 * One prescription as the page it prints, and the ways out of the browser:
 * the printer, the PDF, WhatsApp. An approved prescription prints its frozen
 * letterhead, which is all an assistant may read; a draft reads the clinic.
 */
export function usePrintout(prescriptionId: string | null) {
  const isDoctor = useAppSelector(selectActiveRole) === Role.doctor;
  const rx = useGetPrescriptionQuery(prescriptionId ?? skipToken);
  const patient = useGetPatientQuery(rx.data?.patientId ?? skipToken);
  const vitals = useGetVisitVitalsQuery(rx.data?.visitId ?? skipToken);
  const me = useGetMeQuery();
  const practice = useGetPracticeQuery(undefined, { skip: !isDoctor });
  const locations = useListLocationsQuery(undefined, { skip: !isDoctor });
  const [getPdf, { isLoading: isOpeningPdf, error: pdfError }] =
    useGetPrescriptionPdfMutation();

  const location =
    locations.data?.find((place) => place.id === rx.data?.locationId) ?? null;
  const failure = rx.error ?? patient.error ?? pdfError;

  const pdfUrl = async () => {
    if (!prescriptionId) return null;
    try {
      return (await getPdf(prescriptionId).unwrap()).url;
    } catch {
      return null;
    }
  };

  return {
    prescription: rx.data ?? null,
    patient: patient.data ?? null,
    printout:
      rx.data && patient.data
        ? buildPrintout({
            rx: rx.data,
            patient: patient.data,
            // No vitals for the visit is normal; the page leaves them out.
            vitals: vitals.data ?? null,
            me: me.data ?? null,
            practice: practice.data ?? null,
            location,
            today: new Date(),
          })
        : null,
    isLoading: rx.isLoading || patient.isLoading,
    error: failure ? messageFor(toApiError(failure)) : undefined,
    /** The page's print-only copy is in the document; the browser does the rest. */
    print: () => window.print(),
    openPdf: async () => {
      const url = await pdfUrl();
      if (url) window.open(url, '_blank', 'noopener');
    },
    isOpeningPdf,
    /** WhatsApp Web with the patient's number and the PDF's link. */
    shareOnWhatsApp: async () => {
      const url = await pdfUrl();
      const phone = patient.data?.phone.replace(/\D/g, '') ?? '';
      if (!url) return;
      const text = printingCopy.actions.whatsappText(
        patient.data?.name ?? '',
        url,
      );
      window.open(
        `${WHATSAPP_URL}${phone}?text=${encodeURIComponent(text)}`,
        '_blank',
        'noopener',
      );
    },
  };
}

export type PrintoutState = ReturnType<typeof usePrintout>;
