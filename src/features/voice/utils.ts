import type { SegmentView, VoiceSessionView } from '@/contract';
import { formatCountdown } from '@/utils/time';

import { MS_PER_SECOND, SegmentStatus } from './constants';
import { voiceCopy } from './copy';
import type { PartItem } from './types';

/** The number the next part must carry: one past the highest so far. */
export function nextSeq(session: VoiceSessionView | undefined): number {
  const segments = session?.segments ?? [];
  return segments.reduce((max, segment) => Math.max(max, segment.seq), 0) + 1;
}

/** Uploaded or transcribed, but not yet added to the draft. */
export function isProcessing(segment: SegmentView): boolean {
  return (
    segment.status === SegmentStatus.uploaded ||
    segment.status === SegmentStatus.transcribed
  );
}

export function countApplied(session: VoiceSessionView | undefined): number {
  const segments = session?.segments ?? [];
  return segments.filter((segment) => segment.status === SegmentStatus.applied)
    .length;
}

/** "Diagnosis", "Medicine ×2": where a part's lines went, in order. */
function sectionsOf(segment: SegmentView): string[] {
  const counts = new Map<SegmentView['ops'][number]['section'], number>();
  segment.ops.forEach((op) =>
    counts.set(op.section, (counts.get(op.section) ?? 0) + 1),
  );
  return [...counts].map(([section, count]) =>
    voiceCopy.sectionCount(voiceCopy.sections[section], count),
  );
}

function toPartItem(segment: SegmentView): PartItem {
  const dictated = segment.spans.filter((span) => span.isDictation);
  const base = {
    id: segment.id,
    seq: segment.seq,
    title: voiceCopy.partTitle(
      segment.seq,
      formatCountdown(segment.audio.durationMs / MS_PER_SECOND),
    ),
    original: segment.transcript,
    english: dictated.map((span) => span.english).join(' '),
    sections: sectionsOf(segment),
    spanIds: segment.spans.map((span) => span.id),
    canRetry: false,
    hasAudio: segment.audio.hasAudio,
  };
  if (segment.status === SegmentStatus.failed) {
    return {
      ...base,
      state: 'failed',
      note: segment.error ?? voiceCopy.status.failed,
      canRetry: segment.audio.hasAudio,
    };
  }
  if (segment.status === SegmentStatus.applied) {
    return {
      ...base,
      state: 'applied',
      note: segment.ops.length > 0 ? '' : voiceCopy.status.nothingAdded,
    };
  }
  return { ...base, state: 'processing', note: voiceCopy.status.processing };
}

/** The draft's parts in the order they were dictated. */
export function toPartItems(session: VoiceSessionView | undefined): PartItem[] {
  return [...(session?.segments ?? [])]
    .sort((a, b) => a.seq - b.seq)
    .map(toPartItem);
}

/** The spans the newest applied part filled, so its lines can say "New". */
export function newestSpanIds(session: VoiceSessionView | undefined): string[] {
  const applied = (session?.segments ?? [])
    .filter((segment) => segment.status === SegmentStatus.applied)
    .sort((a, b) => b.seq - a.seq);
  return applied[0]?.spans.map((span) => span.id) ?? [];
}
