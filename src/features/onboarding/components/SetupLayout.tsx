import type { ReactNode } from 'react';

import { PrintPreview } from '@/components';
import { clinicCopy } from '@/features/clinic';
import type { Printout } from '@/types/printout';
import { BrandMark, TextLink, Wordmark } from '@/ui';

import type { SetupStep } from '../constants';
import { onboardingCopy } from '../copy';
import { useSetupShell } from '../hooks/useSetupShell';
import { SetupStepper } from './SetupStepper';

/** The printout settings a setup preview prints with. */
const PREVIEW_OPTIONS = {
  header: 'letterhead',
  language: 'en_ur',
  topMarginMm: 0,
  copies: 1,
} as const;

export type SetupLayoutProps = {
  step: SetupStep;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** The page with what's been typed so far, beside the form. */
  preview?: Printout;
};

/** Setup's frame: who's signed in, the steps, the form, and the preview. */
export function SetupLayout({
  step,
  title,
  subtitle,
  children,
  preview,
}: SetupLayoutProps) {
  const shell = useSetupShell(step);
  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between bg-surface px-10 py-4">
        <div className="flex items-center gap-3">
          <BrandMark />
          <Wordmark />
        </div>
        <p className="text-body text-ink-secondary">
          {shell.signedInAs} ·{' '}
          <TextLink
            label={onboardingCopy.notYou}
            underline
            onClick={shell.notYou}
          />
        </p>
      </header>

      <div className="mx-auto flex max-w-7xl gap-10 px-10 py-10">
        <aside className="w-56 shrink-0">
          <SetupStepper steps={shell.steps} />
        </aside>
        <main className="max-w-xl min-w-0 flex-1">
          <h1 className="text-screen-title">{title}</h1>
          <p className="mt-2 mb-6 text-lead text-ink-secondary">{subtitle}</p>
          {children}
        </main>
        {preview ? (
          <aside className="hidden w-96 shrink-0 xl:block">
            <p className="mb-3 text-label">{clinicCopy.preview.title}</p>
            <div className="border border-border">
              <PrintPreview printout={preview} options={PREVIEW_OPTIONS} />
            </div>
            <p className="mt-3 text-meta text-ink-secondary">
              {clinicCopy.preview.note}
            </p>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
