import { useState } from 'react';
import { useMatch, useNavigate } from 'react-router';

import { commonCopy } from '@/constants/copy';
import { Hotkeys } from '@/constants/keys';
import { Action, Role } from '@/constants/roles';
import { Routes } from '@/constants/routes';
import { useLocationSwitcher } from '@/features/clinic';
import { useNewReportsCount } from '@/features/reports';
import { useCan } from '@/hooks/useCan';
import { useHotkey } from '@/hooks/useHotkey';
import { selectIsLiveInterrupted } from '@/lib/realtime';
import {
  selectActiveMembership,
  selectActiveRole,
  selectUser,
} from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

import {
  ASSISTANT_NAV,
  ASSISTANT_SOON,
  DOCTOR_NAV,
  DOCTOR_SOON,
  MANAGER_NAV,
  MANAGER_SOON,
} from '../constants';
import type { NavEntry } from '../constants';
import { shellCopy } from '../copy';

type ShellDialog = 'picker' | 'addPatient' | 'logout';

/**
 * The frame around every signed-in page: the menu for this role, where
 * they're working, and the actions that sit in it. The consult page has
 * its own queue, so the menu folds to icons there.
 */
export function useShell() {
  const navigate = useNavigate();
  const role = useAppSelector(selectActiveRole);
  const user = useAppSelector(selectUser);
  const membership = useAppSelector(selectActiveMembership);
  const isLiveInterrupted = useAppSelector(selectIsLiveInterrupted);
  const isDoctor = role === Role.doctor;
  const isManager = role === Role.medicineManager;
  const canManageLocations = useCan(Action['location.update']);
  const canPrescribe = useCan(Action['prescription.create']);
  const canAddPatient = useCan(Action['patient.create']);
  // A medicine manager's work is the whole clinic's, not one place's.
  const worksAtLocation = useCan(Action['visit.read']);
  const canReviewReports = useCan(Action['report.review']);
  const switcher = useLocationSwitcher({ canManage: canManageLocations });
  const badges: Partial<Record<NavEntry['key'], number>> = {
    reports: useNewReportsCount(canReviewReports),
  };
  const [dialog, setDialog] = useState<ShellDialog | null>(null);
  const isConsulting = useMatch(Routes.consult) !== null;

  // Ctrl K starts a prescription from anywhere.
  useHotkey(Hotkeys.search, () => setDialog('picker'), canPrescribe);

  return {
    canManageLocations,
    canPrescribe,
    canAddPatient,
    worksAtLocation,
    isCompact: isConsulting,
    isLiveInterrupted,
    clinicName: membership?.practiceName ?? '',
    userName: user?.name ?? '',
    roleLabel: role ? commonCopy.roles[role] : '',
    nav: isDoctor ? DOCTOR_NAV : isManager ? MANAGER_NAV : ASSISTANT_NAV,
    soon: isDoctor ? DOCTOR_SOON : isManager ? MANAGER_SOON : ASSISTANT_SOON,
    /** A count beside a menu line: patients with reports to see. */
    badges,
    switcher,
    // Whoever manages locations opens it even with one, for "Manage locations".
    canOpenSwitcher: switcher.canSwitch || canManageLocations,
    manageLocations: () => {
      switcher.close();
      navigate(Routes.settingsLocations);
    },
    /** The doctor's "New prescription": pick the patient first. */
    startPrescription: () => setDialog('picker'),
    /** The assistant's "Add patient": the form, over whatever page this is. */
    addPatient: () => setDialog('addPatient'),
    /** Their own page: the doctor's profile and signature, or My account. */
    openProfile: () =>
      navigate(isDoctor ? Routes.settingsProfile : Routes.account),
    profileLabel: isDoctor ? shellCopy.yourProfile : shellCopy.yourAccount,
    isPicking: dialog === 'picker',
    isAddingPatient: dialog === 'addPatient',
    isLoggingOut: dialog === 'logout',
    askLogout: () => setDialog('logout'),
    closeDialog: () => setDialog(null),
  };
}

export type Shell = ReturnType<typeof useShell>;
