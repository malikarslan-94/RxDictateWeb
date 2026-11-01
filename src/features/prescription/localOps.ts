import type { z } from 'zod';

import { LIST_SECTIONS, opValueSchemas } from '@/contract';
import type { ListSection, Op, PrescriptionSections } from '@/contract';

/** Marks a line added here that the server hasn't given its id yet. */
const PENDING_ID_PREFIX = 'pending-';

/** A line still on its way to the server: it can't be changed until it lands. */
export const isPendingId = (id: string) => id.startsWith(PENDING_ID_PREFIX);

/** An op as it's shown before it's saved: an `add` shows under `newId`. */
export type LocalOp = { op: Op; newId: string };

export function toLocalOps(ops: Op[]): LocalOp[] {
  return ops.map((op) => ({
    op,
    newId: `${PENDING_ID_PREFIX}${crypto.randomUUID()}`,
  }));
}

type Item = PrescriptionSections[ListSection][number];

const isListSection = (section: Op['section']): section is ListSection =>
  (LIST_SECTIONS as readonly string[]).includes(section);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** An update's fields as the server reads them: only the ones it sent. */
function sentFields(
  schema: z.ZodObject,
  value: unknown,
): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  const parsed = schema.partial().safeParse(value);
  if (!parsed.success) return null;
  const data: Record<string, unknown> = parsed.data;
  return Object.fromEntries(
    Object.keys(value)
      .filter((key) => key in data)
      .map((key) => [key, data[key]]),
  );
}

function applyOne(
  sections: PrescriptionSections,
  { op, newId }: LocalOp,
): PrescriptionSections {
  const schema = opValueSchemas[op.section] as unknown as z.ZodObject;
  if (!isListSection(op.section)) {
    // The follow-up is one object: it only updates.
    const fields = op.op === 'update' ? sentFields(schema, op.value) : null;
    return fields
      ? { ...sections, followUp: { ...sections.followUp, ...fields } }
      : sections;
  }

  const section = op.section;
  const list: Item[] = sections[section];
  const next = (items: Item[]) =>
    ({ ...sections, [section]: items }) as PrescriptionSections;

  if (op.op === 'add') {
    const parsed = schema.safeParse(op.value);
    return parsed.success
      ? next([...list, { ...parsed.data, id: newId } as Item])
      : sections;
  }
  if (op.op === 'remove') {
    return next(list.filter((item) => item.id !== op.itemId));
  }
  const fields = sentFields(schema, op.value);
  if (!fields) return sections;
  // A typed change settles whatever dictation was unsure about.
  const settled = section === 'medicines' ? { flags: [] } : {};
  return next(
    list.map((item) =>
      item.id === op.itemId
        ? ({ ...item, ...fields, ...settled } as Item)
        : item,
    ),
  );
}

/**
 * The server's op rules, run here so an edit shows before it's saved. The
 * server's answer replaces the result; an op it would refuse changes
 * nothing here either.
 */
export function applyOpsLocally(
  sections: PrescriptionSections,
  edits: readonly LocalOp[],
): PrescriptionSections {
  return edits.reduce(applyOne, sections);
}
