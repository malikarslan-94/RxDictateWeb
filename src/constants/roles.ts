import { actionSchema, organisationTypeSchema, roleSchema } from '@/contract';
import type {
  Action as ContractAction,
  OrganisationType as ContractOrganisationType,
  Role as ContractRole,
} from '@/contract';

/** `Role.doctor`, `Role.pa`, `Role.platformAdmin`… — the server's exact strings. */
export const Role = roleSchema.enum;
export type Role = ContractRole;

/**
 * What a membership may do: `Action['report.review']`. Show or hide an
 * action with these (`useCan`), never with a role's name.
 */
export const Action = actionSchema.enum;
export type Action = ContractAction;

/** `OrganisationType.clinic`, `.platform`, `.company`. */
export const OrganisationType = organisationTypeSchema.enum;
export type OrganisationType = ContractOrganisationType;
