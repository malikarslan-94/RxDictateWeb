import type { AppointmentKind } from '@/contract';

export const appointmentsCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    booked: 'Appointment booked',
    cancelled: 'Appointment cancelled',
  },
  kinds: {
    follow_up: 'Follow-up',
    new_problem: 'New problem',
  } satisfies Record<AppointmentKind, string>,
  schedule: {
    meta: (parts: string[]) => parts.filter(Boolean).join(' · '),
    title: 'Schedule',
    book: 'Book appointment',
    followUpsTitle: (count: number) => `Follow-ups to book · ${count}`,
    noFollowUps: 'Every follow-up the doctor asked for is booked.',
    due: (date: string) => `Due ${date}`,
    overdue: 'Overdue',
    bookFollowUp: 'Book',
    bookFollowUpFor: (name: string) => `Book ${name}'s follow-up`,
    dayTitle: (day: string, count: number) =>
      count === 0
        ? day
        : `${day} · ${count === 1 ? '1 appointment' : `${count} appointments`}`,
    noneOnDay: 'No appointments on this day.',
    previousWeek: 'Previous week',
    nextWeek: 'Next week',
    dayLabel: (date: string, count: number) =>
      count === 0 ? date : `${date}, ${count} booked`,
    dayCount: (count: number) => `${count} booked`,
    columns: { time: 'Time', patient: 'Patient', kind: 'For', note: 'Note' },
    cancel: 'Cancel',
    cancelFor: (name: string) => `Cancel ${name}'s appointment`,
    arrived: 'Arrived',
    when: (day: string, time: string) => `${day}, ${time}`,
  },
  cancelDialog: {
    title: (name: string) => `Cancel ${name}'s appointment?`,
    subtitle: (when: string) =>
      `${when}. If it was a follow-up, it goes back on the list to book.`,
    confirm: 'Cancel appointment',
    keep: 'Keep it',
  },
  book: {
    title: 'Book appointment',
    patient: 'Patient',
    kind: 'For',
    date: 'Date',
    time: 'Time',
    timePlaceholder: 'Choose a time',
    note: 'Note',
    notePlaceholder: 'Optional, e.g. bring last reports',
    submit: 'Book appointment',
    cancel: 'Cancel',
    followUpFor: (name: string) =>
      `The follow-up the doctor asked for ${name}.`,
  },
  unknownPatient: 'Patient',
  errors: {
    patientRequired: 'Choose the patient',
    dateRequired: 'Choose a date',
    datePast: 'Choose today or a day after',
    timeRequired: 'Choose a time',
  },
} as const;
