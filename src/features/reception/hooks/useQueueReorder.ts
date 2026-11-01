import { useState } from 'react';
import type { DragEvent } from 'react';

import { useMoveVisitMutation } from '@/features/visits';

/** Which half of a row the dragged one would land on. */
type Edge = 'above' | 'below';

/** Firefox starts a drag only when it carries some data. */
const DRAG_TYPE = 'text/plain';

/**
 * The assistant rearranging who's waiting by dragging a row by its handle.
 * Each move says where the patient goes ("before this visit", or the end);
 * the token never changes.
 *
 * `waitingIds` is the waiting part of the list, in its current order.
 */
export function useQueueReorder(waitingIds: readonly string[]) {
  const [moveVisit] = useMoveVisitMutation();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ id: string; edge: Edge } | null>(null);

  /** The visit now right after `id`, or null when it's last. */
  const nextOf = (id: string) => waitingIds[waitingIds.indexOf(id) + 1] ?? null;

  const move = (id: string, before: string | null) => {
    if (before === id || before === nextOf(id)) return;
    moveVisit({ id, before });
  };

  /**
   * Where a row dropped on `target` lands, the dragged one taken out first.
   * Dropped on itself, it stays where it is.
   */
  const landing = (dragged: string, target: string, edge: Edge) => {
    const others = waitingIds.filter((id) => id !== dragged);
    const index = others.indexOf(target);
    if (index < 0) return nextOf(dragged);
    return edge === 'above' ? others[index] : (others[index + 1] ?? null);
  };

  const finish = () => {
    setDraggingId(null);
    setDrop(null);
  };

  return {
    rowFor: (id: string) => {
      if (!waitingIds.includes(id)) return null;
      return {
        isDragging: draggingId === id,
        dropEdge: drop?.id === id && draggingId !== id ? drop.edge : null,
        drag: {
          draggable: true,
          onDragStart: (event: DragEvent<HTMLTableRowElement>) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData(DRAG_TYPE, id);
            setDraggingId(id);
          },
          onDragOver: (event: DragEvent<HTMLTableRowElement>) => {
            if (!draggingId) return;
            event.preventDefault();
            const box = event.currentTarget.getBoundingClientRect();
            const edge: Edge =
              event.clientY < box.top + box.height / 2 ? 'above' : 'below';
            if (drop?.id !== id || drop.edge !== edge) setDrop({ id, edge });
          },
          onDrop: (event: DragEvent<HTMLTableRowElement>) => {
            event.preventDefault();
            if (draggingId && drop) {
              move(draggingId, landing(draggingId, drop.id, drop.edge));
            }
            finish();
          },
          onDragEnd: finish,
        },
      };
    },
  };
}
