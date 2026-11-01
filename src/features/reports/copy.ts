import type { ReportType } from '@/contract';

export const reportsCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    uploaded: 'Report uploaded',
  },
  types: {
    lab: 'Lab',
    imaging: 'Imaging',
    old_prescription: 'Old prescription',
    other: 'Other',
  } satisfies Record<ReportType, string>,
  line: (type: string, date: string, pages: number) =>
    `${type} · ${date} · ${pages === 1 ? '1 page' : `${pages} pages`}`,
  isNew: 'New',
  upload: {
    title: 'Upload report',
    pageMeta: 'A lab sheet, a scan or an old prescription, as photos or PDFs.',
    patient: 'Patient',
    type: 'Type',
    testName: 'Test name',
    testNamePlaceholder: 'e.g. CBC, chest X-ray',
    testDate: 'Test date',
    testDateHint: 'The day the test was done.',
    pages: 'Pages',
    pagesHint: (max: number, maxMb: number) =>
      `Photos (JPEG, PNG) or PDFs, up to ${max} pages of ${maxMb} MB each.`,
    choose: 'Choose files',
    drop: 'or drop them here',
    pageLabel: (index: number) => `Page ${index}`,
    removePage: (index: number) => `Remove page ${index}`,
    submit: 'Upload report',
    cancel: 'Cancel',
    sending: (page: number, total: number) =>
      `Uploading page ${page} of ${total}…`,
    uploaded: (name: string) =>
      name ? `Report uploaded for ${name}.` : 'Report uploaded.',
  },
  list: {
    title: 'Reports',
    empty: 'No reports for this patient yet.',
    upload: 'Upload report',
    open: (title: string) => `Open ${title}`,
  },
  viewer: {
    title: 'Report',
    openPdf: 'Open PDF',
    pdfNote: 'Opens in a new tab.',
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
  },
  button: (newCount: number) =>
    newCount > 0 ? `Reports · ${newCount} new` : 'Reports',
  /** The doctor's page of patients with reports nobody has opened. */
  inbox: {
    title: 'Reports and labs',
    meta: (patients: number) =>
      patients === 1
        ? '1 patient with a new report'
        : `${patients} patients with new reports`,
    note: 'Opening a report marks it seen, and the patient leaves this list once every report is seen.',
    empty:
      "No new reports. When the assistant uploads one, it waits here until you've opened it.",
    columns: { patient: 'Patient', newest: 'Newest report' },
    newCount: (count: number) => (count === 1 ? '1 new' : `${count} new`),
    open: (name: string) => `Open ${name}'s reports`,
    showing: (from: number, to: number, total: number) =>
      `Showing ${from}–${to} of ${total}`,
    previous: 'Previous',
    next: 'Next',
  },
  errors: {
    patientRequired: 'Choose the patient',
    typeRequired: 'Choose a type',
    testNameRequired: 'Enter the test name',
    testDateRequired: 'Choose the test date',
    testDateFuture: "The test date can't be after today",
    pagesRequired: 'Add at least one page',
    refused: (file: string, reason: string) => `${file}: ${reason}`,
    tooManyPages: (max: number) => `A report can have up to ${max} pages.`,
    tooBig: (maxMb: number) => `That file is over ${maxMb} MB.`,
    wrongType: 'Only photos (JPEG, PNG) and PDFs can be uploaded.',
  },
} as const;
