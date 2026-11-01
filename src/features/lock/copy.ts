export const lockCopy = {
  screen: {
    title: 'Locked for privacy',
    body: (minutes: number) =>
      `No activity for ${minutes} minutes. Patient details are hidden until you unlock.`,
    role: (role: string, place: string) =>
      [role, place].filter(Boolean).join(' · '),
    enterPin: 'Enter your 4-digit PIN',
    pinLabel: 'Unlock PIN',
    unlock: 'Unlock',
    wrong: (left: number) =>
      left === 1
        ? "That PIN isn't right. 1 try left."
        : `That PIN isn't right. ${left} tries left.`,
    forgot: 'Forgot PIN? Get a code by SMS instead',
    switchUser: (name: string) => `Not ${name}? Sign out and switch user`,
  },
  setPin: {
    title: 'Set your unlock PIN',
    changeTitle: 'Change your unlock PIN',
    body: 'This computer locks after a while without activity. Your PIN unlocks it without signing in again. It stays on this computer only.',
    pin: 'New PIN',
    confirm: 'Type it again',
    mismatch: "The two PINs don't match.",
    tooShort: 'Enter all 4 digits.',
    save: 'Save PIN',
    later: 'Not now',
  },
  settings: {
    title: 'This computer',
    lockAfterIdle: 'Lock after inactivity',
    lockHint:
      'Hides patient details on a shared computer. Unlock with your PIN.',
    lockAfter: 'Lock after',
    minutes: (minutes: number) =>
      minutes >= 60 ? `${minutes / 60} hour` : `${minutes} min`,
    pin: 'Unlock PIN',
    pinHint: '4 digits. Set on each computer.',
    setPin: 'Set PIN',
    changePin: 'Change PIN',
    assistantLock: (minutes: number) =>
      `Lock after ${minutes} minutes without activity`,
    assistantHint: 'Set on this computer. Unlock with your PIN.',
  },
  roles: { doctor: 'Doctor', pa: 'Assistant', patient: 'Patient' },
} as const;
