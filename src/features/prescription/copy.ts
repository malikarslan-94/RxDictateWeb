import type {
  HistoryKind,
  PrescriptionSections,
  PrescriptionStatus,
  VisitStatus,
} from '@/contract';

import { DAYS_PER_MONTH, DAYS_PER_WEEK } from './constants';

type MedicineForm = PrescriptionSections['medicines'][number]['form'];
type MedicineRoute = PrescriptionSections['medicines'][number]['route'];
type MedicineTiming = PrescriptionSections['medicines'][number]['timing'];
type MedicineFlag = PrescriptionSections['medicines'][number]['flags'][number];

export const rxCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    approved: 'Prescription approved',
    revising: 'Revision started',
    discarded: 'Draft discarded',
  },
  title: 'Consultation',
  /** The doctor's History log: every prescription at this location. */
  log: {
    title: 'History',
    meta: (total: number) =>
      total === 1 ? '1 prescription' : `${total} prescriptions`,
    searchPlaceholder: 'Search by patient name, phone or MR number',
    filterLabel: 'Show',
    filters: { all: 'All', draft: 'Drafts', approved: 'Approved' },
    columns: {
      patient: 'Patient',
      prescription: 'Prescription',
      status: 'Status',
      date: 'Started',
    },
    status: {
      draft: 'Draft',
      approved: 'Approved',
      superseded: 'Revised',
      cancelled: 'Discarded',
    } satisfies Record<PrescriptionStatus, string>,
    draftTitle: 'Draft',
    unknownPatient: 'Patient removed',
    date: (day: string, time: string) => `${day} · ${time}`,
    empty: 'No prescriptions at this location yet.',
    noMatch: 'No prescriptions match that search.',
    showing: (from: number, to: number, total: number) =>
      `Showing ${from}–${to} of ${total}`,
    previous: 'Previous',
    next: 'Next',
  },
  /** A template's editor, over the Templates page. */
  templateEditor: {
    newTitle: 'New template',
    editTitle: 'Edit template',
    description:
      'The diagnosis, medicines, tests, diet, advice and follow-up a prescription starts with. Complaints stay with each patient.',
    name: 'Template name',
    namePlaceholder: 'e.g. Viral fever',
    save: 'Save template',
    cancel: 'Cancel',
    empty: 'Add at least one line before saving.',
  },
  /** The History dialog's second tab: everything on record, newest first. */
  timeline: {
    tabs: { prescriptions: 'Past prescriptions', timeline: 'Timeline' },
    tabsLabel: 'Show',
    filterLabel: 'Kind',
    all: 'All',
    kinds: {
      visit: 'Visits',
      prescription: 'Prescriptions',
      lab: 'Labs',
      report: 'Reports',
    } satisfies Record<HistoryKind, string>,
    visit: (token: number) => `Visit · token #${token}`,
    visitStatus: {
      waiting: 'Waited',
      with_doctor: 'With the doctor',
      done: 'Seen',
    } satisfies Record<VisitStatus, string>,
    noReason: 'No reason given',
    noResult: 'No result yet',
    result: (text: string) => `Result: ${text}`,
    report: (type: string, testDate: string, pages: number) =>
      `${type} · test on ${testDate} · ${pages === 1 ? '1 page' : `${pages} pages`}`,
    isNew: 'New',
    open: (title: string) => `Open ${title}`,
    showMore: 'Show more',
    empty: 'Nothing on record for this patient yet.',
    emptyKind: 'Nothing of this kind on record.',
  },
  pastRx: {
    heading: 'History',
    printPreview: 'Open print preview',
    saveTemplate: 'Save as template',
    empty: 'No earlier prescriptions for this patient.',
    title: (number: string) => number || 'Prescription',
    line: (date: string, medicines: number) =>
      `${date} · ${medicines === 1 ? '1 medicine' : `${medicines} medicines`}`,
  },
  patientLine: (details: string, mrNo: string, token: number | null) =>
    [details, mrNo, token ? `Token #${token}` : ''].filter(Boolean).join(' · '),
  allergy: (list: string) => `Allergy: ${list}`,
  noKnownAllergies: 'No known allergies',
  allergiesNotAsked: 'Allergies not recorded',
  conditions: (list: string) => `Known conditions: ${list}`,
  vitals: {
    title: 'Vitals',
    recordedAt: (time: string) => `Recorded ${time}`,
    none: 'None recorded for this visit yet.',
    add: 'Add vitals',
    edit: 'Edit',
  },
  sections: {
    complaints: 'Complaints',
    diagnosis: 'Diagnosis',
    medicines: 'Medicines',
    labs: 'Lab tests',
    advice: 'Advice',
    followUp: 'Follow-up',
  },
  count: (title: string, count: number) =>
    count > 0 ? `${title} · ${count}` : title,
  add: {
    complaints: '+ Add complaint',
    diagnosis: '+ Add diagnosis',
    medicine: '+ Add medicine',
    labs: '+ Add test',
    advice: '+ Add advice',
  },
  repeatLast: 'Repeat last Rx',
  saving: 'Saving…',
  edit: 'Edit',
  remove: 'Remove',
  save: 'Save',
  confirm: 'Confirm',
  form: {
    tab: 'Tablet',
    cap: 'Capsule',
    syp: 'Syrup',
    inj: 'Injection',
    drops: 'Drops',
    cream: 'Cream',
    ointment: 'Ointment',
    sachet: 'Sachet',
    spray: 'Spray',
    other: 'Other',
  } satisfies Record<MedicineForm, string>,
  route: {
    oral: 'by mouth',
    topical: 'on the skin',
    injection: 'injection',
    inhaled: 'inhaled',
    drops: 'drops',
    other: 'other',
  } satisfies Record<MedicineRoute, string>,
  timing: {
    before_meal: 'Before meal',
    after_meal: 'After meal',
    with_meal: 'With meal',
    empty_stomach: 'Empty stomach',
    any: 'Any time',
  } satisfies Record<MedicineTiming, string>,
  flag: {
    dose_unclear: 'The dose was unclear in the recording.',
    drug_unknown: "This medicine wasn't found in the drug list.",
    strength_unclear: 'The strength was unclear in the recording.',
    duration_unclear: 'The duration was unclear in the recording.',
    route_unclear: 'How to take it was unclear in the recording.',
  } satisfies Record<MedicineFlag, string>,
  confirmLine: 'Check it, then confirm.',
  allergyClash: (allergy: string) =>
    `The patient is allergic to ${allergy}. Check before approving.`,
  sos: 'SOS',
  days: (days: number) => (days === 1 ? '1 day' : `${days} days`),
  followUp: {
    none: 'No follow-up',
    inDays: (days: number) => {
      if (days % DAYS_PER_MONTH === 0) {
        const months = days / DAYS_PER_MONTH;
        return months === 1 ? 'In 1 month' : `In ${months} months`;
      }
      if (days % DAYS_PER_WEEK === 0) {
        const weeks = days / DAYS_PER_WEEK;
        return weeks === 1 ? 'In 1 week' : `In ${weeks} weeks`;
      }
      return days === 1 ? 'Tomorrow' : `In ${days} days`;
    },
    change: 'Change',
    set: 'Set',
    askToBook: (name: string) => `Ask ${name} to book the appointment`,
  },
  medicineSheet: {
    addTitle: 'Add medicine',
    editTitle: 'Edit medicine',
    name: 'Medicine',
    namePlaceholder: 'Search or type, e.g. Amlodipine',
    strength: 'Strength',
    strengthPlaceholder: 'e.g. 5 mg',
    form: 'Form',
    dose: 'Dose',
    timing: 'When',
    duration: 'Duration (days)',
    durationPlaceholder: 'e.g. 30',
  },
  textSheet: {
    addTitle: (section: string) => `Add ${section.toLowerCase()}`,
    editTitle: (section: string) => `Edit ${section.toLowerCase()}`,
    placeholder: 'Type here',
  },
  followUpSheet: {
    title: 'Follow-up',
    inDays: 'In days',
    inDaysPlaceholder: 'e.g. 14',
    note: 'Note',
    notePlaceholder: 'e.g. with lab reports',
    clear: 'No follow-up',
  },
  discardSheet: {
    title: 'Discard this draft?',
    draft: 'Everything on it is removed. You can start the prescription again.',
    revision: (number: string) =>
      `The revision is removed. ${number || 'The approved prescription'} stays exactly as it is.`,
    confirm: 'Discard draft',
    keep: 'Keep editing',
  },
  reviseSheet: {
    title: 'Revise prescription',
    subtitle:
      'The approved version stays on record. You get a new draft to change and approve again.',
    reason: 'Reason',
    reasonPlaceholder: 'e.g. dose changed after lab results',
    submit: 'Start revision',
  },
  actions: {
    dictate: 'Dictate',
    preview: 'Preview',
    approve: 'Approve & send',
    notified: 'The patient and your assistant will be notified.',
    resolveFlags: 'Confirm the highlighted lines to approve.',
    empty: 'Add something to the prescription to approve it.',
    print: 'Print or share PDF',
    revise: 'Revise',
    openRevision: 'Open revision',
    discard: 'Discard draft',
  },
  approved: (number: string) => `Approved · ${number}`,
  context: {
    revising: (number: string, version: number) =>
      number
        ? `Revising ${number} · version ${version}. ${number} stays valid until you approve this one.`
        : `Revision · version ${version}`,
    draft: (time: string) => `Draft in progress · last saved ${time}`,
  },
  workspace: {
    today: (count: number) => `Today · ${count}`,
    nextPatient: 'Next patient',
    noOneElse: 'No one else is waiting.',
    queueStatus: {
      waiting: 'Waiting',
      with_doctor: 'Draft',
      done: 'Approved',
    },
    patientLine: (parts: string[]) => parts.filter(Boolean).join(' · '),
    lastVisit: (date: string) => `last visit ${date}`,
    history: 'History',
    draft: 'Draft',
    approved: 'Approved',
    savedAgo: (ago: string) => `Saved ${ago}`,
    saving: 'Saving…',
    parts: (dictated: number, typed: number) =>
      [
        dictated > 0
          ? dictated === 1
            ? '1 part dictated'
            : `${dictated} parts dictated`
          : '',
        typed > 0 ? `${typed} typed` : '',
      ]
        .filter(Boolean)
        .join(', '),
    preview: 'Preview',
    approve: 'Approve',
    fromTemplate: 'Start from template',
    addTemplate: 'Add from template',
    print: 'Print',
    revise: 'Revise',
    openRevision: 'Open revision',
    discard: 'Discard draft',
    approvedOn: (number: string, date: string) =>
      number ? `${number} · approved ${date}` : `Approved ${date}`,
    lockedNote:
      'Approved prescriptions are locked. Revise to make a new version.',
    choosePatient: 'Choose a patient from today’s list to start.',
  },
  editor: {
    sections: {
      complaints: 'Complaints',
      diagnosis: 'Diagnosis',
      medicines: 'Medicines',
      labs: 'Tests advised',
      dietAvoid: 'Avoid',
      dietEat: 'Eat more',
      advice: 'Advice',
      followUp: 'Follow-up',
    },
    add: {
      complaints: 'Add complaint',
      diagnosis: 'Add diagnosis',
      labs: 'Add test',
      dietAvoid: 'Add',
      dietEat: 'Add',
      advice: 'Add advice',
    },
    noneYet: 'None yet',
    newItem: 'New',
    dictated: 'Dictated',
    typed: 'Typed',
    typeToAdd: 'Type and press Enter',
    editLine: (text: string) => `Edit: ${text}`,
    removeLine: (text: string) => `Remove: ${text}`,
    allergyCheck: 'Checked against allergies',
    noConflicts: 'No conflicts',
    conflicts: (count: number) =>
      count === 1 ? '1 conflict' : `${count} conflicts`,
    columns: {
      medicine: 'Medicine',
      dose: 'M · A · N',
      when: 'When',
      days: 'Days',
    },
    doseSlot: { m: 'Morning', a: 'Afternoon', n: 'Night' },
    doseLabel: (slot: string, count: number) => `${slot}: ${count}`,
    sos: 'SOS',
    daysLabel: (name: string) => `Days for ${name}`,
    whenLabel: (name: string) => `When to take ${name}`,
    removeMedicine: (name: string) => `Remove ${name}`,
    noDuration: 'Duration not dictated',
    noDays: '—',
    setDays: (days: number) => `Set ${days} days`,
    confirmLine: 'Looks right',
    quickPlaceholder: 'Type a medicine… e.g. metf 500 1-0-1 30d',
    quickLabel: 'Add a medicine',
    enter: 'Enter',
    noMatch: (name: string) => `Add “${name}” as typed`,
    followUp: {
      week: '1 week',
      twoWeeks: '2 weeks',
      month: '1 month',
      custom: 'Custom',
      none: 'None',
      customLabel: 'Follow-up date',
    },
  },
  reviseDialog: {
    title: 'Revise prescription',
    subtitle:
      'The approved version stays on record. You get a new draft to change and approve again.',
    reason: 'Reason',
    reasonPlaceholder: 'e.g. dose changed after lab results',
    submit: 'Start revision',
    cancel: 'Cancel',
  },
  discardDialog: {
    title: 'Discard this draft?',
    draft: 'Everything on it is removed. You can start the prescription again.',
    revision:
      'The revision is removed. The approved prescription stays exactly as it is.',
    confirm: 'Discard draft',
    keep: 'Keep editing',
  },
  approveDialog: {
    title: 'Approve this prescription?',
    medicines: 'Medicines',
    tests: 'Tests',
    followUp: 'Follow-up',
    noFollowUp: '—',
    noConflicts: (allergies: string) =>
      allergies
        ? `No allergy conflicts (${allergies})`
        : 'No allergy conflicts',
    noAllergies: 'No allergies recorded',
    clash: (medicine: string, allergy: string) =>
      `${medicine} may clash with the allergy to ${allergy}.`,
    allApplied: 'Every dictated part was applied',
    stillWorking:
      'A dictated part is still being written in. Wait for it first.',
    failedParts: (count: number) =>
      count === 1
        ? '1 dictated part failed. Retry it or type the lines in.'
        : `${count} dictated parts failed. Retry them or type the lines in.`,
    noDuration: (name: string) => `${name} has no duration.`,
    noDurationAfter: ' It will print without one.',
    flagged: (name: string, why: string) => `${name}: ${why}`,
    fixIt: 'Fix it',
    locked: (assistant: string | null) =>
      assistant
        ? `Once approved it is locked. Changes later create version 2, and ${assistant} sees it as ready to print.`
        : 'Once approved it is locked. Changes later create version 2.',
    openPreview: 'Open print preview after approving',
    back: 'Back to edit',
    approve: 'Approve',
  },
  errors: {
    nothingToRepeat: 'This patient has no earlier prescription to repeat.',
    nameRequired: 'Enter the medicine',
    textRequired: 'Type something first',
    daysInvalid: 'Enter a number of days',
  },
} as const;
