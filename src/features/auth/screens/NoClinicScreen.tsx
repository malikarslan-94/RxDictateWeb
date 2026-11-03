import { Banner, Button, Card, Icon } from '@/ui';

import { AuthLayout } from '../components/AuthLayout';
import { authCopy } from '../copy';
import { useNoClinic } from '../hooks/useNoClinic';

const copy = authCopy.noClinic;

/** Verified, but no clinic has this number yet. */
export function NoClinicScreen() {
  const page = useNoClinic();
  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <span className="flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning-strong">
          <Icon name="alert" className="size-6" />
        </span>
        <div>
          <h1 className="text-screen-title">{copy.title}</h1>
          <p className="mt-2 text-body text-ink-secondary">
            {copy.subtitle(page.phoneLabel)}
          </p>
        </div>
        {page.error ? <Banner tone="danger">{page.error}</Banner> : null}
        <Card className="flex flex-col items-start gap-3">
          <h2 className="text-section">{copy.doctorTitle}</h2>
          <p className="text-body text-ink-secondary">{copy.doctorBody}</p>
          <Button
            label={copy.setUpClinic}
            size="medium"
            loading={page.isCreating}
            onClick={page.setUpClinic}
          />
        </Card>
        <Card className="flex flex-col gap-3">
          <h2 className="text-section">{copy.assistantTitle}</h2>
          <p className="text-body text-ink-secondary">{copy.assistantBody}</p>
        </Card>
        <Card className="flex flex-col gap-3">
          <h2 className="text-section">{copy.patientTitle}</h2>
          <p className="text-body text-ink-secondary">{copy.patientBody}</p>
        </Card>
        <button
          type="button"
          onClick={page.backToSignIn}
          className="flex items-center gap-1 self-center text-body font-bold text-ink-secondary"
        >
          <Icon name="chevronLeft" className="size-4" />
          {copy.backToSignIn}
        </button>
      </div>
    </AuthLayout>
  );
}
