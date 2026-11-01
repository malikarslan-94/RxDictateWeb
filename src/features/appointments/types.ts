import type { AppointmentKind } from '@/contract';

/** What the booking form starts from: a follow-up, a patient, a day. */
export type BookingPreset = {
  patientId?: string;
  /** The prescription whose follow-up this books; it then leaves the list. */
  prescriptionId?: string;
  /** `YYYY-MM-DD`. */
  date?: string;
  kind?: AppointmentKind;
};

/** One tile of the week strip. */
export type DayTile = {
  /** `YYYY-MM-DD`. */
  key: string;
  /** "Mon". */
  weekday: string;
  /** "26". */
  date: string;
  count: number;
  /** "3 booked"; empty when none are. */
  countLabel: string;
  isSelected: boolean;
  isToday: boolean;
  label: string;
};

/** One booked appointment on the selected day. */
export type AppointmentItem = {
  id: string;
  /** "9:30 am". */
  time: string;
  name: string;
  /** "45 · M". */
  details: string;
  kind: string;
  note: string;
  /** On today's list already: the server marks it when they're added. */
  hasArrived: boolean;
};

/** A follow-up nobody has booked yet. */
export type FollowUpItem = {
  id: string;
  name: string;
  /** "Due 26 Sep". */
  due: string;
  isOverdue: boolean;
  note: string;
};
