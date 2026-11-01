import { useState } from 'react';

import type { AppointmentView } from '@/contract';
import { useNow } from '@/hooks/useNow';
import { messageFor, toApiError } from '@/lib/api';
import { selectActiveLocationId, selectActiveMembership } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import {
  addDays,
  formatClockTime,
  formatRelativeDay,
  fromDateString,
  toDateString,
} from '@/utils/date';

import {
  useCancelAppointmentMutation,
  useListAppointmentsQuery,
  useListFollowUpsQuery,
} from '../api';
import { AppointmentKind, DAYS_PER_WEEK, TODAY_TICK_MS } from '../constants';
import { appointmentsCopy } from '../copy';
import type { BookingPreset } from '../types';
import { toAppointmentItem, toFollowUpItem, weekTiles } from '../utils';

const copy = appointmentsCopy.schedule;

/**
 * The assistant's Schedule: a week of appointments a day at a time, and the
 * follow-ups the doctor asked for that still need booking. Both update as
 * they change, since the doctor adds follow-ups as they approve.
 */
export function useSchedule() {
  const membership = useAppSelector(selectActiveMembership);
  const locationId = useAppSelector(selectActiveLocationId);
  const today = useNow(TODAY_TICK_MS);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState(() => toDateString(today));
  const [booking, setBooking] = useState<BookingPreset | null>(null);
  const [cancelling, setCancelling] = useState<AppointmentView | null>(null);
  const [cancelError, setCancelError] = useState<string>();

  const start = addDays(today, weekOffset * DAYS_PER_WEEK);
  const week = useListAppointmentsQuery({
    from: toDateString(start),
    to: toDateString(addDays(start, DAYS_PER_WEEK - 1)),
  });
  const followUps = useListFollowUpsQuery();
  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();

  const onDay = (week.data?.appointments ?? []).filter(
    (appointment) => toDateString(appointment.at) === selected,
  );
  const location = membership?.locations.find(
    (place) => place.id === locationId,
  );

  const moveWeek = (by: number) => {
    const next = weekOffset + by;
    setWeekOffset(next);
    // The first day of the new week, which is today when coming back to it.
    setSelected(toDateString(addDays(today, next * DAYS_PER_WEEK)));
  };

  return {
    meta: copy.meta([location?.name ?? '', membership?.practiceName ?? '']),
    days: weekTiles(start, selected, week.data?.countsByDay ?? {}, today),
    select: setSelected,
    // Booking is from today on, so the strip doesn't go back before it.
    previousWeek: weekOffset > 0 ? () => moveWeek(-1) : undefined,
    nextWeek: () => moveWeek(1),
    dayTitle: copy.dayTitle(
      formatRelativeDay(fromDateString(selected), today),
      onDay.length,
    ),
    appointments: onDay.map((appointment) => {
      const item = toAppointmentItem(appointment);
      return {
        ...item,
        cancelLabel: copy.cancelFor(item.name),
        askCancel: () => {
          setCancelError(undefined);
          setCancelling(appointment);
        },
      };
    }),
    isLoading: week.isLoading,
    error: week.error ? messageFor(toApiError(week.error)) : undefined,
    retry: week.refetch,
    emptyText: copy.noneOnDay,

    followUpsTitle: copy.followUpsTitle(followUps.data?.length ?? 0),
    followUps: (followUps.data ?? []).map((followUp) => {
      const item = toFollowUpItem(followUp);
      const patient = followUp.patient;
      return {
        ...item,
        bookLabel: copy.bookFollowUpFor(item.name),
        // Booked with its prescription, so it comes off this list.
        book: patient
          ? () =>
              setBooking({
                patientId: patient.id,
                prescriptionId: followUp.prescriptionId,
                date: followUp.dueDate,
                kind: AppointmentKind.follow_up,
              })
          : undefined,
      };
    }),
    isLoadingFollowUps: followUps.isLoading,
    followUpsError: followUps.error
      ? messageFor(toApiError(followUps.error))
      : undefined,
    retryFollowUps: followUps.refetch,
    noFollowUpsText: copy.noFollowUps,

    booking,
    book: () => setBooking({ date: selected }),
    closeBooking: () => setBooking(null),

    cancelling: cancelling
      ? {
          name: cancelling.patient?.name ?? appointmentsCopy.unknownPatient,
          when: copy.when(
            formatRelativeDay(cancelling.at, today),
            formatClockTime(cancelling.at),
          ),
        }
      : null,
    closeCancel: () => setCancelling(null),
    cancel: async () => {
      if (!cancelling) return;
      setCancelError(undefined);
      try {
        await cancelAppointment(cancelling.id).unwrap();
        setCancelling(null);
      } catch (error) {
        setCancelError(messageFor(toApiError(error)));
      }
    },
    isCancelling,
    cancelError,
  };
}
