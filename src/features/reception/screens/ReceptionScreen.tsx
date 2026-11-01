import { LiveStatus, PageHeader, StatTile, StateMessage } from '@/components';
import { BookAppointmentDialog } from '@/features/appointments';
import { NotificationsBell, useInbox } from '@/features/notifications';
import { UploadReportDialog } from '@/features/reports';

import { AddPatientPanel } from '../components/AddPatientPanel';
import { ReceptionQueue } from '../components/ReceptionQueue';
import { receptionCopy } from '../copy';
import { useReception } from '../hooks/useReception';

/** The assistant's Today: the queue, and adding patients beside it. */
export function ReceptionScreen() {
  const reception = useReception();
  const inbox = useInbox();

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader
        icon="home"
        meta={reception.meta}
        title={receptionCopy.title}
        actions={<NotificationsBell inbox={inbox} />}
      />
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex gap-4">
            {reception.stats.map((stat) => (
              <StatTile
                key={stat.key}
                value={stat.value}
                label={stat.label}
                tone={stat.tone}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-section">{receptionCopy.queue.title}</h2>
              <p className="mt-1 text-meta text-ink-secondary">
                {reception.reorderHint}
              </p>
            </div>
            <LiveStatus
              label={reception.live.label}
              interrupted={reception.live.isInterrupted}
            />
          </div>
          {reception.rows.length > 0 ? (
            <ReceptionQueue rows={reception.rows} />
          ) : (
            <StateMessage
              isLoading={reception.isLoading}
              error={reception.error}
              onRetry={reception.retry}
              empty={receptionCopy.queue.empty}
            />
          )}
        </div>
        <aside className="w-panel shrink-0 xl:w-96">
          <AddPatientPanel />
        </aside>
      </div>
      {reception.action?.kind === 'upload' ? (
        <UploadReportDialog
          patientId={reception.action.patientId}
          onClose={reception.closeAction}
        />
      ) : null}
      {reception.action?.kind === 'book' ? (
        <BookAppointmentDialog
          preset={{ patientId: reception.action.patientId }}
          onClose={reception.closeAction}
        />
      ) : null}
    </div>
  );
}
