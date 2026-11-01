import { TeamSection } from '@/features/team';

import { SettingsLayout } from '../components/SettingsLayout';
import { settingsCopy } from '../copy';

/** The clinic's assistants: add, edit where they work, remove. */
export function TeamSettingsScreen() {
  return (
    <SettingsLayout title={settingsCopy.sections.team}>
      <TeamSection />
    </SettingsLayout>
  );
}
