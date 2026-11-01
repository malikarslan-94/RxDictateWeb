import { PageHeader, StateMessage } from '@/components';
import { Button, Icon } from '@/ui';

import { AppointmentsTable } from '../components/AppointmentsTable';
import { BookAppointmentDialog } from '../components/BookAppointmentDialog';
import { CancelAppointmentDialog } from '../components/CancelAppointmentDialog';
import { FollowUpsCard } from '../components/FollowUpsCard';
import { WeekStrip } from '../components/WeekStrip';
import { appointmentsCopy } from '../copy';
import { useSchedule } from '../hooks/useSchedule';

const copy = appointmentsCopy.schedule;

/** The assistant's week of appointments, and the follow-ups to book. */
export function ScheduleScreen() {
  const schedule = useSchedule();

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader
        icon="calendar"
        meta={schedule.meta}
        title={copy.title}
        actions={
          <Button
            label={copy.book}
            icon={<Icon name="plus" className="size-4" />}
            onClick={schedule.book}
          />
        }
      />
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <WeekStrip
            days={schedule.days}
            onSelect={schedule.select}
            onPrevious={schedule.previousWeek}
            onNext={schedule.nextWeek}
          />
          <h2 className="text-section">{schedule.dayTitle}</h2>
          {schedule.appointments.length > 0 ? (
            <AppointmentsTable rows={schedule.appointments} />
          ) : (
            <StateMessage
              isLoading={schedule.isLoading}
              error={schedule.error}
              onRetry={schedule.retry}
              empty={schedule.emptyText}
            />
          )}
        </div>
        <aside className="w-panel shrink-0 xl:w-96">
          <FollowUpsCard schedule={schedule} />
        </aside>
      </div>
      {schedule.booking ? (
        <BookAppointmentDialog
          preset={schedule.booking}
          onClose={schedule.closeBooking}
        />
      ) : null}
      {schedule.cancelling ? (
        <CancelAppointmentDialog
          name={schedule.cancelling.name}
          when={schedule.cancelling.when}
          isCancelling={schedule.isCancelling}
          error={schedule.cancelError}
          onCancel={schedule.cancel}
          onClose={schedule.closeCancel}
        />
      ) : null}
    </div>
  );
}
