import type { FollowUp } from '@/contract';
import { FilterChip } from '@/ui';
import {
  addDays,
  formatWeekdayDate,
  fromDateString,
  toDateString,
} from '@/utils/date';

import { FOLLOW_UP_CHOICES } from '../constants';
import { rxCopy } from '../copy';
import type { RxEditor } from '../hooks/useRxEditor';

const copy = rxCopy.editor;

export type FollowUpSectionProps = {
  followUp: FollowUp;
  editor: RxEditor;
  isEditable: boolean;
  /**
   * The day the follow-up counts from: approval, or today for a draft. Null
   * for a template, which keeps only how long until the patient comes back.
   */
  from: Date | null;
};

/** When to come back: a week, two, a month, or a chosen day. */
export function FollowUpSection({
  followUp,
  editor,
  isEditable,
  from,
}: FollowUpSectionProps) {
  const due =
    from === null
      ? null
      : followUp.date !== null
        ? fromDateString(followUp.date)
        : followUp.inDays !== null
          ? addDays(from, followUp.inDays)
          : null;
  const isCustom = followUp.date !== null;

  return (
    <section className="flex flex-wrap items-center gap-3">
      <h3 className="mr-2 text-group text-primary-strong uppercase">
        {copy.sections.followUp}
      </h3>
      {FOLLOW_UP_CHOICES.map((choice) => (
        <FilterChip
          key={choice.key}
          label={copy.followUp[choice.key]}
          selected={!isCustom && followUp.inDays === choice.days}
          onClick={
            isEditable
              ? () =>
                  editor.setFollowUpDays(
                    followUp.inDays === choice.days ? null : choice.days,
                  )
              : undefined
          }
        />
      ))}
      {from !== null ? (
        <input
          type="date"
          aria-label={copy.followUp.customLabel}
          disabled={!isEditable}
          min={toDateString(from)}
          value={followUp.date ?? ''}
          onChange={(event) => {
            if (event.target.value) {
              editor.setFollowUpDate(fromDateString(event.target.value));
            }
          }}
          className="h-9 rounded-full border border-border bg-surface px-3 text-meta font-bold outline-none focus:border-primary"
        />
      ) : null}
      {due ? (
        <p className="text-body font-bold">{formatWeekdayDate(due)}</p>
      ) : null}
    </section>
  );
}
