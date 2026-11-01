import { useCallback, useEffect, useRef, useState } from 'react';

import {
  MIN_RECORDING_MS,
  RECORDING_BITS_PER_SECOND,
  RECORDING_FORMATS,
} from '../constants';
import type { RecorderStart, RecorderStop } from '../types';
import { canRecordHere } from './useMicrophone';

/** The recording timer moves on this often. */
const TICK_MS = 250;

type Live = {
  stream: MediaStream;
  recorder: MediaRecorder;
  chunks: Blob[];
  startedAt: number;
  format: (typeof RECORDING_FORMATS)[number];
};

function pickFormat() {
  return RECORDING_FORMATS.find((format) =>
    MediaRecorder.isTypeSupported(format.mimeType),
  );
}

/**
 * The microphone through the browser: ask for it, record a part, and hand
 * back the audio. Every stop says what happened, so a part is never lost
 * without a word. `stream` is live while recording, for the waveform.
 */
export function useRecorder(deviceId: string) {
  const live = useRef<Live | null>(null);
  const isBusy = useRef(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const release = useCallback(() => {
    live.current?.stream.getTracks().forEach((track) => track.stop());
    live.current = null;
    setStream(null);
  }, []);

  useEffect(() => {
    if (!stream) return;
    const timer = setInterval(() => {
      if (live.current) setElapsedMs(Date.now() - live.current.startedAt);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [stream]);

  const open = (id: string) =>
    navigator.mediaDevices.getUserMedia({
      audio: id ? { deviceId: { exact: id } } : true,
    });

  const start = async (): Promise<RecorderStart> => {
    if (isBusy.current || live.current) return 'busy';
    const format = canRecordHere() ? pickFormat() : undefined;
    if (!format) return 'unavailable';
    isBusy.current = true;
    try {
      let media: MediaStream;
      try {
        media = await open(deviceId);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          return 'denied';
        }
        // The chosen microphone was unplugged: fall back to the default one.
        media = await open('');
      }
      const recorder = new MediaRecorder(media, {
        mimeType: format.mimeType,
        audioBitsPerSecond: RECORDING_BITS_PER_SECOND,
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.start();
      live.current = {
        stream: media,
        recorder,
        chunks,
        startedAt: Date.now(),
        format,
      };
      setElapsedMs(0);
      setStream(media);
      return 'recording';
    } catch {
      return 'unavailable';
    } finally {
      isBusy.current = false;
    }
  };

  const stop = (): Promise<RecorderStop> => {
    const current = live.current;
    if (isBusy.current || !current) return Promise.resolve({ kind: 'busy' });
    isBusy.current = true;
    return new Promise((resolve) => {
      current.recorder.onstop = () => {
        const durationMs = Date.now() - current.startedAt;
        release();
        isBusy.current = false;
        if (durationMs < MIN_RECORDING_MS) {
          resolve({ kind: 'tooShort' });
          return;
        }
        resolve({
          kind: 'saved',
          recording: {
            id: crypto.randomUUID(),
            audio: new Blob(current.chunks, { type: current.format.mimeType }),
            durationMs,
            contentType: current.format.contentType,
          },
        });
      };
      current.recorder.stop();
    });
  };

  /** At sign-out: stop without keeping anything. */
  const discard = useCallback(() => {
    const current = live.current;
    if (current) {
      current.recorder.onstop = null;
      if (current.recorder.state !== 'inactive') current.recorder.stop();
    }
    release();
  }, [release]);

  // Leaving the page mid-part mustn't leave the microphone on.
  useEffect(() => discard, [discard]);

  return {
    isRecording: stream !== null,
    elapsedMs,
    stream,
    start,
    stop,
    discard,
  };
}
