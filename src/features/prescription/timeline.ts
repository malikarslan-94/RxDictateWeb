import type { HistoryItemView } from '@/contract';
import { reportsCopy } from '@/features/reports';
import { toVitalReadings } from '@/features/vitals';
import { formatPrintDate, fromDateString } from '@/utils/date';

import { RxStatus } from './constants';
import { rxCopy } from './copy';
import type { TimelineEntry } from './types';

const copy = rxCopy.timeline;

/** One item of a patient's history as the timeline shows it. */
export function toTimelineEntry(item: HistoryItemView): TimelineEntry {
  const base = {
    key: `${item.kind}-${item.id}`,
    kind: item.kind,
    date: formatPrintDate(item.at),
    readings: [],
    status: null,
    isNew: false,
    prescriptionId: null,
  };
  switch (item.kind) {
    case 'visit':
      return {
        ...base,
        icon: 'clipboard',
        title: copy.visit(item.token),
        line: [
          item.reason || copy.noReason,
          copy.visitStatus[item.status],
        ].join(' · '),
        readings: item.vitals ? toVitalReadings(item.vitals) : [],
      };
    case 'prescription':
      return {
        ...base,
        icon: 'file',
        title: item.number ?? rxCopy.log.draftTitle,
        line: [...item.diagnosis, ...item.medicineNames].join(', '),
        status: { status: item.status, label: rxCopy.log.status[item.status] },
        prescriptionId: item.status === RxStatus.approved ? item.id : null,
      };
    case 'lab':
      return {
        ...base,
        icon: 'flask',
        title: item.name,
        line: item.result ? copy.result(item.result) : copy.noResult,
      };
    case 'report':
      return {
        ...base,
        icon: 'image',
        title: item.testName,
        line: copy.report(
          reportsCopy.types[item.type],
          formatPrintDate(fromDateString(item.testDate)),
          item.pages,
        ),
        isNew: item.reviewedAt === null,
      };
  }
}
