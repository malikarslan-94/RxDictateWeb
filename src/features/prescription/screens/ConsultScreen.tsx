import { StateMessage } from '@/components';
import { PatientReportsDialog } from '@/features/reports';
import { TemplatePickerDialog } from '@/features/templates';
import { VitalsDialog } from '@/features/vitals';
import { DictationPanel, WhatYouSaid } from '@/features/voice';
import { Banner, Button, Icon, TextLink } from '@/ui';

import { ApproveDialog } from '../components/ApproveDialog';
import { DiscardDialog } from '../components/DiscardDialog';
import { PastRxDialog } from '../components/PastRxDialog';
import { PatientHeader } from '../components/PatientHeader';
import { ReviseDialog } from '../components/ReviseDialog';
import { RxEditor } from '../components/RxEditor';
import { RxStatusBar } from '../components/RxStatusBar';
import { WorkspaceQueue } from '../components/WorkspaceQueue';
import { rxCopy } from '../copy';
import { useWorkspace } from '../hooks/useWorkspace';

const copy = rxCopy.workspace;

/**
 * The doctor's workspace for one patient: today's list on the left, the
 * prescription in the middle, and what was dictated beside it to check.
 * The patient and the Approve bar stay put; only the prescription scrolls.
 * Moving to the next patient never leaves the page.
 */
export function ConsultScreen() {
  const ws = useWorkspace();
  const { patient, rx, dictation } = ws;

  return (
    <div className="flex h-screen">
      <WorkspaceQueue queue={ws.queue} />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-col gap-4 border-b border-border px-8 pt-6 pb-4">
          {patient.name ? (
            <PatientHeader
              name={patient.name}
              line={patient.line}
              allergyChip={patient.allergyChip}
              conditions={patient.conditions}
              vitals={patient.vitalsReadings}
              vitalsNote={patient.vitalsNote}
              vitalsAction={patient.vitalsAction}
              onEditVitals={ws.openVitals}
              onOpenHistory={ws.openHistory}
              reportsLabel={ws.reportsLabel}
              onOpenReports={ws.openReports}
            />
          ) : (
            <StateMessage isLoading={patient.isLoading} error={patient.error} />
          )}

          <RxStatusBar
            isDraft={rx.isDraft}
            status={ws.status}
            detail={ws.detail}
            canPreview={!!rx.prescription && !rx.isEmpty}
            onPreview={rx.openPrint}
            previewLabel={copy.preview}
            approveLabel={copy.approve}
            canApprove={ws.canApprove}
            onApprove={ws.openApprove}
            reviseLabel={ws.reviseLabel}
            onRevise={ws.openRevise}
          />

          {ws.error ? <Banner tone="danger">{ws.error}</Banner> : null}
          {dictation.workingNote ? (
            <Banner tone="info" icon="mic">
              {dictation.workingNote}
            </Banner>
          ) : null}
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
          {rx.repeatLast || ws.openTemplates ? (
            <div className="flex flex-wrap gap-3">
              {rx.repeatLast ? (
                <Button
                  label={rx.repeatLastLabel}
                  variant="dashed"
                  size="medium"
                  icon={<Icon name="history" className="size-4" />}
                  onClick={rx.repeatLast}
                />
              ) : null}
              {ws.openTemplates ? (
                <Button
                  label={ws.templateLabel}
                  variant="dashed"
                  size="medium"
                  icon={<Icon name="template" className="size-4" />}
                  onClick={ws.openTemplates}
                />
              ) : null}
            </div>
          ) : null}

          {rx.isLoading ? (
            <StateMessage isLoading />
          ) : (
            <RxEditor
              sections={rx.sections}
              allergies={patient.allergies}
              editor={ws.editor}
              isEditable={rx.isDraft}
              highlightSpanIds={dictation.highlightSpanIds}
              newSpanIds={dictation.newSpanIds}
              followUpFrom={ws.followUpFrom}
            />
          )}

          {rx.canDiscard ? (
            <TextLink
              label={copy.discard}
              tone="danger"
              onClick={ws.openDiscard}
              className="self-start"
            />
          ) : null}
        </div>
      </main>

      <aside className="relative flex w-panel shrink-0 flex-col gap-5 overflow-y-auto border-l border-border px-5 py-6">
        {rx.isDraft ? <DictationPanel dictation={dictation} /> : null}
        <WhatYouSaid dictation={dictation} />
      </aside>

      {ws.dialog === 'approve' ? (
        <ApproveDialog
          dialog={ws.approveDialog}
          onClose={ws.closeDialog}
          onFix={ws.fix}
        />
      ) : null}
      {ws.dialog === 'revise' ? (
        <ReviseDialog
          isRevising={rx.isRevising}
          onRevise={ws.revise}
          onClose={ws.closeDialog}
        />
      ) : null}
      {ws.dialog === 'vitals' ? (
        <VitalsDialog
          vitals={patient.vitals}
          getVisitId={patient.ensureVisit}
          onClose={ws.closeDialog}
        />
      ) : null}
      {ws.dialog === 'history' ? (
        <PastRxDialog
          patientId={patient.patientId}
          visitId={patient.visitId}
          onClose={ws.closeDialog}
        />
      ) : null}
      {ws.dialog === 'reports' ? (
        <PatientReportsDialog
          patientId={patient.patientId}
          onClose={ws.closeDialog}
        />
      ) : null}
      {ws.dialog === 'templates' ? (
        <TemplatePickerDialog
          isAdding={!rx.isEmpty}
          error={ws.templateError}
          onPick={ws.applyTemplate}
          onClose={ws.closeDialog}
        />
      ) : null}
      {ws.dialog === 'discard' ? (
        <DiscardDialog
          isRevision={ws.isRevision}
          isDiscarding={rx.isDiscarding}
          onDiscard={ws.discard}
          onClose={ws.closeDialog}
        />
      ) : null}
    </div>
  );
}
