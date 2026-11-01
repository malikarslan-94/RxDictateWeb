import { useRef } from 'react';

import { FieldError } from '@/components';
import { Button, Icon } from '@/ui';
import { cx } from '@/utils/classes';

import { reportsCopy } from '../copy';
import type { UploadReport } from '../hooks/useUploadReport';
import { PageTiles } from './PageTiles';

const copy = reportsCopy.upload;

/** A report's pages: chosen from the computer or dropped here. */
export function PagePicker({ upload }: { upload: UploadReport }) {
  const input = useRef<HTMLInputElement>(null);
  const { picker } = upload;

  return (
    <div>
      <p className="text-label">{copy.pages}</p>
      <p className="mt-1 mb-3 text-meta text-ink-secondary">
        {upload.pagesHint}
      </p>
      <div
        {...picker.dropTarget}
        className={cx(
          'flex flex-col gap-4 rounded-card border border-dashed p-4 transition-colors',
          picker.isDragging
            ? 'border-primary bg-primary-tint'
            : 'border-border',
        )}
      >
        {upload.pages.length > 0 ? (
          <PageTiles pages={upload.pages} disabled={upload.isSending} />
        ) : null}
        {upload.canAddPages ? (
          <div className="flex items-center gap-3">
            <Button
              label={copy.choose}
              variant="secondary"
              size="small"
              icon={<Icon name="upload" className="size-4" />}
              disabled={upload.isSending}
              onClick={() => input.current?.click()}
            />
            <span className="text-meta text-ink-secondary">{copy.drop}</span>
            <input
              ref={input}
              type="file"
              multiple
              accept={picker.accept}
              onChange={picker.onChosen}
              tabIndex={-1}
              aria-hidden
              className="hidden"
            />
          </div>
        ) : null}
      </div>
      {upload.refusals.map((refusal, index) => (
        <FieldError key={index} message={refusal} />
      ))}
      <FieldError message={upload.pagesError} />
    </div>
  );
}
