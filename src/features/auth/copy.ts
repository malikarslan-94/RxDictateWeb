export const authCopy = {
  hero: {
    title: 'Speak the prescription.\nCheck it. Print it.',
    body: 'Urdu, English or both. Every part you dictate lands in the right section, with the English translation beside it for you to verify.',
    samplePatient: 'Imran Qureshi',
    sampleDetails: '45 · M · Own Clinic, F-8',
    youSaid: 'You said',
    sampleQuote: '"Amlodipine 5 subah nashte ke baad, ek mahina"',
    sampleSection: 'Medicine',
    sampleMedicine: 'Amlodipine 5 mg',
    sampleDose: '1+0+0 · 30 d',
    audience: 'For doctors and their clinic assistants',
  },
  phone: {
    label: 'Mobile number',
    sendCode: 'Send code',
    keepSignedIn: 'Keep me signed in on this computer',
    keepSignedInHint: 'Leave unticked on a shared reception computer.',
  },
  signIn: {
    title: 'Sign in',
    subtitle:
      "Doctors and assistants use the same sign-in. We'll send a 6-digit code to your phone.",
    newDoctor: 'New doctor?',
    setUpClinic: 'Set up your clinic',
    assistantNote:
      'Assistants: your doctor adds your number first, then you sign in here.',
  },
  signUp: {
    title: 'Set up your clinic',
    subtitle:
      "For doctors. Takes about two minutes. We'll send a 6-digit code to check it's your number.",
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
  },
  verify: {
    changeNumber: 'Change number',
    title: 'Enter the code',
    sentTo: (phone: string) =>
      `Sent by SMS to ${phone}. You can also paste it.`,
    codeLabel: 'Sign-in code',
    resendIn: (time: string) => `Didn't get it? Resend in ${time}`,
    didntGetIt: "Didn't get it?",
    resend: 'Resend code',
    verify: 'Verify and continue',
    enterCode: 'Enter the 6-digit code',
  },
  noClinic: {
    title: "This number isn't linked to a clinic yet",
    subtitle: (phone: string) =>
      `${phone} is verified, but no clinic has added it.`,
    doctorTitle: "I'm a doctor",
    doctorBody:
      "Set up your clinic with this number. You won't need another code.",
    setUpClinic: 'Set up my clinic',
    assistantTitle: "I'm an assistant",
    assistantBody:
      'Ask your doctor to add this number in Settings → Team, then sign in again.',
    backToSignIn: 'Back to sign in',
  },
  launch: {
    opening: 'Opening your clinic…',
    unreachableTitle: "Can't reach the server",
    unreachableBody:
      "Check your internet and try again. You're still signed in.",
    tryAgain: 'Try again',
    differentNumber: 'Sign in with a different number',
  },
  logout: {
    title: 'Log out of this computer?',
    body: "You'll need your phone number and a new code to sign in again.",
    bodyAssistant:
      "You'll need your phone number and a new code to sign in again. Today's list stays safe on the server.",
    pendingAudio: (count: number) =>
      count === 1
        ? "1 recording hasn't uploaded yet. Logging out will delete it from this computer."
        : `${count} recordings haven't uploaded yet. Logging out will delete them from this computer.`,
    confirm: 'Log out',
    cancel: 'Cancel',
  },
  banner: {
    expired: 'You were signed out. Please sign in again.',
    removed:
      'Your access to the clinic was removed. Ask your doctor if this is a mistake.',
  },
  toast: {
    removedOne: (clinic: string) => `You no longer have access to ${clinic}.`,
    codeSent: 'Code sent',
    clinicCreated: 'Clinic created',
  },
} as const;
