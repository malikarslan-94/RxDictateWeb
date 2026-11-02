import {
  PageHeader,
  PrintDocument,
  PrintPreview,
  StateMessage,
} from '@/components';
import { SaveTemplateDialog } from '@/features/templates';
import { Button, Icon } from '@/ui';

import { PrintActions } from '../components/PrintActions';
import { PrintSettingsCard } from '../components/PrintSettingsCard';
import { printingCopy } from '../copy';
import { usePrintPreview } from '../hooks/usePrintPreview';

/** The page as it will print, this computer's settings, and Print. */
export function PrintPreviewScreen() {
  const page = usePrintPreview();
  const { printout } = page;

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader
        icon="printer"
        meta={page.meta}
        title={printingCopy.preview.title}
        actions={
          <Button
            label={printingCopy.preview.back}
            variant="secondary"
            icon={<Icon name="chevronLeft" className="size-4" />}
            onClick={page.back}
          />
        }
      />
      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1 rounded-sheet bg-primary-soft p-8">
          {printout.printout ? (
            <div className="mx-auto max-w-a4-width">
              <PrintPreview
                printout={printout.printout}
                options={page.settings.options}
              />
            </div>
          ) : (
            <StateMessage
              isLoading={printout.isLoading}
              error={printout.error}
            />
          )}
        </div>
        <div className="flex w-panel shrink-0 flex-col gap-4">
          <PrintSettingsCard settings={page.settings} />
          <PrintActions printout={printout} />
          {page.canSaveTemplate ? (
            <Button
              label={printingCopy.preview.saveTemplate}
              variant="text"
              fullWidth
              icon={<Icon name="template" className="size-4" />}
              onClick={page.saveTemplate}
            />
          ) : null}
        </div>
      </div>
      {page.isSavingTemplate && printout.prescription ? (
        <SaveTemplateDialog
          prescriptionId={printout.prescription.id}
          suggestedName={page.templateName}
          onClose={page.closeSaveTemplate}
        />
      ) : null}
      {printout.printout ? (
        <PrintDocument
          printout={printout.printout}
          options={page.settings.options}
          pageRef={printout.pageRef}
        />
      ) : null}
    </div>
  );
}
