import { Avatar, StatusChip, Td, Tr } from '@/ui';
import { cx } from '@/utils/classes';

import { usePatientRowSummary } from '../hooks/usePatientRowSummary';
import type { PatientRowItem } from '../types';

export type PatientRowProps = {
  row: PatientRowItem;
  selected: boolean;
  onSelect: () => void;
};

/** One patient in the table: who, new or regular, last diagnosis, contact. */
export function PatientRow({ row, selected, onSelect }: PatientRowProps) {
  const summary = usePatientRowSummary(row.patient);
  return (
    <Tr selected={selected} onClick={onSelect}>
      <Td>
        <div className="flex items-center gap-3">
          <Avatar name={row.name} />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-bold">
              {row.name}
              {summary.visitor ? (
                <StatusChip
                  label={summary.visitor.label}
                  tone={summary.visitor.tone}
                />
              ) : null}
            </p>
            <p className="text-meta text-ink-secondary">{row.details}</p>
          </div>
        </div>
      </Td>
      <Td className="max-w-64">
        {summary.isLoading ? null : (
          <p
            className={cx(
              'line-clamp-2',
              !summary.hasDiagnosis && 'text-meta text-ink-secondary',
            )}
          >
            {summary.diagnosis}
          </p>
        )}
      </Td>
      <Td>{row.phone}</Td>
      <Td>{row.lastVisit}</Td>
    </Tr>
  );
}
