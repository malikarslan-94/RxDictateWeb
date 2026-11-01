import { Outlet } from 'react-router';

import { LogoutDialog } from '@/features/auth';
import { AddPatientDialog, PatientPickerDialog } from '@/features/patients';

import { useShell } from '../hooks/useShell';
import { LiveNotice } from './LiveNotice';
import { Sidebar } from './Sidebar';

/** Every signed-in page: the menu on the left, the page beside it. */
export function AppShell() {
  const shell = useShell();
  return (
    <div className="flex h-screen bg-bg">
      <Sidebar shell={shell} />
      <div className="flex min-w-0 flex-1 flex-col">
        {shell.isLiveInterrupted ? <LiveNotice /> : null}
        {/* Positioned, so nothing absolutely placed inside can stretch the window. */}
        <main className="relative min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      {shell.isPicking ? (
        <PatientPickerDialog onClose={shell.closeDialog} />
      ) : null}
      {shell.isAddingPatient ? (
        <AddPatientDialog onClose={shell.closeDialog} />
      ) : null}
      {shell.isLoggingOut ? <LogoutDialog onClose={shell.closeDialog} /> : null}
    </div>
  );
}
