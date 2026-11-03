import type { MemberView } from '@/contract';

/** One person in the Team table, ready to show. */
export type MemberItem = {
  id: string;
  name: string;
  /** "+92 301 •••• 112". */
  phone: string;
  role: string;
  /** The locations they work at, by name. */
  places: string[];
  member: MemberView;
};

/** Which dialog is open over the Team table. */
export type TeamDialog =
  | { kind: 'add' }
  | { kind: 'edit'; member: MemberView }
  | { kind: 'addManager' }
  | { kind: 'editManager'; member: MemberView }
  | { kind: 'remove'; member: MemberView };
