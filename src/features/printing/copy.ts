export const printingCopy = {
  settings: {
    title: 'Print settings',
    header: 'Header',
    letterhead: 'Letterhead',
    preprinted: 'Pre-printed',
    preprintedHint:
      'Pre-printed leaves the top blank for your own printed pads.',
    language: 'Language',
    english: 'English',
    bilingual: 'Eng + Urdu',
    topMargin: 'Top margin',
    mm: 'mm',
    copies: 'Copies',
    saved: 'Saved for this computer.',
  },
  actions: {
    print: 'Print',
    orPress: 'or press',
    pdf: 'PDF',
    whatsapp: 'WhatsApp',
    whatsappText: (name: string, url: string) =>
      `Prescription for ${name}: ${url}`,
    markPrinted: 'Mark as printed · next',
  },
  preview: {
    title: 'Print preview',
    meta: (parts: string[]) => parts.filter(Boolean).join(' · '),
    approvedAgo: (ago: string) => `approved ${ago.toLowerCase()}`,
    draft: 'draft',
    back: 'Today',
    saveTemplate: 'Save as template',
  },
  queue: {
    title: 'Print queue',
    meta: (doctor: string) =>
      doctor
        ? `Prescriptions approved by ${doctor}, oldest first`
        : 'Approved prescriptions, oldest first',
    ready: (count: number) => `Ready to print · ${count}`,
    approvedAgo: (ago: string) => `Approved ${ago.toLowerCase()}`,
    empty: 'Nothing to print. Approved prescriptions show up here.',
    printedToday: (count: number) =>
      count === 1 ? '1 printed today' : `${count} printed today`,
  },
} as const;
