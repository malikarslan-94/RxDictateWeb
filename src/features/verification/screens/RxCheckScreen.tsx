import { commonCopy } from '@/constants/copy';
import { Banner, BrandMark, Button, Card, Spinner, Wordmark } from '@/ui';

import { CheckedMedicines } from '../components/CheckedMedicines';
import { CheckState } from '../constants';
import { verificationCopy as copy } from '../copy';
import { useRxCheck } from '../hooks/useRxCheck';

/**
 * The page a printout's QR opens, on whatever phone scanned it: genuine,
 * replaced or not found, and what the doctor approved. Outside sign-in.
 */
export function RxCheckScreen() {
  const check = useRxCheck();
  const isFound =
    check.state === CheckState.valid || check.state === CheckState.replaced;

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <main className="mx-auto flex max-w-xl flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrandMark />
            <Wordmark />
          </div>
          <p className="text-meta font-bold text-ink-secondary">{copy.title}</p>
        </header>

        {check.state === CheckState.loading ? (
          <p className="flex items-center justify-center gap-3 py-12 text-body text-ink-secondary">
            <Spinner />
            {copy.checking}
          </p>
        ) : null}

        {check.state === CheckState.error ? (
          <Banner
            tone="danger"
            action={
              <Button
                label={commonCopy.retry}
                variant="text"
                size="small"
                onClick={check.retry}
              />
            }
          >
            {check.error}
          </Banner>
        ) : null}

        {check.state === CheckState.notFound ? (
          <Banner tone="danger">
            <p className="font-bold">{copy.notFound.title}</p>
            <p>{copy.notFound.line}</p>
          </Banner>
        ) : null}

        {check.state === CheckState.valid ? (
          <Banner tone="success">
            <p className="font-bold">{copy.valid.title}</p>
            <p>{check.summary}</p>
          </Banner>
        ) : null}

        {check.state === CheckState.replaced ? (
          <Banner tone="warning">
            <p className="font-bold">{copy.replaced.title}</p>
            <p>{check.summary}</p>
          </Banner>
        ) : null}

        {isFound && check.doctor && check.clinic ? (
          <Card padding="medium" className="flex flex-col gap-4">
            <p className="text-section">{check.rxId}</p>
            <section className="flex flex-col gap-1">
              <h2 className="text-group text-ink-secondary uppercase">
                {copy.sections.doctor}
              </h2>
              <p className="text-body font-bold">{check.doctor.name}</p>
              <p className="text-meta text-ink-secondary">
                {check.doctor.detail}
              </p>
              <p className="text-meta text-ink-secondary">
                {check.doctor.pmdc}
              </p>
            </section>
            <section className="flex flex-col gap-1">
              <h2 className="text-group text-ink-secondary uppercase">
                {copy.sections.clinic}
              </h2>
              <p className="text-body font-bold">{check.clinic.name}</p>
              <p className="text-meta text-ink-secondary">
                {check.clinic.address}
              </p>
            </section>
            <section className="flex flex-col gap-1">
              <h2 className="text-group text-ink-secondary uppercase">
                {copy.sections.patient}
              </h2>
              <p className="text-body">{check.patient}</p>
            </section>
          </Card>
        ) : null}

        {check.medicines.length > 0 ? (
          <CheckedMedicines medicines={check.medicines} />
        ) : null}

        {isFound ? (
          <p className="text-meta text-ink-secondary">{copy.compare}</p>
        ) : null}
      </main>
    </div>
  );
}
