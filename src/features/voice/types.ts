import type { AudioType } from './constants';

/** A finished part in this tab's memory, not yet sent. */
export type Recording = {
  id: string;
  audio: Blob;
  durationMs: number;
  contentType: (typeof AudioType)[keyof typeof AudioType];
};

/** How a press of Dictate went. `busy`: the last press is still being handled. */
export type RecorderStart = 'recording' | 'denied' | 'unavailable' | 'busy';

/** How a press of Stop went. Only `saved` has anything to send. */
export type RecorderStop =
  | { kind: 'saved'; recording: Recording }
  | { kind: 'tooShort' }
  | { kind: 'busy' };

/** One dictated part, as "What you said" shows it. */
export type PartItem = {
  id: string;
  seq: number;
  /** "Part 2 · 0:09". */
  title: string;
  state: 'processing' | 'applied' | 'failed';
  /** Why it failed, or that nothing was heard; empty otherwise. */
  note: string;
  /** What the doctor said, as heard. */
  original: string;
  /** The same in English. */
  english: string;
  /** Where it went: "Diagnosis", "Medicine ×2". */
  sections: string[];
  /** The spans it filled lines from, for highlighting them. */
  spanIds: string[];
  canRetry: boolean;
  hasAudio: boolean;
};

/** Which language "What you said" shows. */
export type TranscriptView = 'both' | 'original' | 'english';
