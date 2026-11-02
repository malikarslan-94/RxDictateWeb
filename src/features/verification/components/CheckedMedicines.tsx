import { Card } from '@/ui';

import { verificationCopy as copy } from '../copy';
import type { toCheckedMedicine } from '../utils';

export type CheckedMedicinesProps = {
  medicines: ReturnType<typeof toCheckedMedicine>[];
};

/** The medicines as approved, each with its dose in English and Urdu. */
export function CheckedMedicines({ medicines }: CheckedMedicinesProps) {
  return (
    <Card padding="medium" className="flex flex-col gap-3">
      <h2 className="text-group text-ink-secondary uppercase">
        {copy.sections.medicines}
      </h2>
      <ul className="flex flex-col divide-y divide-border">
        {medicines.map((medicine) => (
          <li key={medicine.key} className="flex flex-col gap-1 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body font-bold">{medicine.title}</p>
              <p className="shrink-0 text-meta text-ink-secondary">
                {medicine.duration}
              </p>
            </div>
            <p className="text-body">{medicine.en}</p>
            <p
              dir="rtl"
              lang="ur"
              className="font-urdu text-body leading-loose"
            >
              {medicine.ur}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
