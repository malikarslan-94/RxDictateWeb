import { z } from 'zod';

import { commonCopy } from '@/constants/copy';
import { toE164 } from '@/utils/phone';

/** Takes what the user typed; hands the submit handler an E.164 number. */
export const signInFormSchema = z.object({
  phone: z.string().transform((value, ctx) => {
    const e164 = toE164(value);
    if (!e164) {
      ctx.addIssue({ code: 'custom', message: commonCopy.errors.invalidPhone });
      return z.NEVER;
    }
    return e164;
  }),
  /** Off by default: a reception computer is shared. */
  keepSignedIn: z.boolean(),
});

export type SignInFormInput = z.input<typeof signInFormSchema>;
