import { useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router';

import { Role } from '@/constants/roles';
import {
  consultPath,
  patientBookingPath,
  patientReportUploadPath,
  patientReportsPath,
  patientTimelinePath,
} from '@/constants/routes';
import { prescriptionStatusSchema } from '@/contract';
import type { PatientView } from '@/contract';
import {
  useCreateVisitMutation,
  useListTodayVisitsQuery,
} from '@/features/visits';
import { messageFor, toApiError } from '@/lib/api';
import { selectActiveRole } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { formatRelativeDay, fromDateString } from '@/utils/date';
import { maskE164 } from '@/utils/phone';

import { useListPatientPrescriptionsQuery } from '../api';
import { patientsCopy } from '../copy';
import { patientLine, toPanelPrescription } from '../utils';

const copy = patientsCopy.panel;

/**
 * One patient beside the table: who, their allergy, and what this role can
 * do for them. The doctor starts a prescription and reads earlier ones; the
 * assistant puts them on today's list, uploads a report or books them in.
 */
export function usePatientPanel(patient: PatientView) {
  const navigate = useNavigate();
  const isDoctor = useAppSelector(selectActiveRole) === Role.doctor;
  const prescriptions = useListPatientPrescriptionsQuery(
    isDoctor ? patient.id : skipToken,
  );
  const visits = useListTodayVisitsQuery();
  const [createVisit, { isLoading: isAdding }] = useCreateVisitMutation();
  const [error, setError] = useState<string>();

  const items = (prescriptions.data ?? [])
    // Superseded and cancelled ones are history, not something to open.
    .filter(
      (rx) =>
        rx.status === prescriptionStatusSchema.enum.draft ||
        rx.status === prescriptionStatusSchema.enum.approved,
    )
    .map((rx) => toPanelPrescription(rx));
  const token =
    visits.data?.find((visit) => visit.patientId === patient.id)?.token ?? null;

  return {
    isDoctor,
    name: patient.name,
    line: patientLine(patient),
    allergy: patient.allergies.length > 0 ? patient.allergies.join(', ') : null,
    phone: patient.phone ? maskE164(patient.phone) : copy.noPhone,
    lastVisit: patient.lastVisitDate
      ? formatRelativeDay(fromDateString(patient.lastVisitDate))
      : patientsCopy.list.never,
    openReports: () => navigate(patientReportsPath(patient.id)),
    /** The doctor's History dialog, on the timeline. */
    openTimeline: () => navigate(patientTimelinePath(patient.id)),

    prescriptionsTitle: copy.prescriptions(items.length),
    items,
    isLoading: prescriptions.isLoading,
    newPrescription: () => navigate(consultPath(patient.id)),
    open: (href: string) => navigate(href),

    queueNote: token !== null ? copy.onList(token) : null,
    // Asking twice returns the same visit, so a double click can't issue two.
    addToList:
      token === null
        ? async () => {
            setError(undefined);
            try {
              await createVisit({ patientId: patient.id, reason: '' }).unwrap();
            } catch (caught) {
              setError(messageFor(toApiError(caught)));
            }
          }
        : undefined,
    isAdding,
    error,
    uploadReport: () => navigate(patientReportUploadPath(patient.id)),
    bookAppointment: () => navigate(patientBookingPath(patient.id)),
  };
}

export type PatientPanelState = ReturnType<typeof usePatientPanel>;
