import {
  AFTERNOON_STARTS_AT,
  EVENING_STARTS_AT,
  GreetingPeriod,
} from './constants';

export function greetingPeriod(now: Date): GreetingPeriod {
  const hour = now.getHours();
  if (hour < AFTERNOON_STARTS_AT) return GreetingPeriod.Morning;
  if (hour < EVENING_STARTS_AT) return GreetingPeriod.Afternoon;
  return GreetingPeriod.Evening;
}
