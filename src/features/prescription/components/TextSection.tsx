import type { TextItem } from '@/contract';
import { Icon, IconButton, StatusChip } from '@/ui';
import { cx } from '@/utils/classes';

import { rxCopy } from '../copy';
import { useLineEditing } from '../hooks/useLineEditing';
import { isPendingId } from '../localOps';
import { isDictated } from '../utils';

const copy = rxCopy.editor;

export type TextSectionProps = {
  title: string;
  items: readonly TextItem[];
  addLabel: string;
  /** Absent on an approved prescription: it reads but doesn't change. */
  onAdd?: (text: string) => Promise<boolean>;
  onUpdate?: (item: TextItem, text: string) => Promise<boolean>;
  onRemove?: (item: TextItem) => Promise<boolean>;
  /** Lines the part picked in "What you said" filled. */
  highlightSpanIds: readonly string[];
  /** Lines the newest part filled. */
  newSpanIds: readonly string[];
};

const touches = (item: TextItem, spanIds: readonly string[]) =>
  item.sourceSpanIds.some((id) => spanIds.includes(id));

/** A mic for a dictated line, a pencil for a typed one. */
function LineMarker({ item }: { item: TextItem }) {
  return (
    <Icon
      name={isDictated(item) ? 'mic' : 'pencil'}
      label={isDictated(item) ? copy.dictated : copy.typed}
      className="size-4 shrink-0 text-primary-strong"
    />
  );
}

/** One plain section: its lines as pills, each editable in place. */
export function TextSection({
  title,
  items,
  addLabel,
  onAdd,
  onUpdate,
  onRemove,
  highlightSpanIds,
  newSpanIds,
}: TextSectionProps) {
  const isEditable = !!onAdd && !!onUpdate && !!onRemove;
  const lines = useLineEditing({
    onAdd: onAdd ?? (async () => false),
    onUpdate: onUpdate ?? (async () => false),
    onRemove: onRemove ?? (async () => false),
  });

  const field = (
    <input
      autoFocus
      aria-label={addLabel}
      placeholder={copy.typeToAdd}
      value={lines.draft}
      onChange={(event) => lines.setDraft(event.target.value)}
      onKeyDown={lines.onKeyDown}
      onBlur={lines.commit}
      className="h-10 w-full rounded-full border border-primary bg-surface px-4 text-body outline-none"
    />
  );

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-group text-primary-strong uppercase">{title}</h3>
      {items.length === 0 && lines.editingId !== 'new' ? (
        <p className="text-meta text-ink-secondary">{copy.noneYet}</p>
      ) : null}
      <ul className="flex flex-col gap-2">
        {items.map((item) =>
          lines.editingId === item.id ? (
            <li key={item.id}>{field}</li>
          ) : (
            <li
              key={item.id}
              // Still saving: it can't be changed until the server has it.
              inert={isPendingId(item.id)}
              className={cx(
                'group flex items-center gap-3 rounded-full px-4 py-2',
                touches(item, newSpanIds)
                  ? 'bg-primary-soft'
                  : 'bg-primary-tint',
                touches(item, highlightSpanIds) && 'ring-2 ring-primary',
                isPendingId(item.id) && 'opacity-60',
              )}
            >
              {isEditable ? (
                // The marker and the words alike open the line for editing.
                <button
                  type="button"
                  aria-label={copy.editLine(item.text)}
                  onClick={() => lines.startEdit(item)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left text-body"
                >
                  <LineMarker item={item} />
                  <span className="min-w-0 flex-1">{item.text}</span>
                </button>
              ) : (
                <>
                  <LineMarker item={item} />
                  <span className="min-w-0 flex-1 text-body">{item.text}</span>
                </>
              )}
              {touches(item, newSpanIds) ? (
                <StatusChip label={copy.newItem} tone="active" solid />
              ) : null}
              {isEditable ? (
                <IconButton
                  icon="close"
                  size="small"
                  tone="plain"
                  label={copy.removeLine(item.text)}
                  onClick={() => onRemove?.(item)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100"
                />
              ) : null}
            </li>
          ),
        )}
        {lines.editingId === 'new' ? <li>{field}</li> : null}
      </ul>
      {isEditable && lines.editingId !== 'new' ? (
        <button
          type="button"
          onClick={lines.startAdd}
          className="flex items-center gap-1 self-start text-meta font-bold text-primary-strong hover:underline"
        >
          <Icon name="plus" className="size-4" />
          {addLabel}
        </button>
      ) : null}
    </section>
  );
}
