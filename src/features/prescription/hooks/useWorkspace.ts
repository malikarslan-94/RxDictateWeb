import { useState } from 'react';

import { Hotkeys } from '@/constants/keys';
import { useReportsButtonLabel } from '@/features/reports';
import { useDictation } from '@/features/voice';
import { useHotkey } from '@/hooks/useHotkey';
import { useNow } from '@/hooks/useNow';
import { formatPrintDate, formatTimeAgo } from '@/utils/date';

import { SAVED_TICK_MS } from '../constants';
import { rxCopy } from '../copy';
import { countTyped } from '../utils';
import { useApplyTemplate } from './useApplyTemplate';
import { useApproveDialog } from './useApproveDialog';
import { useAssistantName } from './useAssistantName';
import { useConsultation } from './useConsultation';
import { usePrescriptionDraft } from './usePrescriptionDraft';
import { useRxEditor } from './useRxEditor';
import { useWorkspaceQueue } from './useWorkspaceQueue';

const copy = rxCopy.workspace;

type WorkspaceDialog =
  | 'approve'
  | 'revise'
  | 'discard'
  | 'vitals'
  | 'history'
  | 'reports'
  | 'templates'
  | null;

/**
 * The doctor's workspace: today's list, the prescription, and dictation side
 * by side. Ctrl M dictates, Ctrl Enter approves, Ctrl ↓ moves to the next
 * patient waiting.
 */
export function useWorkspace() {
  const patient = useConsultation();
  const rx = usePrescriptionDraft({
    patientId: patient.patientId,
    visitId: patient.visitId,
    isVisitKnown: patient.isVisitKnown,
  });
  const editor = useRxEditor(rx);
  const dictation = useDictation({
    prescriptionId: rx.draftId,
    ensureDraft: rx.ensureDraft,
    isEnabled: rx.isDraft,
  });
  const queue = useWorkspaceQueue(patient.patientId);
  const reportsLabel = useReportsButtonLabel(patient.patientId);
  const template = useApplyTemplate(rx, patient.patientId, patient.visitId);
  const assistantName = useAssistantName();
  const now = useNow(SAVED_TICK_MS);
  const [dialog, setDialog] = useState<WorkspaceDialog>(null);
  const close = () => setDialog(null);
  const approveDialog = useApproveDialog({
    rx,
    patient,
    dictation,
    assistantName,
    onClose: close,
  });

  const canApprove = rx.canApprove && !dictation.isWorking;
  useHotkey(
    Hotkeys.approve,
    () => setDialog('approve'),
    rx.isDraft && canApprove,
  );

  const prescription = rx.prescription;
  const status = rx.isDraft
    ? copy.draft
    : copy.approvedOn(
        prescription?.number ?? '',
        formatPrintDate(prescription?.approvedAt ?? now),
      );
  const detail = !rx.isDraft
    ? copy.lockedNote
    : rx.isSaving
      ? copy.saving
      : prescription
        ? [
            copy.savedAgo(
              formatTimeAgo(prescription.updatedAt, now).toLowerCase(),
            ),
            copy.parts(dictation.dictatedParts, countTyped(rx.sections)),
          ]
            .filter(Boolean)
            .join(' · ')
        : '';

  return {
    patient,
    rx,
    editor,
    dictation,
    queue,
    status,
    detail,
    canApprove,
    followUpFrom: prescription?.approvedAt ?? now,
    error: rx.error ?? patient.error,
    dialog,
    openApprove: () => setDialog('approve'),
    openRevise: rx.openRevision ?? (() => setDialog('revise')),
    reviseLabel: rx.openRevision ? copy.openRevision : copy.revise,
    openDiscard: () => setDialog('discard'),
    openVitals: patient.canEditVitals ? () => setDialog('vitals') : undefined,
    openHistory: () => setDialog('history'),
    reportsLabel,
    openReports: () => setDialog('reports'),
    /** Offered on a draft: start from a template, or add one's lines. */
    templateLabel: rx.isEmpty ? copy.fromTemplate : copy.addTemplate,
    openTemplates: rx.isDraft ? () => setDialog('templates') : undefined,
    applyTemplate: template.apply,
    templateError: template.error,
    closeDialog: close,
    approveDialog,
    /** "Fix it": back to the line in the editor, ready to change. */
    fix: (medicineId: string) => {
      close();
      document
        .getElementById(`medicine-${medicineId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    revise: async (reason: string) => {
      if (await rx.revise(reason)) close();
    },
    discard: async () => {
      if (await rx.discard()) close();
    },
    isRevision: !!prescription?.previousVersionId,
  };
}
