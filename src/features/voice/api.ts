import {
  segmentViewSchema,
  signedUrlViewSchema,
  voiceSessionViewSchema,
} from '@/contract';
import type {
  AddSegmentBody,
  SegmentView,
  SignedUrlView,
  VoiceSessionView,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { countApplied } from './utils';

const voiceTag = (prescriptionId: string) => ({
  type: ApiTag.Voice,
  id: prescriptionId,
});

export const voiceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** A draft's recordings and where each one stands. Empty before the first. */
    getVoiceSession: build.query<VoiceSessionView, string>({
      query: (prescriptionId) => `/prescriptions/${prescriptionId}/voice`,
      rawResponseSchema: voiceSessionViewSchema,
      providesTags: (_result, _error, prescriptionId) => [
        voiceTag(prescriptionId),
      ],
      // The server writes a recording's lines into the draft itself: when one
      // more has been applied, the cached prescription is out of date.
      async onQueryStarted(
        _prescriptionId,
        { dispatch, getCacheEntry, queryFulfilled },
      ) {
        const before = countApplied(getCacheEntry().data);
        const { data } = await queryFulfilled;
        if (countApplied(data) > before) {
          dispatch(baseApi.util.invalidateTags([ApiTag.Prescription]));
        }
      },
    }),
    addSegment: build.mutation<
      SegmentView,
      { prescriptionId: string; body: AddSegmentBody }
    >({
      query: ({ prescriptionId, body }) => ({
        url: `/prescriptions/${prescriptionId}/voice/segments`,
        method: 'POST',
        body,
      }),
      rawResponseSchema: segmentViewSchema,
      invalidatesTags: (_result, _error, { prescriptionId }) => [
        voiceTag(prescriptionId),
      ],
    }),
    /** Put a failed recording back in the queue without recording it again. */
    retrySegment: build.mutation<
      SegmentView,
      { prescriptionId: string; segmentId: string }
    >({
      query: ({ segmentId }) => ({
        url: `/voice/segments/${segmentId}/retry`,
        method: 'POST',
      }),
      rawResponseSchema: segmentViewSchema,
      invalidatesTags: (_result, _error, { prescriptionId }) => [
        voiceTag(prescriptionId),
      ],
    }),
    /** A short-lived link to play one part back. Asked fresh every time. */
    getSegmentAudio: build.mutation<SignedUrlView, string>({
      query: (segmentId) => `/voice/segments/${segmentId}/audio`,
      rawResponseSchema: signedUrlViewSchema,
    }),
  }),
});

export const {
  useGetVoiceSessionQuery,
  useLazyGetVoiceSessionQuery,
  useAddSegmentMutation,
  useRetrySegmentMutation,
  useGetSegmentAudioMutation,
} = voiceApi;
