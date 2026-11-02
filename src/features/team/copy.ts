export const teamCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    added: 'Assistant added',
    updated: 'Assistant updated',
    removed: 'Assistant removed',
  },
  title: 'Team',
  subtitle:
    "Assistants add patients to today's list and print prescriptions. They only see the locations you pick, and sign in with their own phone number.",
  columns: {
    name: 'Name',
    phone: 'Phone',
    worksAt: 'Works at',
  },
  addAssistant: 'Add assistant',
  noAssistant: 'No assistant yet. Add one to share the front desk.',
  secondDoctor: 'A second doctor at your clinic will be possible later.',
  fields: {
    name: 'Name',
    namePlaceholder: "Assistant's full name",
    phone: 'Mobile number',
    smsPreview: (doctorFirstName: string) =>
      `We'll text them: "${
        doctorFirstName ? `Dr. ${doctorFirstName}` : 'Your doctor'
      } added you to the clinic app." No password or invite link.`,
    locations: 'Works at',
  },
  dialog: {
    addTitle: 'Add assistant',
    editTitle: 'Edit assistant',
    phoneFixed: (phone: string) =>
      `Signs in with ${phone}. For a new number, remove them and add it.`,
    add: 'Add assistant',
    addLocations: 'Add to these locations',
    existing: (name: string) =>
      `${name} is already your assistant. Saving adds the locations you tick to the ones they have.`,
    save: 'Save changes',
    cancel: 'Cancel',
  },
  removeDialog: {
    title: (name: string) => `Remove ${name}?`,
    subtitle:
      'They lose access to this clinic straight away. Everything they did stays on record, and you can add them back later.',
    confirm: 'Remove',
    keep: 'Keep',
  },
  edit: 'Edit',
  remove: 'Remove',
  errors: {
    nameRequired: "Enter the assistant's name",
    locationRequired: 'Pick at least one location',
  },
} as const;
