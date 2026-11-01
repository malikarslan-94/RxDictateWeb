import { z } from 'zod';

import { LOCK_CHOICES } from './constants';

/** This computer's lock setting. */
export const lockSettingsSchema = z.object({
  isEnabled: z.boolean(),
  minutes: z.literal(LOCK_CHOICES),
});
export type LockSettings = z.infer<typeof lockSettingsSchema>;

/** Each user's PIN on this computer, only ever as a salted hash. */
export const pinsSchema = z.record(
  z.string(),
  z.object({ salt: z.string(), hash: z.string() }),
);
