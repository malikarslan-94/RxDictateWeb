import type { TemplateView } from '@/contract';
import { FormPatientField } from '@/features/patients';
import { Banner, Button, Dialog } from '@/ui';

import { templatesCopy } from '../copy';
import { useUseTemplate } from '../hooks/useUseTemplate';

const copy = templatesCopy.use;

export type UseTemplateDialogProps = {
  template: TemplateView;
  onClose: () => void;
};

/** Choose the patient, then their prescription starts from the template. */
export function UseTemplateDialog({
  template,
  onClose,
}: UseTemplateDialogProps) {
  const use = useUseTemplate(template);
  return (
    <Dialog
      title={copy.title(template.name)}
      description={copy.description}
      onClose={onClose}
      actions={
        <>
          <Button label={copy.cancel} variant="secondary" onClick={onClose} />
          <Button
            label={copy.submit}
            loading={use.isStarting}
            onClick={use.submit}
          />
        </>
      }
    >
      <form onSubmit={use.submit} className="flex flex-col gap-4">
        <FormPatientField
          control={use.control}
          name="patientId"
          label={copy.patient}
        />
        {use.formError ? <Banner tone="danger">{use.formError}</Banner> : null}
      </form>
    </Dialog>
  );
}
