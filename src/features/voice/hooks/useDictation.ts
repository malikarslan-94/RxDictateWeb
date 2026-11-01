import { useEffect, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { Hotkeys } from '@/constants/keys';
import { useGetPracticeQuery } from '@/features/clinic';
import { useHotkey } from '@/hooks/useHotkey';
import { messageFor, toApiError } from '@/lib/api';
import { forgetRecording, keepRecording, readAsBase64 } from '@/lib/recordings';
import { registerSignOutTask } from '@/lib/session';
import { formatCountdown } from '@/utils/time';

import {
  useAddSegmentMutation,
  useGetSegmentAudioMutation,
  useGetVoiceSessionQuery,
  useLazyGetVoiceSessionQuery,
  useRetrySegmentMutation,
} from '../api';
import { MAX_RECORDING_MS, MS_PER_SECOND } from '../constants';
import { voiceCopy } from '../copy';
import type { Recording, TranscriptView } from '../types';
import { isProcessing, newestSpanIds, nextSeq, toPartItems } from '../utils';
import { useAudioLevel } from './useAudioLevel';
import { useMicrophone } from './useMicrophone';
import { useRecorder } from './useRecorder';

export type UseDictationOptions = {
  /** The open draft, or null before the first change creates one. */
  prescriptionId: string | null;
  /** Create the draft if there isn't one yet, and give its id. */
  ensureDraft: () => Promise<string>;
  /** False on an approved prescription: there's nothing to dictate into. */
  isEnabled: boolean;
};

/**
 * Dictating into a draft: record a part, send it, and follow it while the
 * server writes it up. Ctrl M starts and stops. Each stop is one part; the
 * server fills the prescription from the parts in order.
 */
export function useDictation({
  prescriptionId,
  ensureDraft,
  isEnabled,
}: UseDictationOptions) {
  const practice = useGetPracticeQuery();
  const microphone = useMicrophone();
  const recorder = useRecorder(microphone.deviceId);
  const level = useAudioLevel(recorder.stream);
  const sessionArg = prescriptionId ?? skipToken;
  // The server says when a part is written up; the session refetches then.
  const session = useGetVoiceSessionQuery(sessionArg);
  const isServerWorking = session.data?.segments.some(isProcessing) ?? false;
  const [fetchSession] = useLazyGetVoiceSessionQuery();
  const [addSegment] = useAddSegmentMutation();
  const [retrySegment] = useRetrySegmentMutation();
  const [getAudio] = useGetSegmentAudioMutation();

  const [isSending, setIsSending] = useState(false);
  // Kept when sending fails, so a bad connection doesn't lose what was said.
  const [unsent, setUnsent] = useState<Recording | null>(null);
  const [error, setError] = useState<string>();
  const [view, setView] = useState<TranscriptView>('both');
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  const canDictate = isEnabled && practice.data?.features.voice !== false;
  const fail = (caught: unknown) => setError(messageFor(toApiError(caught)));

  const send = async (recording: Recording) => {
    setError(undefined);
    setIsSending(true);
    keepRecording(recording.id, recording.audio);
    try {
      const id = await ensureDraft();
      // Parts are numbered in order; ask for the latest just before.
      const current = await fetchSession(id).unwrap();
      await addSegment({
        prescriptionId: id,
        body: {
          seq: nextSeq(current),
          durationMs: recording.durationMs,
          contentType: recording.contentType,
          audioBase64: await readAsBase64(recording.audio),
        },
      }).unwrap();
      setUnsent(null);
      forgetRecording(recording.id);
    } catch (caught) {
      setUnsent(recording);
      fail(caught);
    } finally {
      setIsSending(false);
    }
  };

  const start = async () => {
    setError(undefined);
    const started = await recorder.start();
    if (started === 'denied') microphone.markDenied();
    if (started === 'recording') microphone.markGranted();
    if (started === 'unavailable') setError(voiceCopy.unavailable);
  };

  const stop = async () => {
    const stopped = await recorder.stop();
    if (stopped.kind === 'saved') await send(stopped.recording);
    else if (stopped.kind === 'tooShort') setError(voiceCopy.errors.tooShort);
  };

  const toggle = () => {
    if (!canDictate || isSending) return;
    if (recorder.isRecording) stop();
    else start();
  };
  useHotkey(Hotkeys.dictate, toggle, canDictate);

  // Signing out mid-part must not leave patient audio in the browser.
  useEffect(() => registerSignOutTask(recorder.discard), [recorder.discard]);

  // A part that runs too long stops and sends itself.
  useEffect(() => {
    if (recorder.isRecording && recorder.elapsedMs >= MAX_RECORDING_MS) stop();
    // stop is recreated each render; only the elapsed time matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.isRecording, recorder.elapsedMs]);

  const parts = toPartItems(session.data);
  const selected = parts.find((part) => part.id === selectedPartId) ?? null;
  const isWorking = isSending || isServerWorking;

  return {
    canDictate,
    microphone,
    isBlocked: microphone.permission === 'denied',
    isRecording: recorder.isRecording,
    isSending,
    level,
    elapsed: formatCountdown(recorder.elapsedMs / MS_PER_SECOND),
    /** The part being recorded now, numbered after the ones sent. */
    currentPart: nextSeq(session.data),
    toggle,
    error,
    resend: unsent ? () => send(unsent) : undefined,
    parts,
    view,
    setView,
    selectedPartId,
    selectPart: (id: string) =>
      setSelectedPartId((current) => (current === id ? null : id)),
    /** The lines the chosen part filled, to highlight them. */
    highlightSpanIds: selected?.spanIds ?? [],
    /** The lines the newest part filled, marked "New". */
    newSpanIds: newestSpanIds(session.data),
    retry: (segmentId: string) => {
      if (!prescriptionId) return;
      setError(undefined);
      retrySegment({ prescriptionId, segmentId }).unwrap().catch(fail);
    },
    play: async (segmentId: string) => {
      try {
        const { url } = await getAudio(segmentId).unwrap();
        await new Audio(url).play();
      } catch (caught) {
        fail(caught);
      }
    },
    /** Approving now would race the lines still being written in. */
    isWorking,
    workingNote: isWorking ? voiceCopy.working : null,
    dictatedParts: parts.filter((part) => part.state === 'applied').length,
  };
}

export type Dictation = ReturnType<typeof useDictation>;
