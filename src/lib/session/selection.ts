import { OrganisationType } from '@/constants/roles';
import type { MembershipView } from '@/contract';

/**
 * Which organisation to open after sign-in. One membership is the common
 * case; with several, the first clinic, so a doctor who is also on
 * RxDictate's team starts at their desk. Until a switcher exists, someone
 * only on the platform opens the platform.
 */
export function pickMembership(
  memberships: readonly MembershipView[],
): MembershipView | null {
  return (
    memberships.find(
      (membership) => membership.organisationType === OrganisationType.clinic,
    ) ??
    memberships[0] ??
    null
  );
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
