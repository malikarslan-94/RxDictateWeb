import { useState } from 'react';

import { commonCopy } from '@/constants/copy';
import type { Dictation } from '@/features/voice';
import { selectActiveLocationId, selectActiveMembership } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { addDays, formatShortDate } from '@/utils/date';

import { rxCopy } from '../copy';
import { allergyClashes, medicineTitle } from '../utils';
import type { useConsultation } from './useConsultation';
import type { PrescriptionDraft } from './usePrescriptionDraft';

const copy = rxCopy.approveDialog;

/** One line in the dialog's list of checks. */
export type ApproveCheck = {
  key: string;
  tone: 'ok' | 'warning' | 'blocking';
  text: string;
  /** "Fix it": back to the editor, at that line. */
  fixId?: string;
};

/**
 * "Approve this prescription?": what it holds, what was checked, and what
 * still looks wrong. A line still being written in from dictation blocks
 * approval; a missing duration only warns.
 */
export function useApproveDialog({
  rx,
  patient,
  dictation,
  assistantName,
  onClose,
}: {
  rx: PrescriptionDraft;
  patient: ReturnType<typeof useConsultation>;
  dictation: Dictation;
  assistantName: string | null;
  onClose: () => void;
}) {
  const membership = useAppSelector(selectActiveMembership);
  const locationId = useAppSelector(selectActiveLocationId);
  const [openPreview, setOpenPreview] = useState(true);
  const { sections } = rx;
  const clashes = allergyClashes(sections.medicines, patient.allergies);
  const failedParts = dictation.parts.filter((part) => part.state === 'failed');

  const checks: ApproveCheck[] = [
    clashes.size > 0
      ? {
          key: 'allergy',
          tone: 'warning',
          text: sections.medicines
            .filter((item) => clashes.has(item.id))
            .map((item) =>
              copy.clash(medicineTitle(item), clashes.get(item.id) ?? ''),
            )
            .join(' '),
        }
      : {
          key: 'allergy',
          tone: 'ok',
          text: patient.allergies.length
            ? copy.noConflicts(patient.allergies.join(', '))
            : copy.noAllergies,
        },
    dictation.isWorking
      ? { key: 'voice', tone: 'blocking', text: copy.stillWorking }
      : failedParts.length > 0
        ? {
            key: 'voice',
            tone: 'warning',
            text: copy.failedParts(failedParts.length),
          }
        : { key: 'voice', tone: 'ok', text: copy.allApplied },
    ...sections.medicines
      .filter((item) => item.durationDays === 0 || item.flags.length > 0)
      .map((item): ApproveCheck => ({
        key: item.id,
        tone: 'warning',
        text:
          item.durationDays === 0
            ? copy.noDuration(item.name) + copy.noDurationAfter
            : copy.flagged(
                item.name,
                item.flags.map((flag) => rxCopy.flag[flag]).join(' '),
              ),
        fixId: item.id,
      })),
  ];

  const followUp = sections.followUp;
  const due =
    followUp.date !== null
      ? new Date(followUp.date)
      : followUp.inDays !== null
        ? addDays(new Date(), followUp.inDays)
        : null;

  return {
    patientName: patient.name,
    patientLine: rxCopy.workspace.patientLine([
      patient.patient?.age != null ? String(patient.patient.age) : '',
      patient.patient ? commonCopy.sexShort[patient.patient.sex] : '',
      membership?.locations.find((location) => location.id === locationId)
        ?.name ?? '',
    ]),
    counts: {
      medicines: sections.medicines.length,
      tests: sections.labs.length,
      followUp: due ? formatShortDate(due) : copy.noFollowUp,
    },
    checks,
    canApprove: !checks.some((check) => check.tone === 'blocking'),
    lockedNote: copy.locked(assistantName),
    openPreview,
    setOpenPreview,
    approve: async () => {
      if (await rx.approve()) {
        onClose();
        if (openPreview) rx.openPrint();
      }
    },
    isApproving: rx.isApproving,
    error: rx.error,
  };
}
