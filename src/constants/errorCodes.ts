import { ERROR_CODES } from '@/contract';
import type { ErrorCode as ServerErrorCode } from '@/contract';

/**
 * Every server error code as a constant: `ErrorCode.OTP_LOCKED`.
 *
 * Built from the API contract, so a code the server does not send cannot be
 * referenced, and a new one appears here after `yarn sync:contract`.
 */
export const ErrorCode = Object.fromEntries(
  ERROR_CODES.map((code) => [code, code]),
) as { readonly [K in ServerErrorCode]: K };

/** Failures that happen on the device, before or instead of a server answer. */
export const ClientErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  /** Storage refused a file's bytes, e.g. its signed link had expired. */
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ClientErrorCode =
  (typeof ClientErrorCode)[keyof typeof ClientErrorCode];

export type ErrorCode = ServerErrorCode | ClientErrorCode;
