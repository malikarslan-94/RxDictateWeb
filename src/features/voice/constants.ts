import { addSegmentBodySchema, segmentStatusSchema } from '@/contract';

/** `SegmentStatus.uploaded`, `.transcribed`, `.applied`, `.failed`. */
export const SegmentStatus = segmentStatusSchema.enum;

/** What the server takes, by name: `AudioType['audio/webm']`… */
export const AudioType = addSegmentBodySchema.shape.contentType.enum;

/**
 * What the browser records in, best first: Opus in WebM (Chrome, Edge,
 * Firefox), AAC in MP4 (Safari). Each maps to a type the server takes.
 */
export const RECORDING_FORMATS = [
  { mimeType: 'audio/webm;codecs=opus', contentType: AudioType['audio/webm'] },
  { mimeType: 'audio/webm', contentType: AudioType['audio/webm'] },
  { mimeType: 'audio/mp4', contentType: AudioType['audio/mp4'] },
] as const;

/** Speech needs no more; it keeps a long part small to upload. */
export const RECORDING_BITS_PER_SECOND = 64_000;

/** Shorter than this holds no words, and Android may write no audio at all. */
export const MIN_RECORDING_MS = 1000;

/** One recording stops itself after this long, so no upload gets too big. */
export const MAX_RECORDING_MS = 5 * 60 * 1000;

export const MS_PER_SECOND = 1000;

/** How long the Settings microphone test records. */
export const MIC_TEST_MS = 5000;

/** Under this level, speech is too quiet to be heard well. */
export const QUIET_LEVEL = 0.15;
