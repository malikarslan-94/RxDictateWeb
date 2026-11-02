export const adminCopy = {
  title: (name: string) => (name ? `Hello, ${name}` : 'Hello'),
  role: (role: string) =>
    `You're signed in as ${role} on RxDictate's own team.`,
  coming:
    'The admin console comes to the web in a later step: reviewing medicine companies and their products, and the events and seminars doctors see.',
  logout: 'Log out',
} as const;
