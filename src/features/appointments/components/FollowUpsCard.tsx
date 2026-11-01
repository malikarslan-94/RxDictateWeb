import { StateMessage } from '@/components';
import { Button, Card, StatusChip } from '@/ui';

import { appointmentsCopy } from '../copy';
import type { useSchedule } from '../hooks/useSchedule';

const copy = appointmentsCopy.schedule;

export type FollowUpsCardProps = {
  schedule: ReturnType<typeof useSchedule>;
};

/** Follow-ups the doctor asked for that nobody has booked, soonest first. */
export function FollowUpsCard({ schedule }: FollowUpsCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-section">{schedule.followUpsTitle}</h2>
      {schedule.followUps.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {schedule.followUps.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-card border border-border p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-bold">{item.name}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-meta text-ink-secondary">
                  {item.due}
                  {item.isOverdue ? (
                    <StatusChip label={copy.overdue} tone="overdue" />
                  ) : null}
                </p>
                {item.note ? (
                  <p className="mt-1 text-meta">{item.note}</p>
                ) : null}
              </div>
              {item.book ? (
                <Button
                  label={copy.bookFollowUp}
                  size="small"
                  variant="tonal"
                  aria-label={item.bookLabel}
                  onClick={item.book}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <StateMessage
          isLoading={schedule.isLoadingFollowUps}
          error={schedule.followUpsError}
          onRetry={schedule.retryFollowUps}
          empty={schedule.noFollowUpsText}
        />
      )}
    </Card>
  );
}
