import { TeamSection } from '@/features/team';

import { SettingsLayout } from '../components/SettingsLayout';
import { settingsCopy } from '../copy';

/** The clinic's assistants and medicine managers: add, edit, remove. */
export function TeamSettingsScreen() {
  return (
    <SettingsLayout title={settingsCopy.sections.team}>
      <TeamSection />
    </SettingsLayout>
  );
}
