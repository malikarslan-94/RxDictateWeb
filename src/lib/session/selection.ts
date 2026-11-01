import type { MembershipView } from '@/contract';

/**
 * Which clinic to open after sign-in. One membership is the common case;
 * with several, the first is used until a clinic switcher exists.
 */
export function pickMembership(
  memberships: readonly MembershipView[],
): MembershipView | null {
  return memberships[0] ?? null;
}

/** The default location if it's active, else the first active one. */
export function pickLocationId(membership: MembershipView): string | null {
  const active = membership.locations.filter(
    (location) => location.status === 'active',
  );
  return (
    (active.find((location) => location.isDefault) ?? active[0])?.id ?? null
  );
}
