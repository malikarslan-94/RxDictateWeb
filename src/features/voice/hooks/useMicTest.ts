import { useEffect, useRef, useState } from 'react';

import { MIC_TEST_MS, QUIET_LEVEL, RECORDING_FORMATS } from '../constants';
import { useAudioLevel } from './useAudioLevel';
import { canRecordHere, useMicrophone } from './useMicrophone';

/**
 * Settings › Voice and microphone: listen on the chosen microphone for the
 * level meter, record a short test, and play it back.
 */
export function useMicTest() {
  const microphone = useMicrophone();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const level = useAudioLevel(stream);
  const peak = useRef(0);
  peak.current = Math.max(peak.current, level);

  // Listen while the page is open, on whichever microphone is chosen.
  useEffect(() => {
    if (!canRecordHere()) return;
    let media: MediaStream | null = null;
    let isCancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        audio: microphone.deviceId
          ? { deviceId: { exact: microphone.deviceId } }
          : true,
      })
      .then((opened) => {
        if (isCancelled) {
          opened.getTracks().forEach((track) => track.stop());
          return;
        }
        media = opened;
        setStream(opened);
        microphone.markGranted();
      })
      .catch(() => microphone.markDenied());
    return () => {
      isCancelled = true;
      media?.getTracks().forEach((track) => track.stop());
      setStream(null);
    };
    // The microphone object changes every render; only the device matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphone.deviceId]);

  useEffect(
    () => () => {
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    },
    [playbackUrl],
  );

  const test = () => {
    const format = RECORDING_FORMATS.find((item) =>
      MediaRecorder.isTypeSupported(item.mimeType),
    );
    if (!stream || !format || isTesting) return;
    const recorder = new MediaRecorder(stream, { mimeType: format.mimeType });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = () => {
      setPlaybackUrl(
        URL.createObjectURL(new Blob(chunks, { type: format.mimeType })),
      );
      setIsTesting(false);
    };
    peak.current = 0;
    setIsTesting(true);
    recorder.start();
    setTimeout(() => recorder.stop(), MIC_TEST_MS);
  };

  return {
    microphone,
    isBlocked: microphone.permission === 'denied',
    isUnavailable: microphone.permission === 'unavailable',
    level,
    isQuiet: stream !== null && peak.current > 0 && peak.current < QUIET_LEVEL,
    isTesting,
    test,
    canPlayBack: playbackUrl !== null && !isTesting,
    playBack: () => {
      if (playbackUrl) new Audio(playbackUrl).play().catch(() => undefined);
    },
  };
}
