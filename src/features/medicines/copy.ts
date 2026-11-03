export const medicinesCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    added: 'Added to the list',
    removed: 'Taken off the list',
    created: 'Medicine added',
    saved: 'Medicine saved',
  },
  title: 'Medicines',
  meta: "Your clinic's list, and what its doctors are suggested",
  source: {
    yours: 'Suggestions while you write',
    yoursHint:
      'Which medicines appear as you type a prescription. You can always add one as typed.',
    forClinic: "Suggestions for your clinic's doctors",
    forClinicHint:
      'What each doctor starts with. A doctor can choose differently unless you fix it.',
    label: 'Where suggestions come from',
    options: {
      myList: 'My list only',
      myListFirst: 'My list first',
      all: 'All medicines',
    },
    descriptions: {
      myList:
        "Only your list and your clinic's. “Search all medicines” is one click away when you need it.",
      myListFirst:
        "Your list, then your clinic's, then every other medicine in Pakistan.",
      all: 'Every medicine in Pakistan, with your list and what you use most first.',
    },
    fromClinic: 'Your clinic chose this. Changing it here applies only to you.',
    fixedByClinic: 'Your clinic has fixed this for its doctors.',
    fixedByPlatform: 'RxDictate has fixed this for everyone.',
    unlock: 'Let doctors choose again',
    lock: "Doctors can't change it",
  },
  lists: {
    label: 'Which list',
    me: 'My list',
    clinic: "Clinic's list",
    hint: {
      me: 'Only yours. A medicine you prescribe that nothing else has lands here too, marked unverified.',
      clinic:
        'Every doctor at your clinic gets these in “my list” suggestions.',
    },
    add: 'Add medicine',
    search: 'Search this list',
    empty: {
      me: 'Nothing on your list yet.',
      clinic: "Nothing on the clinic's list yet.",
    },
    noMatch: 'Nothing on this list matches.',
    columns: { medicine: 'Medicine', company: 'Company' },
    edit: 'Edit',
    remove: (name: string) => `Take ${name} off the list`,
    showing: (from: number, to: number, total: number) =>
      `Showing ${from}–${to} of ${total}`,
    previous: 'Previous',
    next: 'Next',
  },
  marks: {
    onMyList: 'Your list',
    onClinicList: 'Clinic list',
    unverified: 'Unverified',
    discontinued: 'Discontinued',
    clinicOwn: "Clinic's own",
  },
  add: {
    title: { me: 'Add to my list', clinic: "Add to the clinic's list" },
    search: 'Search all medicines',
    typeToSearch: 'Type a brand or a generic name.',
    noMatch: 'No medicine matches that.',
    onList: 'On the list',
    add: 'Add',
    addOwn: 'Not here? Add it yourself',
    close: 'Done',
  },
  form: {
    addTitle: 'Add your own medicine',
    editTitle: 'Edit medicine',
    brand: 'Brand name',
    brandPlaceholder: 'Panadol',
    generic: 'Generic or composition',
    genericPlaceholder: 'Paracetamol 500mg',
    strength: 'Strength',
    strengthPlaceholder: '500mg',
    form: 'Form',
    pack: 'Pack',
    packPlaceholder: '10x10',
    company: 'Company',
    note: {
      me: 'Only you see it, marked unverified.',
      clinic: 'Everyone at your clinic can use it.',
    },
    add: 'Add medicine',
    save: 'Save changes',
    cancel: 'Cancel',
    brandRequired: 'Enter the brand name',
  },
  /** The quick medicine line on a prescription. */
  quick: {
    searchAll: 'Search all medicines',
    addToMyList: 'Add to my list',
    keepTyped: (name: string) => `Add “${name}” and keep it on my list`,
  },
} as const;
