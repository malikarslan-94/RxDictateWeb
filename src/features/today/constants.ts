/** Hours (24h) at which the greeting moves on. */
export const AFTERNOON_STARTS_AT = 12;
export const EVENING_STARTS_AT = 17;

export const GreetingPeriod = {
  Morning: 'morning',
  Afternoon: 'afternoon',
  Evening: 'evening',
} as const;
export type GreetingPeriod =
  (typeof GreetingPeriod)[keyof typeof GreetingPeriod];

/** "Waiting 18 min" moves on every minute. */
export const WAIT_TICK_MS = 60_000;
