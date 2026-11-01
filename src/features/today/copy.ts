export const todayCopy = {
  meta: (parts: string[]) => parts.filter(Boolean).join(' · '),
  greeting: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
  },
  greet: (greeting: string, name: string) =>
    name ? `${greeting}, ${name}` : greeting,
  doctorName: (firstName: string) => `Dr. ${firstName}`,
  search: 'Search patients by name or phone',
  stats: {
    today: 'Patients today',
    waiting: 'Waiting',
    draft: 'Draft open',
    approved: 'Approved',
  },
  list: {
    title: "Today's list",
    live: (assistant: string | null) =>
      assistant ? `Live · ${assistant} adds patients from reception` : 'Live',
    columns: {
      token: '#',
      patient: 'Patient',
      added: 'Added',
      status: 'Status',
    },
    empty:
      'No one on today’s list yet. Add a patient, or start a prescription.',
    waiting: (minutes: string) => `Waiting ${minutes}`,
    draftOpen: 'Draft open',
    approved: 'Approved',
    start: 'Start',
    continue: 'Continue',
    view: 'View',
  },
  next: {
    title: 'Next waiting',
    noted: (reason: string, assistant: string | null) =>
      assistant ? `${reason} (noted by ${assistant})` : reason,
    start: 'Start prescription',
    dictateAnyTime: 'Dictate any time with',
    noOne: 'No one is waiting.',
  },
} as const;
