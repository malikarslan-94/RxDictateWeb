import { Routes } from '@/constants/routes';
import type { IconName } from '@/ui';

import type { shellCopy } from './copy';

export type NavEntry = {
  key: keyof typeof shellCopy.nav;
  icon: IconName;
  path: string;
};

export const DOCTOR_NAV: readonly NavEntry[] = [
  { key: 'today', icon: 'home', path: Routes.today },
  { key: 'patients', icon: 'users', path: Routes.patients },
  { key: 'history', icon: 'history', path: Routes.prescriptions },
  { key: 'reports', icon: 'flask', path: Routes.reports },
  { key: 'templates', icon: 'template', path: Routes.templates },
  { key: 'settings', icon: 'settings', path: Routes.settings },
];

/** Shown under "Coming soon"; each opens the Coming soon page. */
export const DOCTOR_SOON: readonly NavEntry[] = [];

export const ASSISTANT_NAV: readonly NavEntry[] = [
  { key: 'today', icon: 'home', path: Routes.reception },
  { key: 'patients', icon: 'users', path: Routes.patients },
  { key: 'schedule', icon: 'calendar', path: Routes.schedule },
  { key: 'printQueue', icon: 'printer', path: Routes.printQueue },
  { key: 'uploadReports', icon: 'upload', path: Routes.reportUpload },
  { key: 'account', icon: 'user', path: Routes.account },
];

export const ASSISTANT_SOON: readonly NavEntry[] = [];
