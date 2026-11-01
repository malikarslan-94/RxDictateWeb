import { DIAL_CODE, LOCAL_PHONE_LENGTH } from '@/constants/phone';

/**
 * Phone handling for Pakistani mobile numbers.
 *
 * The user types the local form ("0300 1234567" or "300 1234567"); the server
 * accepts E.164 and nothing else. These functions are the only place that
 * conversion happens.
 */

/**
 * Keep only what the user may legitimately type, and drop a leading zero —
 * "0300…" and "300…" are the same number and both must work.
 */
export function localDigits(input: string): string {
  return input.replace(/[^\d\s]/g, '').replace(/^\s*0+/, '');
}

/**
 * Convert whatever the user typed into E.164, or null if it cannot be one.
 *
 *   "0300 1234567"    -> "+923001234567"
 *   "300-1234567"     -> "+923001234567"
 *   "+92 300 1234567" -> "+923001234567"
 */
export function toE164(input: string): string | null {
  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('0092')) digits = digits.slice(4);
  else if (digits.startsWith('92') && digits.length > LOCAL_PHONE_LENGTH) {
    digits = digits.slice(2);
  }
  digits = digits.replace(/^0+/, '');

  if (digits.length !== LOCAL_PHONE_LENGTH) return null;
  return `${DIAL_CODE}${digits}`;
}

export function isValidLocalPhone(input: string): boolean {
  return toE164(input) !== null;
}

/**
 * Turn a partly typed number into the E.164 prefix the server searches by:
 * "0300 12" -> "+9230012". Null when the input isn't a phone number at all,
 * so the caller can search by name instead.
 */
export function toPhoneSearch(input: string): string | null {
  const trimmed = input.trim();
  if (!/^\+?[\d\s-]+$/.test(trimmed)) return null;

  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('0092')) digits = digits.slice(4);
  else if (digits.startsWith('92')) digits = digits.slice(2);
  digits = digits.replace(/^0+/, '');

  return digits ? `${DIAL_CODE}${digits}` : null;
}

/** "+923011234112" -> "+92 301 •••• 112", for showing a number in passing. */
export function maskE164(e164: string): string {
  const match = e164.match(/^\+92(\d{3})\d{4}(\d{3})$/);
  return match ? `${DIAL_CODE} ${match[1]} •••• ${match[2]}` : e164;
}

/** "+923001234567" -> "+92 300 1234567" for display. */
export function formatE164(e164: string): string {
  const match = e164.match(/^\+92(\d{3})(\d{7})$/);
  return match ? `${DIAL_CODE} ${match[1]} ${match[2]}` : e164;
}
