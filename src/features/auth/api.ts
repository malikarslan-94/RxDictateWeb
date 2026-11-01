import { meViewSchema, sendOtpResultSchema, sessionSchema } from '@/contract';
import type {
  CreatePracticeBody,
  LogoutBody,
  MeView,
  SendOtpBody,
  SendOtpResult,
  Session,
  VerifyOtpBody,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { authCopy } from './copy';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendOtp: build.mutation<SendOtpResult, SendOtpBody>({
      extraOptions: { success: authCopy.toast.codeSent },
      query: (body) => ({ url: '/auth/otp/send', method: 'POST', body }),
      rawResponseSchema: sendOtpResultSchema,
    }),
    verifyOtp: build.mutation<Session, VerifyOtpBody>({
      query: (body) => ({ url: '/auth/otp/verify', method: 'POST', body }),
      rawResponseSchema: sessionSchema,
    }),
    /** Ends this phone's session on the server. Fine to call twice. */
    logout: build.mutation<void, LogoutBody>({
      extraOptions: { quiet: true },
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
    }),
    /** A verified user with no clinic sets one up, without a second code. */
    createPractice: build.mutation<MeView, CreatePracticeBody>({
      extraOptions: { success: authCopy.toast.clinicCreated },
      query: (body) => ({ url: '/practices', method: 'POST', body }),
      rawResponseSchema: meViewSchema,
      invalidatesTags: [ApiTag.Me],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useCreatePracticeMutation,
} = authApi;
