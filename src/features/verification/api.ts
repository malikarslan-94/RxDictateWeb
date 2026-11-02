import { verifyViewSchema } from '@/contract';
import type { VerifyView } from '@/contract';
import { baseApi } from '@/lib/api';

/** Checking a printout by its QR code. Public: no sign-in, no clinic. */
export const verificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVerification: build.query<VerifyView, string>({
      query: (code) => `/verify/${encodeURIComponent(code)}`,
      rawResponseSchema: verifyViewSchema,
    }),
  }),
});

export const { useGetVerificationQuery } = verificationApi;
