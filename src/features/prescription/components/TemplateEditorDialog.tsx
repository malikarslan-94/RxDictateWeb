import { FormInput, StateMessage } from '@/components';
import { Banner, Button, Dialog } from '@/ui';

import { rxCopy } from '../copy';
import { useTemplateEditor } from '../hooks/useTemplateEditor';
import { RxEditor } from './RxEditor';

const copy = rxCopy.templateEditor;
const NO_SPANS: readonly string[] = [];
const NO_ALLERGIES: readonly string[] = [];

/** A template's name and lines, edited like a prescription and saved whole. */
export function TemplateEditorDialog() {
  const template = useTemplateEditor();

  return (
    <Dialog
      title={template.title}
      description={copy.description}
      width="large"
      onClose={template.close}
      actions={
        <>
          <Button
            label={copy.cancel}
            variant="secondary"
            onClick={template.close}
          />
          <Button
            label={copy.save}
            loading={template.isSaving}
            disabled={template.isLoading}
            onClick={template.save}
          />
        </>
      }
    >
      {template.isLoading ? (
        <StateMessage isLoading={!template.error} error={template.error} />
      ) : (
        <>
          <form onSubmit={template.save}>
            <FormInput
              control={template.control}
              name="name"
              label={copy.name}
              placeholder={copy.namePlaceholder}
              containerClassName="max-w-readable"
            />
          </form>
          <RxEditor
            sections={template.sections}
            allergies={NO_ALLERGIES}
            editor={template.editor}
            isEditable
            highlightSpanIds={NO_SPANS}
            newSpanIds={NO_SPANS}
            followUpFrom={null}
          />
          {template.formError ? (
            <Banner tone="danger">{template.formError}</Banner>
          ) : null}
        </>
      )}
    </Dialog>
  );
}
