import { ClientErrorCode, ErrorCode } from '@/constants/errorCodes';
import { PORTAL_INVITE_COOLDOWN_HOURS } from '@/contract';
import type { ErrorCode as AnyErrorCode } from '@/constants/errorCodes';

import type { ApiError } from './apiError';

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/**
 * What the user reads for each error code — the only place codes become copy.
 * A code missing here falls back to the server's own message.
 */
const MESSAGES: Partial<Record<AnyErrorCode, string>> = {
  [ClientErrorCode.NETWORK_ERROR]:
    "Can't reach the server. Check your internet and try again.",
  [ClientErrorCode.TIMEOUT]:
    'The server took too long to answer. Please try again.',
  [ClientErrorCode.INVALID_RESPONSE]: GENERIC_ERROR_MESSAGE,
  [ClientErrorCode.UPLOAD_FAILED]:
    "A page didn't upload. Check your internet and try again.",
  [ClientErrorCode.UNKNOWN]: GENERIC_ERROR_MESSAGE,

  [ErrorCode.RATE_LIMITED]: 'Too many attempts. Wait a minute and try again.',
  [ErrorCode.INTERNAL]: GENERIC_ERROR_MESSAGE,
  [ErrorCode.PHONE_INVALID]: 'Enter a valid mobile number',
  [ErrorCode.OTP_INVALID]: 'That code is not right. Try again.',
  [ErrorCode.OTP_EXPIRED]: 'That code expired. Request a new one.',
  [ErrorCode.OTP_LOCKED]: 'Too many wrong codes. Request a new one.',
  [ErrorCode.OTP_COOLDOWN]:
    'Please wait a moment before asking for another code.',
  [ErrorCode.ALREADY_MEMBER]: 'This number is already on your team.',
  [ErrorCode.LAST_DOCTOR]: 'A clinic needs at least one doctor.',
  [ErrorCode.LOCATION_ARCHIVED]: 'That location is archived.',
  [ErrorCode.STORAGE_UNAVAILABLE]:
    "Uploading files isn't set up on the server yet.",
  [ErrorCode.RX_HAS_FLAGS]: 'Confirm the highlighted lines before approving.',
  [ErrorCode.RX_LOCKED]:
    'This prescription is approved. Revise it to make changes.',
  [ErrorCode.PORTAL_INVITE_TOO_SOON]: `An invite went out in the last ${PORTAL_INVITE_COOLDOWN_HOURS} hours. Try again after that.`,
  [ErrorCode.OP_INVALID]: "That change couldn't be saved. Please try again.",
};

export function messageFor(error: ApiError): string {
  return MESSAGES[error.code] ?? (error.message || GENERIC_ERROR_MESSAGE);
}

/** For a code carried through navigation params, where only the code survives. */
export function messageForCode(code: string): string {
  return MESSAGES[code as AnyErrorCode] ?? GENERIC_ERROR_MESSAGE;
}
