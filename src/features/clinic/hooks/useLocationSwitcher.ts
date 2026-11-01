import { useState } from 'react';

import { locationStatusSchema } from '@/contract';
import {
  locationChosen,
  selectActiveLocationId,
  selectActiveMembership,
} from '@/lib/session';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { useListLocationsQuery } from '../api';
import { toLocationForm, scheduleLine } from '../utils';

/**
 * "Working at": which of the clinic's places this tab works at, and the
 * menu to change it. A doctor sees every location; an assistant only the
 * ones their doctor picked, and can't switch to others.
 */
export function useLocationSwitcher({ canManage }: { canManage: boolean }) {
  const dispatch = useAppDispatch();
  const membership = useAppSelector(selectActiveMembership);
  const activeId = useAppSelector(selectActiveLocationId);
  // Hours are the doctor's to read; an assistant's list is just the names.
  const locations = useListLocationsQuery(undefined, { skip: !canManage });
  const [isOpen, setIsOpen] = useState(false);

  const allowed = (membership?.locations ?? []).filter(
    (location) => location.status === locationStatusSchema.enum.active,
  );
  const details = (id: string) => {
    const view = locations.data?.find((location) => location.id === id);
    if (!view) return '';
    const { days, opensAt, closesAt } = toLocationForm(view);
    return view.timings.length > 0 ? scheduleLine(days, opensAt, closesAt) : '';
  };

  return {
    current: allowed.find((location) => location.id === activeId) ?? null,
    options: allowed.map((location) => ({
      id: location.id,
      name: location.name,
      details: details(location.id),
      isActive: location.id === activeId,
      choose: () => {
        dispatch(locationChosen(location.id));
        setIsOpen(false);
      },
    })),
    canSwitch: allowed.length > 1,
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    close: () => setIsOpen(false),
  };
}
