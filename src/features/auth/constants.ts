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
