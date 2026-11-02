import { verifyStatusSchema } from '@/contract';

/** Where a check stands: the server's two answers, plus the ways to have none. */
export const CheckState = {
  loading: 'loading',
  valid: verifyStatusSchema.enum.valid,
  replaced: verifyStatusSchema.enum.replaced,
  notFound: 'notFound',
  error: 'error',
} as const;
export type CheckState = (typeof CheckState)[keyof typeof CheckState];
