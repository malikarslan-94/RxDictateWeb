export const onboardingCopy = {
  signedInAs: (phone: string) => `Signed in as ${phone}`,
  notYou: 'Not you?',
  stepperTitle: 'Set up your clinic',
  steps: {
    aboutYou: { title: 'About you', detail: 'Name and credentials' },
    location: { title: 'First location', detail: 'Where you see patients' },
    assistant: { title: 'Assistant', detail: 'Optional' },
  },
  aboutYou: {
    title: 'About you',
    subtitle:
      'This is printed at the top of every prescription. You can change it later in Settings.',
    next: 'Next: location',
  },
  location: {
    title: 'Where do you see patients?',
    subtitle:
      'Add your main clinic now. A hospital OPD or second clinic can be added later in Settings.',
    next: 'Next: assistant',
  },
  assistant: {
    title: 'Do you have an assistant?',
    subtitle:
      'Your assistant adds patients to your list and prints prescriptions, signing in with their own number. You can skip this and add them later.',
    addAndFinish: 'Add and finish',
    skip: 'Skip for now',
  },
  back: 'Back',
  errors: {
    noActiveClinic: 'Your clinic could not be found. Please sign in again.',
  },
} as const;
