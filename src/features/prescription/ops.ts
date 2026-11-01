import type { FollowUp, Op, PrescriptionSections } from '@/contract';

import type { MedicineFormValues } from './schemas';

/**
 * Every change to a draft is an op — typed edits, "Repeat last Rx" and voice
 * alike. These build them; the server validates and applies them.
 *
 * An `update` sends only the fields it changes: the server leaves every
 * absent field as it was (an explicit `null` clears one). Sending whole lines
 * would overwrite anything voice changed on the same line in the meantime.
 */

type ListSectionKey = Exclude<keyof PrescriptionSections, 'followUp'>;
type Medicine = PrescriptionSections['medicines'][number];

export function addText(section: ListSectionKey, text: string): Op {
  return { op: 'add', section, value: { text }, spanIds: [] };
}

export function updateText(
  section: ListSectionKey,
  itemId: string,
  text: string,
): Op {
  return { op: 'update', section, itemId, value: { text }, spanIds: [] };
}

export function removeItem(section: ListSectionKey, itemId: string): Op {
  return { op: 'remove', section, itemId, spanIds: [] };
}

/** The fields the medicine sheet edits. */
function fromForm(values: MedicineFormValues) {
  return {
    name: values.name,
    strength: values.strength,
    form: values.form,
    pattern: values.pattern,
    timing: values.timing,
    durationDays: values.durationDays ?? 0,
    drugId: values.drugId,
  };
}

export function addMedicine(values: MedicineFormValues): Op {
  return {
    op: 'add',
    section: 'medicines',
    value: fromForm(values),
    spanIds: [],
  };
}

export function updateMedicine(itemId: string, values: MedicineFormValues): Op {
  return {
    op: 'update',
    section: 'medicines',
    itemId,
    value: fromForm(values),
    spanIds: [],
  };
}

/**
 * The doctor has checked a flagged line and it's right as it is. Any doctor
 * edit clears the line's flags, so re-sending the name alone is enough; the
 * dose and everything else stay exactly as they were.
 */
export function confirmMedicine(medicine: Medicine): Op {
  return {
    op: 'update',
    section: 'medicines',
    itemId: medicine.id,
    value: { name: medicine.name },
    spanIds: [],
  };
}

export function updateFollowUp(changes: Partial<FollowUp>): Op {
  return { op: 'update', section: 'followUp', value: changes, spanIds: [] };
}

/** "Repeat last Rx": every line of an earlier prescription, added again. */
export function copyPrescription(sections: PrescriptionSections): Op[] {
  const ops: Op[] = [];
  const copyText = (section: ListSectionKey, items: { text: string }[]) =>
    items.forEach((item) => ops.push(addText(section, item.text)));

  copyText('diagnosis', sections.diagnosis);
  sections.medicines.forEach((medicine) =>
    ops.push({
      op: 'add',
      section: 'medicines',
      value: {
        drugId: medicine.drugId,
        name: medicine.name,
        strength: medicine.strength,
        form: medicine.form,
        route: medicine.route,
        pattern: medicine.pattern,
        timing: medicine.timing,
        durationDays: medicine.durationDays,
        instructionEn: medicine.instructionEn,
        instructionUr: medicine.instructionUr,
      },
      spanIds: [],
    }),
  );
  copyText('labs', sections.labs);
  copyText('advice', sections.advice);
  return ops;
}

/** What the quick line and the medicine row can set on a line. */
export type MedicineFields = Partial<
  Pick<
    Medicine,
    | 'name'
    | 'strength'
    | 'form'
    | 'pattern'
    | 'timing'
    | 'durationDays'
    | 'drugId'
  >
>;

/** A medicine from the quick line: "amlo 5 1-0-0 30d". */
export function addMedicineLine(fields: MedicineFields): Op {
  return { op: 'add', section: 'medicines', value: fields, spanIds: [] };
}

/** Change only what was touched on the row: the dose, the timing, the days. */
export function updateMedicineFields(
  itemId: string,
  fields: MedicineFields,
): Op {
  return {
    op: 'update',
    section: 'medicines',
    itemId,
    value: fields,
    spanIds: [],
  };
}
