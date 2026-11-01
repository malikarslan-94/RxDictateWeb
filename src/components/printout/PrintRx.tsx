import { printCopy } from '@/constants/printCopy';
import type { Printout } from '@/types/printout';

export type PrintRxProps = {
  printout: Printout;
  showUrdu: boolean;
};

/** "Rx", the numbered medicines with their dose lines, then the advice. */
export function PrintRx({ printout, showUrdu }: PrintRxProps) {
  const lists: [string, string[]][] = [
    [printCopy.sections.avoid, printout.avoid],
    [printCopy.sections.eatMore, printout.eatMore],
  ];

  return (
    <div className="flex-1 py-4 pl-5">
      <p className="mb-3 text-print-rx text-paper-accent italic">
        {printCopy.rx}
      </p>

      <ol>
        {printout.medicines.map((medicine, index) => (
          <li key={medicine.id} className="border-b border-paper-line py-2">
            <div className="flex gap-4">
              <p className="flex-1 text-print-strong">
                {index + 1}. {medicine.title}
              </p>
              <p className="text-print-strong">{medicine.dose}</p>
              <p className="min-w-16 text-right text-print-strong">
                {medicine.duration}
              </p>
            </div>
            <p className="text-print-small text-paper-muted">{medicine.en}</p>
            {showUrdu && medicine.ur ? (
              <p dir="rtl" lang="ur" className="font-urdu text-print-urdu">
                {medicine.ur}
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      {lists.map(([title, lines]) =>
        lines.length > 0 ? (
          <section key={title} className="mt-3">
            <h3 className="mb-0.5 text-print-label text-paper-accent uppercase">
              {title}
            </h3>
            {lines.map((line) => (
              <p key={line} className="text-print-small">
                {line}
              </p>
            ))}
          </section>
        ) : null,
      )}

      {printout.advice.length > 0 ? (
        <section className="mt-3">
          <h3 className="mb-0.5 text-print-label text-paper-accent uppercase">
            {printCopy.sections.advice}
          </h3>
          <ul>
            {printout.advice.map((line) => (
              <li key={line} className="text-print-small">
                • {line}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
