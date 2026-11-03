export const teamCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    added: 'Added to your team',
    updated: 'Changes saved',
    removed: 'Removed from your team',
  },
  title: 'Team',
  subtitle:
    "Assistants add patients to today's list and print prescriptions, and only see the locations you pick. A medicine manager keeps your clinic's medicine list and sees nothing else. Each signs in with their own phone number.",
  columns: {
    name: 'Name',
    phone: 'Phone',
    worksAt: 'Works at',
  },
  addAssistant: 'Add assistant',
  addManager: 'Add medicine manager',
  allLocations: 'All locations',
  noAssistant: 'Nobody yet. Add an assistant to share the front desk.',
  secondDoctor: 'A second doctor at your clinic will be possible later.',
  fields: {
    name: 'Name',
    namePlaceholder: "Assistant's full name",
    managerNamePlaceholder: "Medicine manager's full name",
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
    addManagerTitle: 'Add medicine manager',
    editManagerTitle: 'Edit medicine manager',
    addManager: 'Add medicine manager',
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
    nameRequired: 'Enter their name',
    locationRequired: 'Pick at least one location',
  },
} as const;
