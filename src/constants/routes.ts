import { Role } from './roles';

/** Every page path. Navigate with these, never with a typed-out string. */
export const Routes = {
  signIn: '/sign-in',
  verify: '/verify',
  noClinic: '/no-clinic',
  /**
   * Public, outside sign-in: what a printout's QR opens, to check it against
   * what the doctor approved. clinic-api's VERIFY_BASE_URL points here.
   */
  rxCheck: '/v/:code',
  /**
   * Public, outside sign-in: what an invite's SMS opens. clinic-api's
   * INVITE_BASE_URL points here.
   */
  invite: '/i/:code',

  setup: '/setup',
  setupAboutYou: '/setup/about-you',
  setupLocation: '/setup/location',
  setupAssistant: '/setup/assistant',

  /** RxDictate's own team: the admin console, a holding page for now. */
  platform: '/platform',

  // Doctor
  today: '/today',
  consult: '/consult/:patientId',
  /** The History log: every prescription at this location. */
  prescriptions: '/prescriptions',
  print: '/prescriptions/:id/print',
  /** Reports and labs: patients with reports waiting to be seen. */
  reports: '/reports',
  templates: '/templates',
  /** Over Templates: the editor, for a new template or one of them. */
  templateNew: '/templates/new',
  templateEdit: '/templates/:templateId',
  settings: '/settings',
  settingsProfile: '/settings/profile',
  settingsLocations: '/settings/locations',
  settingsTeam: '/settings/team',
  settingsVoice: '/settings/voice',
  settingsSecurity: '/settings/security',
  settingsPrinting: '/settings/printing',
  settingsMedicines: '/settings/medicines',
  settingsPatientAccess: '/settings/patient-access',

  // Both
  patients: '/patients',
  /** Over Patients: a patient's earlier prescriptions (doctor only). */
  patientHistory: '/patients/:patientId/history',
  /** Over Patients: a patient's reports, or straight to uploading one. */
  patientReports: '/patients/:patientId/reports',
  patientReportUpload: '/patients/:patientId/reports/upload',
  /** Over Patients: book an appointment for a patient. */
  patientBooking: '/patients/:patientId/book',
  reportUpload: '/reports/upload',

  // Assistant
  reception: '/reception',
  schedule: '/schedule',
  printQueue: '/print-queue',
  account: '/account',

  // Medicine manager
  medicines: '/medicines',

  comingSoon: '/coming-soon',
} as const;

/** `/consult/abc?visitId=def` for one patient (and visit, when known). */
export function consultPath(patientId: string, visitId?: string | null) {
  const path = Routes.consult.replace(':patientId', patientId);
  return visitId ? `${path}?visitId=${visitId}` : path;
}

/** The History dialog's two tabs; `?view=` picks the one it opens on. */
export const HistoryView = {
  prescriptions: 'prescriptions',
  timeline: 'timeline',
} as const;
export type HistoryView = (typeof HistoryView)[keyof typeof HistoryView];

/** `/patients/abc/history?rx=def`, opened at one prescription when given. */
export function patientHistoryPath(patientId: string, rxId?: string) {
  const path = Routes.patientHistory.replace(':patientId', patientId);
  return rxId ? `${path}?rx=${rxId}` : path;
}

/** `/patients/abc/history?view=timeline`: everything on record, newest first. */
export function patientTimelinePath(patientId: string) {
  const path = Routes.patientHistory.replace(':patientId', patientId);
  return `${path}?view=${HistoryView.timeline}`;
}

export function patientReportsPath(patientId: string) {
  return Routes.patientReports.replace(':patientId', patientId);
}

export function patientReportUploadPath(patientId: string) {
  return Routes.patientReportUpload.replace(':patientId', patientId);
}

export function patientBookingPath(patientId: string) {
  return Routes.patientBooking.replace(':patientId', patientId);
}

export function templateEditPath(templateId: string) {
  return Routes.templateEdit.replace(':templateId', templateId);
}

export function printPath(prescriptionId: string) {
  return Routes.print.replace(':id', prescriptionId);
}

/**
 * Where each role starts: the doctor's Today, the assistant's list, the
 * medicine manager's clinic list. Any other
 * role has no pages here yet, and a page outside the role guards can't loop.
 */
export function homePath(role: Role | null) {
  if (role === Role.doctor) return Routes.today;
  if (role === Role.pa) return Routes.reception;
  if (role === Role.medicineManager) return Routes.medicines;
  return Routes.comingSoon;
}
