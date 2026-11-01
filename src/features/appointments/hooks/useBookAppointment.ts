import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken } from '@reduxjs/toolkit/query';

import { appointmentKindSchema } from '@/contract';
import { useGetPatientQuery } from '@/features/patients';
import { useNow } from '@/hooks/useNow';
import { messageFor, toApiError } from '@/lib/api';
import { fromDateString, toDateString } from '@/utils/date';
import { timeOnDay } from '@/utils/time';

import { useCreateAppointmentMutation } from '../api';
import { AppointmentKind, TODAY_TICK_MS } from '../constants';
import { appointmentsCopy } from '../copy';
import { bookAppointmentSchema } from '../schemas';
import type { BookAppointmentInput } from '../schemas';
import type { BookingPreset } from '../types';

const copy = appointmentsCopy.book;

/**
 * Book a patient in. From a follow-up it carries that prescription, so
 * booking takes the follow-up off the list. The day and time chosen are
 * this computer's, sent as one instant.
 */
export function useBookAppointment(
  preset: BookingPreset,
  onBooked: () => void,
) {
  const today = toDateString(useNow(TODAY_TICK_MS));
  const prescriptionId = preset.prescriptionId ?? null;
  const patient = useGetPatientQuery(
    prescriptionId && preset.patientId ? preset.patientId : skipToken,
  );
  const [createAppointment, { isLoading: isSaving }] =
    useCreateAppointmentMutation();

  const defaults: BookAppointmentInput = {
    patientId: preset.patientId ?? '',
    // Never in the past: a follow-up that's overdue books from today.
    date: preset.date && preset.date >= today ? preset.date : today,
    time: '',
    kind: preset.kind ?? AppointmentKind.new_problem,
    note: '',
  };
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: defaults,
  });

  const submit = handleSubmit(async (booking) => {
    try {
      await createAppointment({
        patientId: booking.patientId,
        at: timeOnDay(booking.time, fromDateString(booking.date)),
        kind: booking.kind,
        note: booking.note,
        prescriptionId,
      }).unwrap();
      onBooked();
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    control,
    // Opened for a patient (their row, a follow-up): theirs, not changed.
    isPatientLocked: !!preset.patientId,
    followUpNote:
      prescriptionId && patient.data
        ? copy.followUpFor(patient.data.name)
        : null,
    kindOptions: appointmentKindSchema.options.map((value) => ({
      label: appointmentsCopy.kinds[value],
      value,
    })),
    earliestDate: today,
    submit,
    isSaving,
    formError: formState.errors.root?.message,
  };
}
