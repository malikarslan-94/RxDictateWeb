import { useEffect, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { useGetVisitVitalsQuery } from '../api';
import { vitalsCopy } from '../copy';
import { toVitalReadings } from '../utils';

/**
 * One visit's readings on a list row, and the dialog to add or correct
 * them. Asked for only once the list says there are some.
 */
export function useVisitVitals(visitId: string, recordedAt: Date | null) {
  const vitals = useGetVisitVitalsQuery(recordedAt ? visitId : skipToken);
  const [isOpen, setIsOpen] = useState(false);
  const { refetch } = vitals;
  const listed = recordedAt?.getTime() ?? 0;
  const loaded = vitals.data?.recordedAt.getTime() ?? 0;

  // Corrected on another computer: the list hears of it first.
  useEffect(() => {
    if (loaded > 0 && listed > loaded) refetch();
  }, [listed, loaded, refetch]);

  const readings = vitals.data ? toVitalReadings(vitals.data) : [];

  return {
    vitals: vitals.data ?? null,
    readings,
    editLabel: vitalsCopy.editReadings(
      readings
        .map((reading) => vitalsCopy.reading(reading.label, reading.value))
        .join(', '),
    ),
    isLoading: vitals.isLoading,
    // Until they've loaded, an empty dialog could overwrite real readings.
    canEdit: !recordedAt || !!vitals.data,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    // The visit is already on the list: the dialog records against it.
    getVisitId: () => Promise.resolve(visitId),
  };
}
