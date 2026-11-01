import { Avatar, BrandMark, Wordmark } from '@/ui';

import { authCopy } from '../copy';

const copy = authCopy.hero;

/** The teal half of the sign-in pages: what the app does, shown by example. */
export function HeroPanel() {
  return (
    <section className="hidden flex-1 flex-col justify-between bg-primary p-14 text-ink-on-primary lg:flex">
      <div className="flex items-center gap-3">
        <BrandMark inverse />
        <Wordmark inverse />
      </div>

      <div className="max-w-readable">
        <h2 className="text-display whitespace-pre-line">{copy.title}</h2>
        <p className="mt-6 text-lead">{copy.body}</p>

        <div className="mt-10 max-w-md rounded-sheet bg-surface p-5 text-ink">
          <div className="flex items-center gap-3">
            <Avatar name={copy.samplePatient} />
            <div>
              <p className="text-body font-bold">{copy.samplePatient}</p>
              <p className="text-meta text-ink-secondary">
                {copy.sampleDetails}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-md bg-primary-tint px-4 py-3">
            <p className="text-meta text-ink-secondary">{copy.youSaid}</p>
            <p className="text-body font-bold">{copy.sampleQuote}</p>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-md border border-border px-4 py-3">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-chip text-primary-strong">
              {copy.sampleSection}
            </span>
            <span className="flex-1 text-body font-bold">
              {copy.sampleMedicine}
            </span>
            <span className="text-body font-bold">{copy.sampleDose}</span>
          </div>
        </div>
      </div>

      <p className="text-meta">{copy.audience}</p>
    </section>
  );
}
