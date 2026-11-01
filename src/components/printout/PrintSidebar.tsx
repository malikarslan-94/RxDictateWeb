import type { ReactNode } from 'react';

import { printCopy } from '@/constants/printCopy';
import type { Printout } from '@/types/printout';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="mb-1 text-print-label text-paper-accent uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** The left column: what was found, what to test, when to come back. */
export function PrintSidebar({ printout }: { printout: Printout }) {
  const sections = printCopy.sections;
  return (
    <aside className="w-print-sidebar shrink-0 border-r border-paper-line py-4 pr-4">
      {printout.vitals.length > 0 ? (
        <Block title={printCopy.vitalsTitle}>
          {printout.vitals.map((vital) => (
            <p key={vital.key} className="text-print-small">
              {vital.label} {vital.value}
            </p>
          ))}
        </Block>
      ) : null}
      {printout.diagnosis.length > 0 ? (
        <Block title={sections.diagnosis}>
          {printout.diagnosis.map((line, index) => (
            <p
              key={line}
              className={index === 0 ? 'text-print-strong' : 'text-print-small'}
            >
              {line}
            </p>
          ))}
        </Block>
      ) : null}
      {printout.complaints.length > 0 ? (
        <Block title={sections.complaints}>
          {printout.complaints.map((line) => (
            <p key={line} className="text-print-small">
              {line}
            </p>
          ))}
        </Block>
      ) : null}
      {printout.investigations.length > 0 ? (
        <Block title={sections.investigations}>
          {printout.investigations.map((line) => (
            <p key={line} className="flex gap-1.5 text-print-small">
              <span className="mt-0.5 inline-block size-2 shrink-0 border border-paper-ink" />
              {line}
            </p>
          ))}
        </Block>
      ) : null}
      {printout.followUp ? (
        <Block title={sections.followUp}>
          <p className="text-print-strong">{printout.followUp.date}</p>
          {printout.followUp.note ? (
            <p className="text-print-small">{printout.followUp.note}</p>
          ) : null}
        </Block>
      ) : null}
    </aside>
  );
}
