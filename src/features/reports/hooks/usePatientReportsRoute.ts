import { useNavigate, useParams } from 'react-router';

import { Routes } from '@/constants/routes';

/** Reports opened over the Patients page: whose, and the way back. */
export function usePatientReportsRoute() {
  const navigate = useNavigate();
  const { patientId = '' } = useParams<{ patientId: string }>();
  return { patientId, close: () => navigate(Routes.patients) };
}
