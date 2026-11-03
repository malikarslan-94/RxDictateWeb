import { MedicineLists, MedicineSourceCard } from '@/features/medicines';

import { SettingsLayout } from '../components/SettingsLayout';
import { settingsCopy } from '../copy';

/** What a doctor is suggested while writing, and the lists behind it. */
export function MedicinesSettingsScreen() {
  return (
    <SettingsLayout title={settingsCopy.sections.medicines}>
      <MedicineSourceCard />
      <MedicineLists />
    </SettingsLayout>
  );
}
