import { BrandMark, Button, Card, Wordmark } from '@/ui';

import { portalCopy } from '../copy';
import { useInvitePage } from '../hooks/useInvitePage';

const copy = portalCopy.invitePage;

/**
 * The page an invite's SMS opens, on whatever phone received it: how to get the
 * app, and the code. Outside sign-in, and it shows nothing about any record.
 */
export function InviteScreen() {
  const page = useInvitePage();

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
        <Card padding="medium" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-section">{copy.heading}</h1>
            <p className="text-body text-ink-secondary">{copy.intro}</p>
          </div>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-body">
            {copy.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {page.code ? (
            <section className="flex flex-col gap-2 border-t border-border pt-4">
              <h2 className="text-group text-ink-secondary uppercase">
                {copy.code}
              </h2>
              <p className="text-body font-bold break-all">{page.code}</p>
              <div>
                <Button
                  label={page.copyLabel}
                  variant="secondary"
                  size="small"
                  onClick={page.copyCode}
                />
              </div>
              <p className="text-meta text-ink-secondary">{copy.note}</p>
            </section>
          ) : null}
        </Card>
      </main>
    </div>
  );
}
