import { StateMessage } from '@/components';
import { VitalsReadings } from '@/features/vitals';
import { Button, FilterChip, Icon, StatusChip, TextLink } from '@/ui';

import { rxCopy } from '../copy';
import { usePatientTimeline } from '../hooks/usePatientTimeline';
import { RxStatusChip } from './RxStatusChip';

const copy = rxCopy.timeline;

export type HistoryTimelineProps = {
  patientId: string;
  /** A signed prescription on the timeline, shown as its page. */
  onOpenPrescription: (prescriptionId: string) => void;
};

/** Everything on a patient's record, newest first, narrowed by kind. */
export function HistoryTimeline({
  patientId,
  onOpenPrescription,
}: HistoryTimelineProps) {
  const timeline = usePatientTimeline(patientId, onOpenPrescription);

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-label={copy.filterLabel}
        className="flex flex-wrap gap-2"
      >
        {timeline.filters.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={timeline.filter === option.value}
            onClick={() => timeline.setFilter(option.value)}
          />
        ))}
      </div>

      {timeline.entries.length === 0 ? (
        <StateMessage
          isLoading={timeline.isLoading}
          error={timeline.error}
          onRetry={timeline.retry}
          empty={timeline.emptyText}
        />
      ) : (
        <ol className="flex flex-col gap-4">
          {timeline.entries.map((entry) => (
            <li key={entry.key} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-strong">
                <Icon name={entry.icon} className="size-5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1 border-b border-border pb-4">
                <div className="flex items-start gap-3">
                  <p className="flex min-w-0 flex-1 flex-wrap items-center gap-2 font-bold">
                    {entry.title}
                    {entry.status ? (
                      <RxStatusChip
                        status={entry.status.status}
                        label={entry.status.label}
                      />
                    ) : null}
                    {entry.isNew ? (
                      <StatusChip label={copy.isNew} tone="waiting" />
                    ) : null}
                  </p>
                  <p className="shrink-0 text-meta text-ink-secondary">
                    {entry.date}
                  </p>
                </div>
                {entry.line ? (
                  <p className="text-meta text-ink-secondary">{entry.line}</p>
                ) : null}
                {entry.readings.length > 0 ? (
                  <VitalsReadings readings={entry.readings} compact />
                ) : null}
                {entry.open ? (
                  <TextLink
                    label={copy.open(entry.title)}
                    onClick={entry.open}
                    className="self-start"
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}

      {timeline.canShowMore ? (
        <Button
          label={copy.showMore}
          variant="secondary"
          size="small"
          loading={timeline.isFetching}
          onClick={timeline.showMore}
          className="self-center"
        />
      ) : null}
    </div>
  );
}
