import { visitStatusSchema } from '@/contract';

/** `VisitStatus.waiting`, `.with_doctor`, `.done` — the server's strings. */
export const VisitStatus = visitStatusSchema.enum;
