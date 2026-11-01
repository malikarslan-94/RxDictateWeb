import {
  Banner,
  Button,
  IconButton,
  Segmented,
  Spinner,
  StatusChip,
} from '@/ui';
import { cx } from '@/utils/classes';

import { voiceCopy } from '../copy';
import type { Dictation } from '../hooks/useDictation';
import type { TranscriptView } from '../types';

const VIEWS: { label: string; value: TranscriptView }[] = [
  { label: voiceCopy.views.both, value: 'both' },
  { label: voiceCopy.views.original, value: 'original' },
  { label: voiceCopy.views.english, value: 'english' },
];

export type WhatYouSaidProps = {
  dictation: Dictation;
};

/**
 * Every part dictated so far: what was heard, its English, and where it
 * went. Clicking a part highlights the lines it filled.
 */
export function WhatYouSaid({ dictation }: WhatYouSaidProps) {
  const showOriginal = dictation.view !== 'english';
  const showEnglish = dictation.view !== 'original';

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-section">{voiceCopy.whatYouSaid}</h2>
      <Segmented
        fullWidth
        size="small"
        label={voiceCopy.whatYouSaid}
        options={VIEWS}
        value={dictation.view}
        onChange={dictation.setView}
      />
      <p className="text-meta text-ink-secondary">{voiceCopy.partsHint}</p>

      {dictation.error ? (
        <Banner
          tone="danger"
          action={
            dictation.resend ? (
              <Button
                label={voiceCopy.sendAgain}
                size="small"
                variant="secondary"
                onClick={dictation.resend}
              />
            ) : undefined
          }
        >
          {dictation.error}
        </Banner>
      ) : null}

      {dictation.parts.length === 0 && !dictation.isRecording ? (
        <p className="text-body text-ink-secondary">{voiceCopy.noParts}</p>
      ) : null}

      {dictation.parts.map((part) => (
        <div
          key={part.id}
          role="button"
          tabIndex={0}
          aria-pressed={dictation.selectedPartId === part.id}
          onClick={() => dictation.selectPart(part.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') dictation.selectPart(part.id);
          }}
          className={cx(
            'cursor-pointer rounded-card border bg-surface p-4 text-left transition-colors',
            dictation.selectedPartId === part.id
              ? 'border-primary ring-1 ring-primary'
              : 'border-border hover:border-primary',
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-meta text-ink-secondary">{part.title}</p>
            {part.hasAudio ? (
              <IconButton
                icon="volume"
                label={voiceCopy.play(part.seq)}
                size="small"
                tone="plain"
                onClick={(event) => {
                  event.stopPropagation();
                  dictation.play(part.id);
                }}
              />
            ) : null}
          </div>
          {showOriginal && part.original ? (
            <p className="mt-1 text-body font-bold">{part.original}</p>
          ) : null}
          {showEnglish && part.english ? (
            <p className="mt-1 text-meta text-ink-secondary">{part.english}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {part.sections.map((section) => (
              <StatusChip key={section} label={section} tone="active" />
            ))}
            {part.state === 'processing' ? (
              <span className="flex items-center gap-2 text-meta text-ink-secondary">
                <Spinner className="size-3.5 text-primary" />
                {part.note}
              </span>
            ) : null}
            {part.state !== 'processing' && part.note ? (
              <span
                className={cx(
                  'text-meta',
                  part.state === 'failed'
                    ? 'text-danger'
                    : 'text-ink-secondary',
                )}
              >
                {part.note}
              </span>
            ) : null}
            {part.canRetry ? (
              <Button
                label={voiceCopy.retry}
                size="small"
                variant="secondary"
                onClick={(event) => {
                  event.stopPropagation();
                  dictation.retry(part.id);
                }}
              />
            ) : null}
          </div>
        </div>
      ))}

      {dictation.isRecording ? (
        <div className="rounded-card border-2 border-primary bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-meta text-ink-secondary">
              {voiceCopy.partNow(dictation.currentPart)}
            </p>
            <StatusChip label={voiceCopy.listening} tone="active" solid />
          </div>
        </div>
      ) : null}
    </section>
  );
}
