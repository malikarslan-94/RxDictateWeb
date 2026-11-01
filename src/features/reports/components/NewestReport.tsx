import { StatusChip } from '@/ui';

import { reportsCopy } from '../copy';
import { usePatientReports } from '../hooks/usePatientReports';

/** A patient's newest unopened report, and how many are waiting. */
export function NewestReport({ patientId }: { patientId: string }) {
  const reports = usePatientReports(patientId);
  const newest = reports.items.find((item) => item.isNew) ?? null;
  if (!newest) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{newest.title}</p>
        <p className="text-meta text-ink-secondary">{newest.line}</p>
      </div>
      <StatusChip
        label={reportsCopy.inbox.newCount(reports.newCount)}
        tone="waiting"
      />
    </div>
  );
}
