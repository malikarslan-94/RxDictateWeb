import { Icon, IconButton } from '@/ui';

import type { UploadReport } from '../hooks/useUploadReport';

export type PageTilesProps = {
  pages: UploadReport['pages'];
  /** While sending, pages stay as they are. */
  disabled?: boolean;
};

/** The pages chosen so far: a thumbnail per photo, a tile per PDF. */
export function PageTiles({ pages, disabled = false }: PageTilesProps) {
  return (
    <ul className="grid grid-cols-4 gap-3">
      {pages.map((page) => (
        <li key={page.key} className="relative">
          {page.previewUrl ? (
            <img
              src={page.previewUrl}
              alt={page.label}
              className="aspect-3/4 w-full rounded-sm border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-3/4 w-full flex-col items-center justify-center gap-2 rounded-sm border border-border bg-neutral-soft p-2 text-center">
              <Icon name="file" className="size-6 text-primary-strong" />
              <span className="line-clamp-2 text-chip break-all text-ink-secondary">
                {page.name}
              </span>
            </div>
          )}
          <span className="mt-1 block text-chip text-ink-secondary">
            {page.label}
          </span>
          <IconButton
            icon="close"
            label={page.removeLabel}
            size="small"
            tone="soft"
            disabled={disabled}
            onClick={page.remove}
            className="absolute top-1 right-1"
          />
        </li>
      ))}
    </ul>
  );
}
