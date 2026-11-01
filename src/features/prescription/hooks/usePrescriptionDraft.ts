import { useEffect, useRef, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router';

import { printPath } from '@/constants/routes';
import type { Op, PrescriptionView } from '@/contract';
import { messageFor, toApiError } from '@/lib/api';

import {
  useApprovePrescriptionMutation,
  useCancelPrescriptionMutation,
  useCreatePrescriptionMutation,
  useGetPrescriptionQuery,
  useListPrescriptionsQuery,
  usePatchPrescriptionMutation,
  useRevisePrescriptionMutation,
} from '../api';
import {
  EMPTY_SECTIONS,
  PrintLanguage,
  RxSource,
  RxStatus,
} from '../constants';
import { rxCopy } from '../copy';
import { confirmMedicine, copyPrescription } from '../ops';
import { isEmpty } from '../utils';

export type UsePrescriptionDraftOptions = {
  patientId: string;
  /** Today's visit for this patient, or null when they aren't on the list. */
  visitId: string | null;
  /** False while that is still being looked up: nothing is shown yet. */
  isVisitKnown: boolean;
};

/**
 * The prescription being written for this patient today: the visit's open
 * draft, else its approved one, else none yet. The draft is created on the
 * first change, never just by looking, and every change is a PATCH of ops
 * whose answer replaces the cached copy.
 */
export function usePrescriptionDraft({
  patientId,
  visitId,
  isVisitKnown,
}: UsePrescriptionDraftOptions) {
  const navigate = useNavigate();
  const drafts = useListPrescriptionsQuery(
    patientId ? { patientId, status: RxStatus.draft } : skipToken,
  );
  const approved = useListPrescriptionsQuery(
    patientId ? { patientId, status: RxStatus.approved } : skipToken,
  );

  // Not on today's list yet (a new patient from a search): the first change
  // starts a visit.
  const [startedVisitId, setStartedVisitId] = useState<string | null>(null);
  const activeVisitId = visitId ?? startedVisitId;

  const forVisit = (list?: PrescriptionView[]) =>
    list?.find((rx) => rx.visitId === activeVisitId) ?? null;
  const current = forVisit(drafts.data) ?? forVisit(approved.data);

  // Set when this page created, revised or discarded one.
  const [chosenId, setChosenId] = useState<string | null>(null);
  const id = chosenId ?? current?.id ?? null;
  const fetched = useGetPrescriptionQuery(id ?? skipToken);
  const prescription = fetched.data ?? (current?.id === id ? current : null);

  const [create] = useCreatePrescriptionMutation();
  const [patch, { isLoading: isSaving }] = usePatchPrescriptionMutation();
  const [approveRx, { isLoading: isApproving }] =
    useApprovePrescriptionMutation();
  const [reviseRx, { isLoading: isRevising }] = useRevisePrescriptionMutation();
  const [cancelRx, { isLoading: isDiscarding }] =
    useCancelPrescriptionMutation();
  const [error, setError] = useState<string>();

  // Another patient on the same page starts from scratch.
  useEffect(() => {
    setChosenId(null);
    setStartedVisitId(null);
    setError(undefined);
  }, [patientId]);

  // One create in flight at a time, so two quick edits can't make two drafts.
  const creating = useRef<Promise<string> | null>(null);
  const ensureDraft = (): Promise<string> => {
    if (id && prescription?.status === RxStatus.draft)
      return Promise.resolve(id);
    // The server puts them on today's list if they aren't on it, and the
    // visit becomes "With doctor": from the queue, a search or Add patient.
    creating.current ??= create({
      patientId,
      visitId: activeVisitId,
      source: RxSource.typed,
      printLanguage: PrintLanguage.en_ur,
    })
      .unwrap()
      .then((created) => {
        setStartedVisitId(created.visitId);
        setChosenId(created.id);
        return created.id;
      })
      .finally(() => {
        creating.current = null;
      });
    return creating.current;
  };

  const run = async (task: () => Promise<unknown>): Promise<boolean> => {
    setError(undefined);
    try {
      await task();
      return true;
    } catch (caught) {
      setError(messageFor(toApiError(caught)));
      return false;
    }
  };

  /** Apply ops to the draft, creating it first if needed. */
  const apply = (ops: Op[]) =>
    run(async () => {
      const draftId = await ensureDraft();
      await patch({ id: draftId, ops }).unwrap();
    });

  const sections = prescription?.sections ?? EMPTY_SECTIONS;
  const isDraft = !prescription || prescription.status === RxStatus.draft;
  const empty = isEmpty(sections);
  // "Repeat last Rx" copies the latest approved prescription from an earlier
  // visit, never this one.
  const previous =
    approved.data?.find((rx) => rx.visitId !== activeVisitId) ?? null;
  const isReady = !drafts.isLoading && !approved.isLoading && isVisitKnown;

  return {
    prescription,
    sections,
    isDraft,
    isEmpty: empty,
    isLoading: !isReady,
    error,
    isSaving,
    apply,
    /** The open draft's id, for dictating into it; null once approved. */
    draftId: isDraft ? id : null,
    /** Show this one: a draft a template just started or added to. */
    show: setChosenId,
    ensureDraft,
    // Offered only on an empty draft, so it never doubles lines up.
    repeatLast:
      isDraft && empty && previous
        ? () => apply(copyPrescription(previous.sections))
        : undefined,
    repeatLastLabel: rxCopy.repeatLast,
    canApprove: isDraft && !!prescription && !empty,
    /**
     * Sign it. Flagged lines the doctor has just reviewed in the dialog are
     * confirmed first, since the server won't approve over a flag.
     */
    approve: () =>
      run(async () => {
        if (!id) return;
        const flagged = sections.medicines.filter(
          (item) => item.flags.length > 0,
        );
        if (flagged.length > 0) {
          await patch({ id, ops: flagged.map(confirmMedicine) }).unwrap();
        }
        // The server marks the visit seen in the same step.
        await approveRx(id).unwrap();
      }),
    isApproving,
    revise: (reason: string) =>
      run(async () => {
        if (!id) return;
        const next = await reviseRx({ id, body: { reason } }).unwrap();
        setChosenId(next.id);
      }),
    isRevising,
    // A revision is already open on this approved prescription: go to it.
    openRevision: prescription?.revisionId
      ? () => setChosenId(prescription.revisionId)
      : undefined,
    canDiscard: isDraft && !!prescription,
    discard: () =>
      run(async () => {
        if (!id) return;
        await cancelRx(id).unwrap();
        // Back to whatever this visit has now: its approved one, or nothing.
        setChosenId(null);
      }),
    isDiscarding,
    openPrint: () => {
      if (id) navigate(printPath(id));
    },
  };
}

export type PrescriptionDraft = ReturnType<typeof usePrescriptionDraft>;
