import { useState } from 'react';
import type { KeyboardEvent } from 'react';

import type { TextItem } from '@/contract';

/**
 * Editing one plain section in place: a line becomes an input when clicked,
 * and a new one is typed at the end. Enter saves, Esc puts it back, and an
 * emptied line is removed.
 */
export function useLineEditing({
  onAdd,
  onUpdate,
  onRemove,
}: {
  onAdd: (text: string) => Promise<boolean>;
  onUpdate: (item: TextItem, text: string) => Promise<boolean>;
  onRemove: (item: TextItem) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState<TextItem | 'new' | null>(null);
  const [draft, setDraft] = useState('');

  const cancel = () => {
    setEditing(null);
    setDraft('');
  };

  const commit = async () => {
    const text = draft.trim();
    if (editing === null) return;
    if (editing === 'new') {
      if (text && (await onAdd(text))) setDraft('');
      else if (!text) cancel();
      return;
    }
    const isOk =
      text === editing.text
        ? true
        : text
          ? await onUpdate(editing, text)
          : await onRemove(editing);
    if (isOk) cancel();
  };

  return {
    editingId: editing === 'new' ? 'new' : (editing?.id ?? null),
    draft,
    setDraft,
    startEdit: (item: TextItem) => {
      setEditing(item);
      setDraft(item.text);
    },
    startAdd: () => {
      setEditing('new');
      setDraft('');
    },
    commit,
    cancel,
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
      } else if (event.key === 'Escape') {
        // The edit, not a dialog the editor sits in.
        event.stopPropagation();
        cancel();
      }
    },
  };
}
