import type { Sex } from '@/contract';

/** Strings shared by more than one feature. Feature copy lives in its copy.ts. */
export const commonCopy = {
  back: 'Go back',
  close: 'Close',
  cancel: 'Cancel',
  save: 'Save',
  saving: 'Saving…',
  retry: 'Try again',
  edit: 'Edit',
  remove: 'Remove',
  open: 'Open',
  soon: 'Soon',
  /** Stands in for a value there isn't one of, e.g. a token off the list. */
  none: '—',
  next: 'Next',
  previous: 'Previous',
  notifications: 'Notifications',
  /** In place of "Live" while the live connection is down. */
  reconnecting: 'Reconnecting…',
  codeDigit: (label: string, position: number) => `${label}, digit ${position}`,
  sexShort: { male: 'M', female: 'F', other: 'O' } satisfies Record<
    Sex,
    string
  >,
  sexLong: { male: 'Male', female: 'Female', other: 'Other' } satisfies Record<
    Sex,
    string
  >,
  sexOptions: [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ] satisfies { label: string; value: Sex }[],
  errors: {
    invalidPhone: 'Enter a valid mobile number',
  },
  time: {
    justNow: 'Just now',
    minutesAgo: (minutes: number) => `${minutes} min ago`,
    hoursAgo: (hours: number) => `${hours} h ago`,
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',
    minutes: (minutes: number) => `${minutes} min`,
  },
  comingSoon: {
    title: 'Coming soon',
    heading: "This part isn't ready yet",
    doctorBody:
      'Everything in your menu works fully today: prescriptions, patients, the History log, reports and templates.',
    assistantBody:
      'Everything in your menu works fully today: the list, the schedule, printing and report uploads.',
    backDoctor: 'Back to today',
    backAssistant: "Back to today's list",
  },
} as const;
