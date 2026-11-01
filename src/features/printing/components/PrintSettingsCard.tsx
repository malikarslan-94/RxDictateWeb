import { Card, Input, Segmented } from '@/ui';

import { printingCopy } from '../copy';
import type { PrintSettings } from '../hooks/usePrintSettings';

const copy = printingCopy.settings;

/** Letterhead or pre-printed, languages, top margin, copies: this computer's. */
export function PrintSettingsCard({ settings }: { settings: PrintSettings }) {
  const { options } = settings;
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-section">{copy.title}</h2>
      <div>
        <p className="mb-2 text-label">{copy.header}</p>
        <Segmented
          fullWidth
          label={copy.header}
          options={[
            { label: copy.letterhead, value: 'letterhead' },
            { label: copy.preprinted, value: 'preprinted' },
          ]}
          value={options.header}
          onChange={settings.setHeader}
        />
        <p className="mt-2 text-meta text-ink-secondary">
          {copy.preprintedHint}
        </p>
      </div>
      <div>
        <p className="mb-2 text-label">{copy.language}</p>
        <Segmented
          fullWidth
          label={copy.language}
          options={[
            { label: copy.english, value: 'en' },
            { label: copy.bilingual, value: 'en_ur' },
          ]}
          value={options.language}
          onChange={settings.setLanguage}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={copy.topMargin}
          type="number"
          inputMode="numeric"
          min={0}
          value={options.topMarginMm}
          onChange={(event) => settings.setTopMargin(event.target.value)}
          trailing={
            <span className="text-meta text-ink-secondary">{copy.mm}</span>
          }
        />
        <Input
          label={copy.copies}
          type="number"
          inputMode="numeric"
          min={1}
          value={options.copies}
          onChange={(event) => settings.setCopies(event.target.value)}
        />
      </div>
      <p className="text-meta text-ink-secondary">{copy.saved}</p>
    </Card>
  );
}
