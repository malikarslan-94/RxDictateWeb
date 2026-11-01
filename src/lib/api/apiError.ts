import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { ERROR_CODES } from '@/contract';
import type { ErrorBody } from '@/contract';
import { ClientErrorCode } from '@/constants/errorCodes';
import type { ErrorCode } from '@/constants/errorCodes';

/**
 * The one error shape the app handles. Branch on `code`, never on `message`
 * (human copy that changes) or `status` (several codes share one).
 */
export type ApiError = {
  code: ErrorCode;
  /** The server's message, when there was one. Show `messageFor()` instead. */
  message: string;
  /** e.g. `{ retryAfterSeconds }` on OTP_COOLDOWN. */
  details?: unknown;
  /** HTTP status; 0 when no answer arrived. */
  status: number;
};

const SERVER_CODES: readonly string[] = ERROR_CODES;

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'status' in value
  );
}

/** Normalise whatever fetchBaseQuery reports into an ApiError. */
export function fromFetchError(error: FetchBaseQueryError): ApiError {
  if (typeof error.status === 'number') {
    const body = error.data as Partial<ErrorBody> | undefined;
    const serverError = body?.error;

    if (serverError && SERVER_CODES.includes(serverError.code)) {
      return {
        code: serverError.code,
        message: serverError.message,
        details: serverError.details,
        status: error.status,
      };
    }
    return {
      code: ClientErrorCode.INVALID_RESPONSE,
      message: '',
      status: error.status,
    };
  }

  switch (error.status) {
    case 'FETCH_ERROR':
      return { code: ClientErrorCode.NETWORK_ERROR, message: '', status: 0 };
    case 'TIMEOUT_ERROR':
      return { code: ClientErrorCode.TIMEOUT, message: '', status: 0 };
    case 'PARSING_ERROR':
      return {
        code: ClientErrorCode.INVALID_RESPONSE,
        message: '',
        status: error.originalStatus,
      };
    default:
      return { code: ClientErrorCode.UNKNOWN, message: '', status: 0 };
  }
}

/** Whatever a mutation's `unwrap()` threw, as an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  return { code: ClientErrorCode.UNKNOWN, message: '', status: 0 };
}

/** Read a numeric field out of `details`, e.g. `retryAfterSeconds`. */
export function detailNumber(error: ApiError, key: string): number | null {
  const details = error.details;
  if (typeof details !== 'object' || details === null || !(key in details)) {
    return null;
  }
  const value = (details as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : null;
}
