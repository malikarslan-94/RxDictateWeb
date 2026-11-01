import { VitalsReadings } from '@/features/vitals';
import type { VitalReading } from '@/features/vitals';
import { Avatar, Button, Card, Icon, StatusChip } from '@/ui';

import { rxCopy } from '../copy';

export type PatientHeaderProps = {
  name: string;
  line: string;
  allergyChip: string | null;
  conditions: string | null;
  vitals: VitalReading[];
  /** "Recorded 10:42 am", or that there are none. */
  vitalsNote: string | null;
  /** "Add vitals" or "Edit". */
  vitalsAction: string;
  onEditVitals?: () => void;
  onOpenHistory: () => void;
  /** "Reports · 2 new". */
  reportsLabel: string;
  onOpenReports: () => void;
};

/**
 * Who the prescription is for, the allergy beside their name, their earlier
 * prescriptions and reports a click away, and today's vitals along the foot.
 */
export function PatientHeader({
  name,
  line,
  allergyChip,
  conditions,
  vitals,
  vitalsNote,
  vitalsAction,
  onEditVitals,
  onOpenHistory,
  reportsLabel,
  onOpenReports,
}: PatientHeaderProps) {
  const copy = rxCopy.workspace;
  const hasVitals = vitals.length > 0;
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        <Avatar name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-title">{name}</h1>
            {allergyChip ? (
              <StatusChip label={allergyChip} tone="overdue" icon="alert" />
            ) : null}
          </div>
          <p className="mt-1 text-meta text-ink-secondary">{line}</p>
          {conditions ? <p className="mt-1 text-meta">{conditions}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            label={copy.history}
            size="small"
            variant="secondary"
            icon={<Icon name="history" className="size-4" />}
            onClick={onOpenHistory}
          />
          <Button
            label={reportsLabel}
            size="small"
            variant="secondary"
            icon={<Icon name="flask" className="size-4" />}
            onClick={onOpenReports}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-primary-tint px-5 py-3">
        <p className="flex items-center gap-2 text-label text-primary-strong">
          <Icon name="activity" className="size-4" />
          {rxCopy.vitals.title}
        </p>
        {hasVitals ? (
          <VitalsReadings readings={vitals} />
        ) : vitalsNote ? (
          <p className="text-meta text-ink-secondary">{vitalsNote}</p>
        ) : null}
        <div className="ml-auto flex items-center gap-3">
          {hasVitals && vitalsNote ? (
            <p className="text-meta text-ink-secondary">{vitalsNote}</p>
          ) : null}
          {onEditVitals ? (
            <Button
              label={vitalsAction}
              size="small"
              variant={hasVitals ? 'text' : 'secondary'}
              icon={
                <Icon name={hasVitals ? 'pencil' : 'plus'} className="size-4" />
              }
              onClick={onEditVitals}
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}
