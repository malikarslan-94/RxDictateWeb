import { useRef, useState } from 'react';

import type { Op, PrescriptionView } from '@/contract';
import { useAppDispatch, useAppStore } from '@/store/hooks';

import { prescriptionApi, usePatchPrescriptionMutation } from '../api';
import { applyOpsLocally, isPendingId, toLocalOps } from '../localOps';
import type { LocalOp } from '../localOps';

type Edit = { ops: Op[]; local: LocalOp[] };

/** One draft's edits on their way to the server. */
type DraftSaves = {
  queue: Promise<void>;
  waiting: Edit[];
  /** The server's latest word on the draft: what a refused edit falls back to. */
  confirmed: PrescriptionView | null;
  failure: unknown;
};

/**
 * A draft's edits show the moment they're made and save behind the scenes,
 * one at a time and in order, so the server applies them as they were made.
 * Each answer is the new truth, with the edits still on their way laid over
 * it. A refused edit drops out, and `onError` says why.
 */
export function useDraftSaves(onError: (caught: unknown) => void) {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const [patch] = usePatchPrescriptionMutation();
  const drafts = useRef(new Map<string, DraftSaves>());
  const [inFlight, setInFlight] = useState(0);

  const savesOf = (id: string): DraftSaves => {
    const known = drafts.current.get(id);
    if (known) return known;
    const fresh: DraftSaves = {
      queue: Promise.resolve(),
      waiting: [],
      confirmed: null,
      failure: null,
    };
    drafts.current.set(id, fresh);
    return fresh;
  };

  const show = (base: PrescriptionView, edits: readonly Edit[]) =>
    dispatch(
      prescriptionApi.util.upsertQueryData('getPrescription', base.id, {
        ...base,
        sections: applyOpsLocally(
          base.sections,
          edits.flatMap((edit) => edit.local),
        ),
      }),
    );

  return {
    isSaving: inFlight > 0,
    /** Shows the edit and queues it. False for a line that's still saving. */
    save: (draft: PrescriptionView, ops: Op[]): boolean => {
      if (ops.some((op) => op.itemId && isPendingId(op.itemId))) return false;
      const saves = savesOf(draft.id);
      const edit: Edit = { ops, local: toLocalOps(ops) };
      // What's on screen already holds the edits before this one.
      const onScreen =
        prescriptionApi.endpoints.getPrescription.select(draft.id)(
          store.getState(),
        ).data ?? draft;
      if (saves.waiting.length === 0) {
        saves.confirmed = onScreen;
        saves.failure = null;
      }
      saves.waiting.push(edit);
      show(onScreen, [edit]);
      setInFlight((count) => count + 1);

      saves.queue = saves.queue.then(async () => {
        try {
          saves.confirmed = await patch({ id: draft.id, ops }).unwrap();
        } catch (caught) {
          saves.failure = caught;
          onError(caught);
        }
        saves.waiting = saves.waiting.filter((item) => item !== edit);
        if (saves.confirmed) show(saves.confirmed, saves.waiting);
        setInFlight((count) => count - 1);
      });
      return true;
    },
    /**
     * Settles once the draft's edits are saved, and throws why if one was
     * refused: approving or discarding acts on the whole draft, so it waits.
     */
    whenSaved: async (id: string): Promise<void> => {
      const saves = drafts.current.get(id);
      if (!saves || saves.waiting.length === 0) return;
      await saves.queue;
      if (saves.failure) throw saves.failure;
    },
  };
}
