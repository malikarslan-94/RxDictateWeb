import { PortalSettingsCard } from '@/features/portal';

import { SettingsLayout } from '../components/SettingsLayout';
import { settingsCopy } from '../copy';

/** Whether this clinic's patients can see their records online. */
export function PatientAccessSettingsScreen() {
  return (
    <SettingsLayout title={settingsCopy.sections.patientAccess}>
      <PortalSettingsCard />
    </SettingsLayout>
  );
}
