import { useState } from 'react';
import { useNavigate } from 'react-router';

import { consultPath } from '@/constants/routes';
import { VisitStatus } from '@/constants/visits';
import { toQueue, useListTodayVisitsQuery } from '@/features/visits';

import { patientsCopy } from '../copy';
import type { PickerRow } from '../types';
import { patientLine } from '../utils';
import { usePatientSearch } from './usePatientSearch';

/**
 * "New prescription": who it's for. Today's list first; any patient by
 * search; or a new one. Picking someone opens their workspace.
 */
export function usePatientPicker(onClose: () => void) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const search = usePatientSearch(text);
  const visits = useListTodayVisitsQuery();

  const open = (patientId: string, visitId?: string) => {
    onClose();
    navigate(consultPath(patientId, visitId));
  };
  const queue = toQueue(visits.data ?? []);
  const byPatient = new Map(queue.map((entry) => [entry.patientId, entry]));

  const rows: PickerRow[] = search.isActive
    ? search.results.map((patient) => ({
        id: patient.id,
        name: patient.name,
        details: patientLine(patient),
        token: byPatient.get(patient.id)?.token ?? null,
        pick: () => open(patient.id, byPatient.get(patient.id)?.id),
      }))
    : queue
        .filter((entry) => entry.status !== VisitStatus.done)
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          details: [entry.details, entry.reason].filter(Boolean).join(' · '),
          token: entry.token,
          pick: () => open(entry.patientId, entry.id),
        }));

  return {
    text,
    setText,
    isSearching: search.isSearching,
    title: search.isActive
      ? patientsCopy.picker.results
      : patientsCopy.picker.today,
    rows,
    emptyText:
      !search.isSearching && rows.length === 0
        ? search.isActive
          ? patientsCopy.picker.noMatches
          : patientsCopy.picker.noneToday
        : null,
    addName: text.trim(),
    isAddingNew,
    addNew: () => setIsAddingNew(true),
    closeAddNew: () => setIsAddingNew(false),
  };
}
