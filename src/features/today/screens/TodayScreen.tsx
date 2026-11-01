import { LiveStatus, PageHeader, StatTile, StateMessage } from '@/components';
import { HotkeyLabel } from '@/constants/keys';
import { ActivityCard, NotificationsBell } from '@/features/notifications';
import { PatientPickerDialog } from '@/features/patients';
import { Icon, Kbd } from '@/ui';

import { NextWaitingCard } from '../components/NextWaitingCard';
import { TodayTable } from '../components/TodayTable';
import { todayCopy } from '../copy';
import { useToday } from '../hooks/useToday';

/** The doctor's Today: the list, the next patient, and what's happened. */
export function TodayScreen() {
  const today = useToday();

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader
        icon="home"
        meta={today.meta}
        title={today.greeting}
        actions={
          <>
            <button
              type="button"
              onClick={today.openPicker}
              className="flex h-control w-80 items-center gap-3 rounded-control border border-transparent bg-bg px-4 text-left text-body text-ink-secondary transition-colors hover:border-primary"
            >
              <Icon name="search" className="size-4" />
              <span className="flex-1 truncate">{todayCopy.search}</span>
              <Kbd keys={HotkeyLabel.search} />
            </button>
            <NotificationsBell inbox={today.inbox} />
          </>
        }
      />

      <div className="flex gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex gap-4">
            {today.stats.map((stat) => (
              <StatTile
                key={stat.key}
                value={stat.value}
                label={stat.label}
                tone={stat.tone}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-section">{todayCopy.list.title}</h2>
            <LiveStatus
              label={today.live.label}
              interrupted={today.live.isInterrupted}
            />
          </div>
          {today.rows.length > 0 ? (
            <TodayTable rows={today.rows} />
          ) : (
            <StateMessage
              isLoading={today.isLoading}
              error={today.error}
              onRetry={today.retry}
              empty={todayCopy.list.empty}
            />
          )}
        </div>
        <aside className="flex w-panel shrink-0 flex-col gap-6">
          <NextWaitingCard next={today.next} />
          <ActivityCard inbox={today.inbox} />
        </aside>
      </div>

      {today.isPicking ? (
        <PatientPickerDialog onClose={today.closePicker} />
      ) : null}
    </div>
  );
}
