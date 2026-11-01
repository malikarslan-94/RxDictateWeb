import { useEffect, useState } from 'react';

/** Loudness is read this often; a meter needs no more. */
const LEVEL_EVERY_MS = 80;
/** Normal speech sits around this RMS; it fills the meter. */
const SPEECH_RMS = 0.25;

/**
 * How loud the microphone hears, 0 to 1, while `stream` is live: for the
 * level meter and the waveform. Stops listening when the stream does.
 */
export function useAudioLevel(stream: MediaStream | null): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!stream) {
      setLevel(0);
      return;
    }
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    const timer = setInterval(() => {
      analyser.getFloatTimeDomainData(samples);
      const rms = Math.sqrt(
        samples.reduce((sum, sample) => sum + sample * sample, 0) /
          samples.length,
      );
      setLevel(Math.min(1, rms / SPEECH_RMS));
    }, LEVEL_EVERY_MS);
    return () => {
      clearInterval(timer);
      context.close().catch(() => undefined);
    };
  }, [stream]);

  return level;
}
