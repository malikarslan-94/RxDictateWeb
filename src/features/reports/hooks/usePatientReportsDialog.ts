import { useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { useGetPatientQuery } from '@/features/patients';

import { usePatientReports } from './usePatientReports';

export type ReportsStart = 'list' | 'upload';

type View = { kind: ReportsStart } | { kind: 'report'; id: string };

/**
 * A patient's reports in one dialog that turns into the report being read
 * or the upload form, and back.
 */
export function usePatientReportsDialog({
  patientId,
  startWith,
  onClose,
}: {
  patientId: string;
  startWith: ReportsStart;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>({ kind: startWith });
  const list = usePatientReports(patientId);
  const patient = useGetPatientQuery(patientId || skipToken);
  const toList = () => setView({ kind: 'list' });

  return {
    view,
    list,
    patientName: patient.data?.name ?? '',
    open: (id: string) => setView({ kind: 'report', id }),
    upload: () => setView({ kind: 'upload' }),
    toList,
    // Opened straight to the form: finishing it is finishing here.
    leaveUpload: startWith === 'upload' ? onClose : toList,
  };
}
