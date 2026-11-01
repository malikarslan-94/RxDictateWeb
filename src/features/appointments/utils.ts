import { WEEKDAY_NAMES } from '@/constants/dates';
import type { AppointmentView, FollowUpView } from '@/contract';
import {
  addDays,
  formatClockTime,
  formatDayAndDate,
  formatShortDate,
  fromDateString,
  toDateString,
} from '@/utils/date';
import { patientDetails } from '@/utils/patient';

import { AppointmentStatus, DAYS_PER_WEEK } from './constants';
import { appointmentsCopy } from './copy';
import type { AppointmentItem, DayTile, FollowUpItem } from './types';

const copy = appointmentsCopy;

/** "Mon" from "Monday". */
const WEEKDAY_LETTERS = 3;

/** The seven days starting at `start`, as the strip shows them. */
export function weekTiles(
  start: Date,
  selected: string,
  countsByDay: Record<string, number>,
  today: Date,
): DayTile[] {
  return Array.from({ length: DAYS_PER_WEEK }, (_, offset) => {
    const day = addDays(start, offset);
    const key = toDateString(day);
    const count = countsByDay[key] ?? 0;
    return {
      key,
      weekday: WEEKDAY_NAMES[day.getDay()].slice(0, WEEKDAY_LETTERS),
      date: String(day.getDate()),
      count,
      countLabel: count > 0 ? copy.schedule.dayCount(count) : '',
      isSelected: key === selected,
      isToday: key === toDateString(today),
      label: copy.schedule.dayLabel(formatDayAndDate(day), count),
    };
  });
}

export function toAppointmentItem(
  appointment: AppointmentView,
): AppointmentItem {
  return {
    id: appointment.id,
    time: formatClockTime(appointment.at),
    name: appointment.patient?.name ?? copy.unknownPatient,
    details: patientDetails(appointment.patient),
    kind: copy.kinds[appointment.kind],
    note: appointment.note,
    hasArrived: appointment.status === AppointmentStatus.arrived,
  };
}

export function toFollowUpItem(followUp: FollowUpView): FollowUpItem {
  return {
    id: followUp.prescriptionId,
    name: followUp.patient?.name ?? copy.unknownPatient,
    due: copy.schedule.due(formatShortDate(fromDateString(followUp.dueDate))),
    isOverdue: followUp.isOverdue,
    note: followUp.note,
  };
}
