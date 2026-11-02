import { skipToken } from '@reduxjs/toolkit/query';
import { useRef, useState } from 'react';

import { A4_MM } from '@/constants/paper';
import { Role } from '@/constants/roles';
import {
  useGetMeQuery,
  useGetPracticeQuery,
  useListLocationsQuery,
} from '@/features/clinic';
import { useGetPatientQuery } from '@/features/patients';
import {
  RxStatus,
  buildPrintout,
  useGetPrescriptionPdfMutation,
  useGetPrescriptionQuery,
} from '@/features/prescription';
import { useGetVisitVitalsQuery } from '@/features/vitals';
import { messageFor, toApiError } from '@/lib/api';
import { saveFile } from '@/lib/files';
import { pageToPdf } from '@/lib/pdf';
import { selectActiveRole } from '@/lib/session';
import { ToastTone, toastShown } from '@/lib/toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fileSafeName } from '@/utils/text';

import { WHATSAPP_URL } from '../constants';
import { printingCopy } from '../copy';

/**
 * One prescription as the page it prints, and the ways out of the browser:
 * the printer, the PDF, WhatsApp. An approved prescription prints its frozen
 * letterhead, which is all an assistant may read; a draft reads the clinic.
 * The PDF is the page itself, saved to the computer; WhatsApp sends the
 * server's copy, since a link is all it can carry.
 */
export function usePrintout(prescriptionId: string | null) {
  const dispatch = useAppDispatch();
  const isDoctor = useAppSelector(selectActiveRole) === Role.doctor;
  const pageRef = useRef<HTMLElement>(null);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const rx = useGetPrescriptionQuery(prescriptionId ?? skipToken);
  const patient = useGetPatientQuery(rx.data?.patientId ?? skipToken);
  const vitals = useGetVisitVitalsQuery(rx.data?.visitId ?? skipToken);
  const me = useGetMeQuery();
  const practice = useGetPracticeQuery(undefined, { skip: !isDoctor });
  const locations = useListLocationsQuery(undefined, { skip: !isDoctor });
  const [getPdf, { error: pdfError }] = useGetPrescriptionPdfMutation();

  const location =
    locations.data?.find((place) => place.id === rx.data?.locationId) ?? null;
  const failure = rx.error ?? patient.error ?? pdfError;

  const savePdf = async () => {
    const page = pageRef.current;
    if (!page || !rx.data || isSavingPdf) return;
    setIsSavingPdf(true);
    try {
      const pdf = await pageToPdf(page, A4_MM);
      const name = printingCopy.actions.pdfFileName(
        rx.data.number ?? '',
        patient.data?.name ?? '',
      );
      saveFile(pdf, fileSafeName(name));
      dispatch(
        toastShown({
          tone: ToastTone.success,
          message: printingCopy.toast.pdfSaved,
        }),
      );
    } catch {
      dispatch(
        toastShown({
          tone: ToastTone.danger,
          message: printingCopy.toast.pdfFailed,
        }),
      );
    } finally {
      setIsSavingPdf(false);
    }
  };

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
    /** Goes on the print-only page (`PrintDocument`), which "PDF" saves. */
    pageRef,
    /** A draft is never saved as a file anyone could mistake for a prescription. */
    canSavePdf: rx.data?.status === RxStatus.approved,
    savePdf,
    isSavingPdf,
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
