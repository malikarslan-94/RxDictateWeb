import { useState } from 'react';
import { useMatch, useNavigate } from 'react-router';

import { Hotkeys } from '@/constants/keys';
import { Role } from '@/constants/roles';
import { Routes } from '@/constants/routes';
import { useLocationSwitcher } from '@/features/clinic';
import { useNewReportsCount } from '@/features/reports';
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
  const switcher = useLocationSwitcher({ canManage: isDoctor });
  const badges: Partial<Record<NavEntry['key'], number>> = {
    reports: useNewReportsCount(isDoctor),
  };
  const [dialog, setDialog] = useState<ShellDialog | null>(null);
  const isConsulting = useMatch(Routes.consult) !== null;

  // Ctrl K starts a prescription from anywhere.
  useHotkey(Hotkeys.search, () => setDialog('picker'), isDoctor);

  return {
    isDoctor,
    isCompact: isConsulting,
    isLiveInterrupted,
    clinicName: membership?.practiceName ?? '',
    userName: user?.name ?? '',
    roleLabel: isDoctor ? shellCopy.doctor : shellCopy.assistant,
    nav: isDoctor ? DOCTOR_NAV : ASSISTANT_NAV,
    soon: isDoctor ? DOCTOR_SOON : ASSISTANT_SOON,
    /** A count beside a menu line: patients with reports to see. */
    badges,
    switcher,
    // A doctor opens it even with one location, to reach "Manage locations".
    canOpenSwitcher: switcher.canSwitch || isDoctor,
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
