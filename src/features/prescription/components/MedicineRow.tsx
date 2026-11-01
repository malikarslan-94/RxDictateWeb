import type { PrescriptionSections } from '@/contract';
import { Icon, IconButton, Select, TextLink } from '@/ui';
import { cx } from '@/utils/classes';

import { rxCopy } from '../copy';
import { useMedicineRow } from '../hooks/useMedicineRow';
import type { RxEditor } from '../hooks/useRxEditor';
import { isDictated, medicineTitle } from '../utils';

const copy = rxCopy.editor;

export type MedicineRowProps = {
  medicine: PrescriptionSections['medicines'][number];
  editor: RxEditor;
  isEditable: boolean;
  allergyClash: string | null;
  isHighlighted: boolean;
};

/** One medicine: name and Urdu dose line, M · A · N, when, days, remove. */
export function MedicineRow({
  medicine,
  editor,
  isEditable,
  allergyClash,
  isHighlighted,
}: MedicineRowProps) {
  const row = useMedicineRow(medicine, editor);
  const hasWarning =
    !!row.durationFix || row.flagNotes.length > 0 || !!allergyClash;
  const name = medicineTitle(medicine);

  return (
    <li
      id={`medicine-${medicine.id}`}
      className={cx(
        'scroll-mt-24 rounded-card border bg-surface px-4 py-3',
        hasWarning ? 'border-warning' : 'border-border',
        isHighlighted && 'ring-2 ring-primary',
      )}
    >
      <div className="grid grid-medicine items-center gap-4">
        <Icon
          name={isDictated(medicine) ? 'mic' : 'pencil'}
          label={isDictated(medicine) ? copy.dictated : copy.typed}
          className="size-4 text-ink-secondary"
        />
        <div className="min-w-0">
          <p className="truncate text-body">
            <strong>{medicine.name}</strong> {medicine.strength}{' '}
            {rxCopy.form[medicine.form].toLowerCase()}
          </p>
          {row.instructionUr ? (
            // Under the name and level with it, though it reads right to left.
            <p
              dir="rtl"
              lang="ur"
              className="text-left font-urdu text-meta text-ink-secondary"
            >
              {row.instructionUr}
            </p>
          ) : null}
        </div>
        <div className="flex gap-1.5">
          {row.isSos ? (
            <span className="rounded-full bg-primary px-3 py-1 text-chip text-ink-on-primary">
              {copy.sos}
            </span>
          ) : (
            row.slots.map((slot) => (
              <button
                key={slot.slot}
                type="button"
                aria-label={slot.label}
                disabled={!isEditable}
                onClick={slot.press}
                className={cx(
                  'size-8 rounded-full border text-meta font-bold transition-colors',
                  slot.count > 0
                    ? 'border-primary bg-primary text-ink-on-primary'
                    : 'border-border text-ink-secondary hover:border-primary',
                )}
              >
                {slot.count}
              </button>
            ))
          )}
        </div>
        <Select
          aria-label={copy.whenLabel(name)}
          size="small"
          options={row.timingOptions}
          value={row.timing}
          onChange={row.setTiming}
          disabled={!isEditable}
        />
        <input
          aria-label={copy.daysLabel(name)}
          inputMode="numeric"
          value={row.days}
          placeholder={copy.noDays}
          disabled={!isEditable}
          onChange={(event) =>
            row.setDays(event.target.value.replace(/\D/g, ''))
          }
          onBlur={row.saveDays}
          onKeyDown={row.onDaysKey}
          className="h-control-sm w-full rounded-control border border-border bg-surface text-center text-body font-bold outline-none focus:border-primary disabled:border-transparent disabled:bg-transparent"
        />
        {isEditable ? (
          <IconButton
            icon="trash"
            size="small"
            tone="danger"
            label={copy.removeMedicine(name)}
            onClick={row.remove}
          />
        ) : (
          <span />
        )}
      </div>

      {hasWarning ? (
        <div className="mt-2 flex flex-col gap-1 pl-8 text-meta">
          {allergyClash ? (
            <p className="flex items-center gap-2 text-danger">
              <Icon name="alert" className="size-3.5" />
              {rxCopy.allergyClash(allergyClash)}
            </p>
          ) : null}
          {row.durationFix ? (
            <p className="flex items-center gap-2 text-warning-strong">
              <Icon name="alert" className="size-3.5" />
              {row.durationFix.text}
              {isEditable ? (
                <TextLink
                  label={row.durationFix.action}
                  underline
                  onClick={row.durationFix.apply}
                />
              ) : null}
            </p>
          ) : null}
          {row.flagNotes.map((note) => (
            <p
              key={note}
              className="flex items-center gap-2 text-warning-strong"
            >
              <Icon name="alert" className="size-3.5" />
              {note}
            </p>
          ))}
          {row.confirm && isEditable ? (
            <TextLink label={copy.confirmLine} onClick={row.confirm} />
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
