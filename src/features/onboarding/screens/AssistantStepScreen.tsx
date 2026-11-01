import { FormInput, FormPhoneInput } from '@/components';
import { teamCopy } from '@/features/team';
import { Banner, Button, Card, Icon } from '@/ui';

import { SetupLayout } from '../components/SetupLayout';
import { SetupStep } from '../constants';
import { onboardingCopy } from '../copy';
import { useAssistantStep } from '../hooks/useAssistantStep';

const copy = onboardingCopy.assistant;

/** Step 3, optional: so skipping is a real button, not small print. */
export function AssistantStepScreen() {
  const form = useAssistantStep();
  return (
    <SetupLayout
      step={SetupStep.Assistant}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <form onSubmit={form.submit} noValidate className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <FormInput
            control={form.control}
            name="name"
            label={teamCopy.fields.name}
            placeholder={teamCopy.fields.namePlaceholder}
          />
          <FormPhoneInput
            control={form.control}
            name="phone"
            label={teamCopy.fields.phone}
            hint={form.smsPreview}
          />
        </Card>
        {form.formError ? (
          <Banner tone="danger">{form.formError}</Banner>
        ) : null}
        <div className="flex justify-between gap-3">
          <Button
            label={onboardingCopy.back}
            variant="secondary"
            icon={<Icon name="chevronLeft" className="size-4" />}
            onClick={form.back}
          />
          <div className="flex gap-3">
            <Button label={copy.skip} variant="secondary" onClick={form.skip} />
            <Button
              type="submit"
              label={copy.addAndFinish}
              loading={form.isSaving}
            />
          </div>
        </div>
      </form>
    </SetupLayout>
  );
}
