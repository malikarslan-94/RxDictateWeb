import { SignOutReason, selectUser } from '@/lib/session';
import { useSignOut } from '@/features/auth';
import { useAppSelector } from '@/store/hooks';
import { formatE164 } from '@/utils/phone';

import { SETUP_STEPS, SetupStep } from '../constants';

import { onboardingCopy } from '../copy';
import { selectDoctorProfile } from '../slice';

/** The frame around setup: who's signed in, and how far along they are. */
export function useSetupShell(current: SetupStep) {
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectDoctorProfile);
  const { signOut } = useSignOut();
  const currentIndex = SETUP_STEPS.findIndex((item) => item.step === current);

  return {
    signedInAs: onboardingCopy.signedInAs(formatE164(user?.phone ?? '')),
    notYou: () => signOut({ reason: SignOutReason.User }),
    steps: SETUP_STEPS.map((item, index) => ({
      key: item.step,
      number: index + 1,
      title: onboardingCopy.steps[item.step].title,
      // A finished first step shows who they said they are.
      detail:
        item.step === SetupStep.AboutYou && index < currentIndex && profile
          ? profile.fullName
          : onboardingCopy.steps[item.step].detail,
      isDone: index < currentIndex,
      isCurrent: index === currentIndex,
    })),
  };
}
