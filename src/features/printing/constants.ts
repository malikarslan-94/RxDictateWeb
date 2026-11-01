import type { PrintOptions } from '@/types/printout';

/** A first print on a new computer: the full letterhead, both languages. */
export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  header: 'letterhead',
  language: 'en_ur',
  topMarginMm: 10,
  copies: 1,
};

export const MAX_TOP_MARGIN_MM = 80;
export const MAX_COPIES = 5;

/** How many of the clinic's approvals the print queue reads. */
export const QUEUE_LIMIT = 50;

/** The print queue checks for the doctor's approvals this often. */
export const PRINT_QUEUE_POLL_MS = 15_000;

/** WhatsApp's own link for a chat with a number. */
export const WHATSAPP_URL = 'https://wa.me/';
