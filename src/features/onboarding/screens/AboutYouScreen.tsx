import { ProfileFields } from '@/features/clinic';
import { Banner, Button, Card } from '@/ui';

import { SetupLayout } from '../components/SetupLayout';
import { SetupStep } from '../constants';
import { onboardingCopy } from '../copy';
import { useAboutYouForm } from '../hooks/useAboutYouForm';

const copy = onboardingCopy.aboutYou;

/** Step 1: everything here is printed at the top of a prescription. */
export function AboutYouScreen() {
  const form = useAboutYouForm();
  return (
    <SetupLayout
      step={SetupStep.AboutYou}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <form onSubmit={form.submit} noValidate className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <ProfileFields control={form.control} />
        </Card>
        {form.formError ? (
          <Banner tone="danger">{form.formError}</Banner>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit" label={copy.next} loading={form.isSaving} />
        </div>
      </form>
    </SetupLayout>
  );
}
