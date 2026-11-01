import { printCopy } from '@/constants/printCopy';
import type { PrintOptions, Printout } from '@/types/printout';

import { PrintLetterhead } from './PrintLetterhead';
import { PrintRx } from './PrintRx';
import { PrintSidebar } from './PrintSidebar';

export type PrintPageProps = {
  printout: Printout;
  options: PrintOptions;
};

/**
 * One A4 prescription, laid out like the server's PDF: letterhead, patient
 * bar, the left column of findings, the Rx, and the signature. The same page
 * is shown on screen (scaled by PrintPreview) and sent to the printer.
 */
export function PrintPage({ printout, options }: PrintPageProps) {
  const { patient } = printout;
  const isPreprinted = options.header === 'preprinted';

  return (
    <article
      className="relative flex h-a4-height w-a4-width flex-col overflow-hidden bg-paper px-a4-margin pb-a4-margin text-print-body text-paper-ink"
      // The clinic's own pad already has the header: leave that much paper blank.
      style={{ paddingTop: `${options.topMarginMm}mm` }}
    >
      {isPreprinted ? null : (
        <>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-paper-accent" />
          <PrintLetterhead printout={printout} />
        </>
      )}

      <div className="mt-3 grid grid-cols-4 border-y border-paper-line py-2">
        {[
          [printCopy.patient, patient.name],
          [printCopy.ageSex, patient.ageSex],
          [printCopy.mrNo, patient.mrNo],
          [printCopy.date, patient.date],
        ].map(([label, value], index) => (
          <div key={label} className={index === 3 ? 'text-right' : undefined}>
            <p className="text-print-label text-paper-muted uppercase">
              {label}
            </p>
            <p className="text-print-strong">{value}</p>
          </div>
        ))}
      </div>

      {printout.allergy ? (
        <p className="mt-2 self-end rounded-xs border border-paper-danger px-2 py-0.5 text-print-label text-paper-danger uppercase">
          {printout.allergy}
        </p>
      ) : null}

      <div className="mt-2 flex flex-1 border-t border-paper-line">
        <PrintSidebar printout={printout} />
        <PrintRx printout={printout} showUrdu={options.language === 'en_ur'} />
      </div>

      <footer className="flex items-end justify-between border-t border-paper-line pt-3">
        <div className="flex items-center gap-3">
          <span className="flex size-print-qr items-center justify-center border border-dashed border-paper-muted text-print-label text-paper-muted">
            {printCopy.qr}
          </span>
          <div>
            {printout.rxNumber ? (
              <p className="text-print-strong">
                {printCopy.rxId(printout.rxNumber)}
              </p>
            ) : null}
            <p className="text-print-small text-paper-muted">
              {printout.isDraft
                ? printCopy.notYetValid
                : printCopy.approvedElectronically}
            </p>
          </div>
        </div>
        <div className="min-w-48 text-center">
          <p className="border-b border-paper-ink pb-1 text-print-name font-normal text-paper-accent italic">
            {printout.signature}
          </p>
          <p className="pt-1 text-print-small font-bold">{printout.signedBy}</p>
        </div>
      </footer>

      {printout.isDraft ? (
        <p className="pointer-events-none absolute inset-0 flex -rotate-30 items-center justify-center text-display text-paper-ink opacity-5">
          {printCopy.draftMark}
        </p>
      ) : null}
    </article>
  );
}
