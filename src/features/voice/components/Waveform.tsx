/** Bars across the recorder; their heights follow the voice. */
const BARS = 24;
/** A resting bar, so silence still reads as "listening". */
const REST = 0.12;

export type WaveformProps = {
  /** 0 to 1. */
  level: number;
};

/** A live waveform from the microphone's loudness. */
export function Waveform({ level }: WaveformProps) {
  return (
    <div
      aria-hidden
      className="my-5 flex h-12 items-center justify-center gap-1"
    >
      {Array.from({ length: BARS }, (_, index) => {
        // A soft hump across the bars, so it reads as a voice and not a meter.
        const shape = Math.sin(((index + 1) / (BARS + 1)) * Math.PI);
        const height = Math.max(REST, level * shape);
        return (
          <span
            key={index}
            className="w-1 rounded-full bg-console-ink transition-height"
            style={{ height: `${height * 100}%` }}
          />
        );
      })}
    </div>
  );
}
