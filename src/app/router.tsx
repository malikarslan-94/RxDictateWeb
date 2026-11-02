import { Navigate, Outlet, createBrowserRouter } from 'react-router';

import { Role } from '@/constants/roles';
import { PatientBookingScreen, ScheduleScreen } from '@/features/appointments';
import { Routes } from '@/constants/routes';
import {
  NoClinicScreen,
  SessionGate,
  SignInScreen,
  VerifyCodeScreen,
} from '@/features/auth';
import { LockGate } from '@/features/lock';
import {
  AboutYouScreen,
  AssistantStepScreen,
  LocationStepScreen,
} from '@/features/onboarding';
import { PatientsScreen } from '@/features/patients';
import {
  ConsultScreen,
  PatientHistoryScreen,
  PrescriptionLogScreen,
  TemplateEditorScreen,
} from '@/features/prescription';
import { PrintPreviewScreen, PrintQueueScreen } from '@/features/printing';
import { ReceptionScreen } from '@/features/reception';
import {
  PatientReportsScreen,
  ReportsInboxScreen,
  UploadReportScreen,
} from '@/features/reports';
import {
  AccountScreen,
  LocationsSettingsScreen,
  PrintingSettingsScreen,
  ProfileSettingsScreen,
  SecuritySettingsScreen,
  TeamSettingsScreen,
  VoiceSettingsScreen,
} from '@/features/settings';
import { AppShell, ComingSoonScreen } from '@/features/shell';
import { TemplatesScreen } from '@/features/templates';
import { TodayScreen } from '@/features/today';
import { RxCheckScreen } from '@/features/verification';
import { AppArea } from '@/lib/session';

import { AreaGuard, HomeRedirect, RoleGuard } from './guards';

/**
 * Every page and who may see it. Anyone: checking a printout's QR. Signed
 * out: sign in. A doctor setting up:
 * the three steps. Signed in: the shell, behind the lock, with each role's
 * pages. Anything else goes to where the person starts.
 */
export const router = createBrowserRouter([
  // Public: whoever scans a printout's QR has no account here.
  { path: Routes.rxCheck, element: <RxCheckScreen /> },
  {
    element: <SessionGate />,
    children: [
      {
        element: <AreaGuard area={AppArea.Auth} />,
        children: [
          { path: Routes.signIn, element: <SignInScreen /> },
          { path: Routes.verify, element: <VerifyCodeScreen /> },
          { path: Routes.noClinic, element: <NoClinicScreen /> },
        ],
      },
      {
        element: <AreaGuard area={AppArea.Onboarding} />,
        children: [
          {
            path: Routes.setup,
            element: <Navigate to={Routes.setupAboutYou} replace />,
          },
          { path: Routes.setupAboutYou, element: <AboutYouScreen /> },
          { path: Routes.setupLocation, element: <LocationStepScreen /> },
          { path: Routes.setupAssistant, element: <AssistantStepScreen /> },
        ],
      },
      {
        element: <AreaGuard area={AppArea.App} />,
        children: [
          {
            element: (
              <LockGate>
                <Outlet />
              </LockGate>
            ),
            children: [
              {
                element: <AppShell />,
                children: [
                  {
                    element: <RoleGuard role={Role.doctor} />,
                    children: [
                      { path: Routes.today, element: <TodayScreen /> },
                      { path: Routes.consult, element: <ConsultScreen /> },
                      {
                        path: Routes.prescriptions,
                        element: <PrescriptionLogScreen />,
                      },
                      { path: Routes.reports, element: <ReportsInboxScreen /> },
                      {
                        path: Routes.templates,
                        element: <TemplatesScreen />,
                        children: [
                          {
                            path: Routes.templateNew,
                            element: <TemplateEditorScreen />,
                          },
                          {
                            path: Routes.templateEdit,
                            element: <TemplateEditorScreen />,
                          },
                        ],
                      },
                      {
                        path: Routes.settings,
                        element: (
                          <Navigate to={Routes.settingsProfile} replace />
                        ),
                      },
                      {
                        path: Routes.settingsProfile,
                        element: <ProfileSettingsScreen />,
                      },
                      {
                        path: Routes.settingsLocations,
                        element: <LocationsSettingsScreen />,
                      },
                      {
                        path: Routes.settingsTeam,
                        element: <TeamSettingsScreen />,
                      },
                      {
                        path: Routes.settingsVoice,
                        element: <VoiceSettingsScreen />,
                      },
                      {
                        path: Routes.settingsSecurity,
                        element: <SecuritySettingsScreen />,
                      },
                      {
                        path: Routes.settingsPrinting,
                        element: <PrintingSettingsScreen />,
                      },
                    ],
                  },
                  {
                    element: <RoleGuard role={Role.pa} />,
                    children: [
                      { path: Routes.reception, element: <ReceptionScreen /> },
                      { path: Routes.schedule, element: <ScheduleScreen /> },
                      {
                        path: Routes.printQueue,
                        element: <PrintQueueScreen />,
                      },
                      { path: Routes.account, element: <AccountScreen /> },
                    ],
                  },
                  // Both roles; each sees only its own actions.
                  {
                    path: Routes.patients,
                    element: <PatientsScreen />,
                    children: [
                      {
                        element: <RoleGuard role={Role.doctor} />,
                        children: [
                          {
                            path: Routes.patientHistory,
                            element: <PatientHistoryScreen />,
                          },
                        ],
                      },
                      {
                        path: Routes.patientReports,
                        element: <PatientReportsScreen />,
                      },
                      {
                        path: Routes.patientReportUpload,
                        element: <PatientReportsScreen startWith="upload" />,
                      },
                      {
                        path: Routes.patientBooking,
                        element: <PatientBookingScreen />,
                      },
                    ],
                  },
                  { path: Routes.print, element: <PrintPreviewScreen /> },
                  {
                    path: Routes.reportUpload,
                    element: <UploadReportScreen />,
                  },
                  { path: Routes.comingSoon, element: <ComingSoonScreen /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <HomeRedirect /> },
    ],
  },
]);
