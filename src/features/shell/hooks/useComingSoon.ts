import { useNavigate } from 'react-router';

import { commonCopy } from '@/constants/copy';
import { Role } from '@/constants/roles';
import { Routes } from '@/constants/routes';
import { selectActiveRole } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

const copy = commonCopy.comingSoon;

/** What's on the way for this role, and the way back to their list. */
export function useComingSoon() {
  const navigate = useNavigate();
  const isDoctor = useAppSelector(selectActiveRole) === Role.doctor;
  return {
    body: isDoctor ? copy.doctorBody : copy.assistantBody,
    backLabel: isDoctor ? copy.backDoctor : copy.backAssistant,
    back: () => navigate(isDoctor ? Routes.today : Routes.reception),
  };
}
