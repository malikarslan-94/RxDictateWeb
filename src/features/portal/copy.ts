import {
  PORTAL_INVITE_EXPIRY_DAYS,
  PORTAL_LINK_DORMANT_DAYS,
} from '@/contract';

export const portalCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    invited: 'Invite sent',
    saved: 'Changes saved',
    removed: 'Online access removed',
  },
  patient: {
    title: 'Online access',
    status: {
      none: 'Not invited yet.',
      invited: (date: string) => `Invited on ${date}.`,
      linked: (date: string) => `Linked since ${date}.`,
      dormant: `Not used for ${PORTAL_LINK_DORMANT_DAYS} days. They need a new invite to see their records.`,
      blocked: 'Not shared online.',
      clinicOff: "Your clinic hasn't turned on online access.",
      noPhone: 'Add a mobile number to invite them.',
    },
    invite: 'Invite to RxDictate',
    inviteAgain: 'Send invite again',
    block: "Don't share online",
    blockHint: 'Turning this on ends any link they have.',
    remove: 'Remove access',
    removeDialog: {
      title: 'Remove online access?',
      body: 'They stop seeing their records straight away. Nothing is deleted, and they can link again with a new invite or a printed prescription.',
      confirm: 'Remove access',
      keep: 'Keep',
    },
  },
  settings: {
    title: 'Patients seeing their records',
    body: 'Patients can sign in with their phone number and see their approved prescriptions, reports, appointments, follow-ups and vitals, and send you a report. Each record needs an invite or the code on a printed prescription.',
    enabled: 'Turn on online access',
    enabledHint:
      'Turning it off keeps patients’ links, but they stop seeing anything until you turn it back on.',
    invitesLabel: 'How invites go out',
    invites: { manual: 'When we send one', auto: 'Automatically' },
    invitesHint: {
      manual: 'Your staff send an invite from a patient, by SMS.',
      auto: 'One SMS after a patient’s first approved prescription, and your staff can still send one.',
    },
    fixedByPlatform: 'RxDictate has fixed this for everyone.',
  },
  invitePage: {
    title: 'Your invitation',
    heading: 'See your prescriptions on your phone',
    intro: 'Your clinic invited you to see your records in the RxDictate app.',
    steps: [
      'Install the RxDictate app on your phone.',
      'Sign in with the mobile number this message came to.',
      'Enter the code below when the app asks for it.',
    ],
    code: 'Your code',
    copy: 'Copy code',
    copied: 'Copied',
    note: `Keep this code private. It works once, for ${PORTAL_INVITE_EXPIRY_DAYS} days.`,
  },
} as const;
