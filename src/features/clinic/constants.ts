import type { DayKey } from '@/constants/days';

import type { LocationFormInput } from './schemas';

/** Most clinics in the target market open six days a week, evenings. */
export const DEFAULT_CLINIC_DAYS: DayKey[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];
/** `HH:mm`, as the API stores clinic hours. */
export const DEFAULT_OPENS_AT = '17:00';
export const DEFAULT_CLOSES_AT = '21:00';

/** A blank location form, open the usual days and hours. */
export const EMPTY_LOCATION: LocationFormInput = {
  name: '',
  address: '',
  phone: '',
  days: DEFAULT_CLINIC_DAYS,
  opensAt: DEFAULT_OPENS_AT,
  closesAt: DEFAULT_CLOSES_AT,
};
