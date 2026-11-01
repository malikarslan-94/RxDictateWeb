import { appointmentKindSchema, appointmentStatusSchema } from '@/contract';

/** `AppointmentKind.follow_up`, `.new_problem`. */
export const AppointmentKind = appointmentKindSchema.enum;

/** `AppointmentStatus.booked`, `.arrived`, `.cancelled`. */
export const AppointmentStatus = appointmentStatusSchema.enum;

/** The strip above the list shows one week at a time. */
export const DAYS_PER_WEEK = 7;

/** "Today" for the strip and the date field; a minute is near enough. */
export const TODAY_TICK_MS = 60_000;
