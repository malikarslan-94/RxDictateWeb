import type { Ref } from 'react';
import { createPortal } from 'react-dom';

import type { PrintOptions, Printout } from '@/types/printout';

import { PrintPage } from './PrintPage';

export type PrintDocumentProps = {
  printout: Printout;
  options: PrintOptions;
  /** The first copy's page: what "PDF" saves. */
  pageRef?: Ref<HTMLElement>;
};

/**
 * What the printer gets: `copies` pages, one per sheet, outside the app.
 * Hidden on screen; on paper it's the only thing showing (theme.css).
 */
export function PrintDocument({
  printout,
  options,
  pageRef,
}: PrintDocumentProps) {
  return createPortal(
    <div className="print-only">
      {Array.from({ length: Math.max(1, options.copies) }, (_, index) => (
        <div key={index} className="break-after-page">
          <PrintPage
            printout={printout}
            options={options}
            ref={index === 0 ? pageRef : undefined}
          />
        </div>
      ))}
    </div>,
    document.body,
  );
}
