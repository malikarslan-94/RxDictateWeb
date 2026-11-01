import { z } from 'zod';

import { MAX_COPIES, MAX_TOP_MARGIN_MM } from './constants';

/** This computer's print settings, as kept in the browser. */
export const printOptionsSchema = z.object({
  header: z.enum(['letterhead', 'preprinted']),
  language: z.enum(['en', 'en_ur']),
  topMarginMm: z.number().int().min(0).max(MAX_TOP_MARGIN_MM),
  copies: z.number().int().min(1).max(MAX_COPIES),
});

/** Prescriptions printed on this computer: id → when. */
export const printedSchema = z.record(z.string(), z.string());
