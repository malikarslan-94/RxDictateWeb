import { Routes } from '@/constants/routes';
import type { IconName } from '@/ui';

/** Settings' menu, in order. */
export const SETTINGS_SECTIONS: readonly {
  key:
    | 'profile'
    | 'locations'
    | 'team'
    | 'medicines'
    | 'voice'
    | 'security'
    | 'printing';
  icon: IconName;
  path: string;
}[] = [
  { key: 'profile', icon: 'user', path: Routes.settingsProfile },
  { key: 'locations', icon: 'mapPin', path: Routes.settingsLocations },
  { key: 'team', icon: 'users', path: Routes.settingsTeam },
  { key: 'medicines', icon: 'pill', path: Routes.settingsMedicines },
  { key: 'voice', icon: 'mic', path: Routes.settingsVoice },
  { key: 'security', icon: 'shield', path: Routes.settingsSecurity },
  { key: 'printing', icon: 'printer', path: Routes.settingsPrinting },
];

/** How long dictation audio is kept after approval, in days. */
export const AUDIO_RETENTION_CHOICES = [7, 30, 90] as const;

/** Ties the Save button in a dialog's footer to the form above it. */
export const LOCATION_FORM_ID = 'location-form';
