import { roleSchema } from '@/contract';
import type { Role as ContractRole } from '@/contract';

/** `Role.doctor`, `Role.pa`, `Role.patient` — the server's exact strings. */
export const Role = roleSchema.enum;
export type Role = ContractRole;
