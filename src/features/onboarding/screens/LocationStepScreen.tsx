import { LocationFields } from '@/features/clinic';
import { Banner, Button, Card, Icon } from '@/ui';

import { SetupLayout } from '../components/SetupLayout';
import { SetupStep } from '../constants';
import { onboardingCopy } from '../copy';
import { useLocationStep } from '../hooks/useLocationStep';

const copy = onboardingCopy.location;

/** Step 2: the first location, with the printout updating beside it. */
export function LocationStepScreen() {
  const form = useLocationStep();
  return (
    <SetupLayout
      step={SetupStep.Location}
      title={copy.title}
      subtitle={copy.subtitle}
      preview={form.preview}
    >
      <form onSubmit={form.submit} noValidate className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <LocationFields control={form.control} />
        </Card>
        {form.formError ? (
          <Banner tone="danger">{form.formError}</Banner>
        ) : null}
        <div className="flex justify-between">
          <Button
            label={onboardingCopy.back}
            variant="secondary"
            icon={<Icon name="chevronLeft" className="size-4" />}
            onClick={form.back}
          />
          <Button type="submit" label={copy.next} loading={form.isSaving} />
        </div>
      </form>
    </SetupLayout>
  );
}
