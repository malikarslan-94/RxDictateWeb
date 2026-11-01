import { useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { useGetPatientQuery } from '../api';
import { patientsCopy } from '../copy';
import { patientLine } from '../utils';
import { usePatientSearch } from './usePatientSearch';

/** A form's patient: who's chosen, and searching for someone else. */
export function usePatientField(
  patientId: string,
  onChange: (patientId: string) => void,
) {
  const [text, setText] = useState('');
  const search = usePatientSearch(text);
  const chosen = useGetPatientQuery(patientId || skipToken);
  const copy = patientsCopy.chooser;

  return {
    chosen: chosen.data
      ? { name: chosen.data.name, details: patientLine(chosen.data) }
      : null,
    isLoadingChosen: !!patientId && chosen.isLoading,
    text,
    setText,
    isSearching: search.isSearching,
    rows: search.results.map((patient) => ({
      id: patient.id,
      name: patient.name,
      details: patientLine(patient),
      choose: () => {
        onChange(patient.id);
        setText('');
      },
    })),
    emptyText:
      search.isActive && !search.isSearching && search.results.length === 0
        ? copy.noMatches
        : null,
    change: () => onChange(''),
  };
}
