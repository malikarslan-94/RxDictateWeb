import { MS_PER_MINUTE } from '@/constants/dates';
import { ErrorCode } from '@/constants/errorCodes';
import type { ErrorCode as AnyErrorCode } from '@/constants/errorCodes';

export const OTP_LENGTH = 6;

/** Server-enforced gap between two codes for the same number. */
export const RESEND_COOLDOWN_SECONDS = 60;

/** Which door the user came in through. Both end at the same code screen. */
export const AuthMode = {
  SignIn: 'signIn',
  SignUp: 'signUp',
} as const;
export type AuthMode = (typeof AuthMode)[keyof typeof AuthMode];

/**
 * The code is burned or gone: another guess cannot succeed, so the user goes
 * back to the phone screen for a fresh one.
 */
export const DEAD_CODE_ERRORS: readonly AnyErrorCode[] = [
  ErrorCode.OTP_LOCKED,
  ErrorCode.OTP_EXPIRED,
];

/** Telling the server is a courtesy: sign-out never waits longer than this. */
export const LOGOUT_TIMEOUT_MS = 5000;

/**
 * The live connection gets a fresh access token this long before the old one
 * runs out, so the server never has to close it for an expired one.
 */
export const REFRESH_AHEAD_MS = 2 * MS_PER_MINUTE;

/** Live updates down this long show as interrupted; a quick reconnect doesn't. */
export const INTERRUPTED_AFTER_MS = 3_000;

/** Refused for its token alone: refresh it and connect again. */
export const LIVE_NEEDS_REFRESH: readonly AnyErrorCode[] = [
  ErrorCode.TOKEN_EXPIRED,
  ErrorCode.TOKEN_INVALID,
];

/** The session is over: signed out elsewhere, or too old. */
export const LIVE_SESSION_OVER: readonly AnyErrorCode[] = [
  ErrorCode.SESSION_REVOKED,
  ErrorCode.SESSION_EXPIRED,
];

/** No longer in this clinic. */
export const LIVE_NOT_A_MEMBER: readonly AnyErrorCode[] = [
  ErrorCode.MEMBERSHIP_REMOVED,
  ErrorCode.NOT_MEMBER,
];

/** This location was taken away or archived: pick up where they still work. */
export const LIVE_LOCATION_GONE: readonly AnyErrorCode[] = [
  ErrorCode.LOCATION_NOT_ALLOWED,
  ErrorCode.LOCATION_ARCHIVED,
];
