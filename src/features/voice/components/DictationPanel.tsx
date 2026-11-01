import { Link } from 'react-router';

import { Routes } from '@/constants/routes';
import { Banner, Button, Icon, Kbd, Spinner } from '@/ui';
import { cx } from '@/utils/classes';

import { voiceCopy } from '../copy';
import type { Dictation } from '../hooks/useDictation';
import { Waveform } from './Waveform';

export type DictationPanelProps = {
  dictation: Dictation;
};

/**
 * The dark recorder above "What you said": Dictate, then the live part with
 * its timer and waveform, and Stop. A blocked microphone shows how to allow
 * it instead, and typing carries on meanwhile.
 */
export function DictationPanel({ dictation }: DictationPanelProps) {
  if (dictation.isBlocked) {
    return (
      <Banner tone="warning">
        <strong>{voiceCopy.blocked.title}</strong> {voiceCopy.blocked.body}
      </Banner>
    );
  }

  return (
    <section className="rounded-card bg-console p-5 text-console-ink">
      {dictation.isRecording ? (
        <>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-body font-bold">
              <span className="size-2 animate-pulse rounded-full bg-danger" />
              {voiceCopy.recordingPart(dictation.currentPart)}
            </p>
            <p className="text-title tabular-nums">{dictation.elapsed}</p>
          </div>
          <Waveform level={dictation.level} />
          <div className="flex items-center gap-3">
            <Button
              label={voiceCopy.stop}
              fullWidth
              icon={<Icon name="stop" className="size-4" />}
              onClick={dictation.toggle}
              aria-label={voiceCopy.stopLabel}
            />
            <Kbd keys={voiceCopy.shortcut} inverse />
          </div>
          <p className="mt-3 text-meta text-console-muted">
            {voiceCopy.recordingHint}
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={voiceCopy.startLabel}
              disabled={!dictation.canDictate || dictation.isSending}
              onClick={dictation.toggle}
              className={cx(
                'flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-ink-on-primary ring-8 ring-primary/20 transition-transform hover:scale-105',
                'disabled:cursor-not-allowed disabled:bg-disabled disabled:ring-0',
              )}
            >
              {dictation.isSending ? (
                <Spinner className="size-6" />
              ) : (
                <Icon name="mic" className="size-7" />
              )}
            </button>
            <div>
              <p className="text-title">
                {dictation.isSending ? voiceCopy.sending : voiceCopy.dictate}
              </p>
              <p className="flex items-center gap-2 text-meta text-console-muted">
                {voiceCopy.clickOrPress}{' '}
                <Kbd keys={voiceCopy.shortcut} inverse />
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-console-muted/40 px-4 py-2 text-meta">
            <Icon name="mic" className="size-3.5" />
            <span className="min-w-0 flex-1 truncate">
              {dictation.microphone.label}
            </span>
            <Link
              to={Routes.settingsVoice}
              className="font-bold underline hover:text-primary-soft"
            >
              {voiceCopy.change}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
