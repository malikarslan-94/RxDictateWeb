import { PageHeader } from '@/components';

import { MedicineLists } from '../components/MedicineLists';
import { MedicineSourceCard } from '../components/MedicineSourceCard';
import { medicinesCopy as copy } from '../copy';

/** The medicine manager's page: the clinic's list and its doctors' mode. */
export function ClinicMedicinesScreen() {
  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader icon="pill" title={copy.title} meta={copy.meta} />
      <div className="flex max-w-4xl flex-col gap-5">
        <MedicineSourceCard />
        <MedicineLists />
      </div>
    </div>
  );
}
