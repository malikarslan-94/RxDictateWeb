export const templatesCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    saved: 'Template saved',
    updated: 'Template updated',
    deleted: 'Template deleted',
    applied: 'Template added to the prescription',
  },
  page: {
    title: 'Templates',
    meta: (count: number) =>
      count === 1 ? '1 template' : `${count} templates`,
    searchPlaceholder: 'Search templates',
    new: 'New template',
    empty:
      'No templates yet. Make one here, or save an approved prescription as a template from its print preview or History.',
    noMatch: 'No templates match that search.',
  },
  card: {
    use: 'Use',
    edit: 'Edit',
    delete: 'Delete',
    editLabel: (name: string) => `Edit ${name}`,
    deleteLabel: (name: string) => `Delete ${name}`,
  },
  summary: {
    medicines: (count: number) =>
      count === 1 ? '1 medicine' : `${count} medicines`,
    labs: (count: number) => (count === 1 ? '1 lab' : `${count} labs`),
    advice: 'advice',
    diet: 'diet',
    followUp: (days: number) => `follow-up in ${days} days`,
    empty: 'Nothing in it yet',
  },
  used: (times: number) =>
    times === 0
      ? 'Not used yet'
      : times === 1
        ? 'Used once'
        : `Used ${times} times`,
  detail: (summary: string, used: string) => `${summary} · ${used}`,
  use: {
    title: (name: string) => `Use “${name}”`,
    description:
      'Starts a prescription for the patient from this template, or adds its lines to the one already open today.',
    patient: 'Patient',
    submit: 'Start prescription',
    cancel: 'Cancel',
    patientRequired: 'Choose the patient',
  },
  remove: {
    title: (name: string) => `Delete “${name}”?`,
    body: 'Prescriptions already started from it stay as they are.',
    confirm: 'Delete template',
    cancel: 'Keep it',
  },
  save: {
    title: 'Save as template',
    description:
      'Keeps the diagnosis, medicines, tests, diet, advice and follow-up. The complaints stay with this patient.',
    name: 'Template name',
    namePlaceholder: 'e.g. Viral fever',
    submit: 'Save template',
    cancel: 'Cancel',
    saved: (name: string) =>
      `Saved as “${name}”. You’ll find it under Templates.`,
    done: 'Done',
    nameRequired: 'Give the template a name',
    nameTooLong: (max: number) => `Keep the name under ${max} characters`,
  },
  picker: {
    title: 'Start from a template',
    addTitle: 'Add from a template',
    description:
      'Its lines are added to this prescription. Nothing already on it is removed.',
    searchPlaceholder: 'Search templates',
    use: (name: string) => `Use ${name}`,
    empty: 'No templates yet. Save an approved prescription as one first.',
    noMatch: 'No templates match that search.',
  },
} as const;
