import { useNavigate, useParams, useSearchParams } from 'react-router';

import { HistoryView, Routes } from '@/constants/routes';

/** History opened over the Patients page: whose, which first, and back. */
export function usePatientHistoryRoute() {
  const navigate = useNavigate();
  const { patientId = '' } = useParams<{ patientId: string }>();
  const [search] = useSearchParams();
  return {
    patientId,
    initialId: search.get('rx'),
    initialView:
      search.get('view') === HistoryView.timeline
        ? HistoryView.timeline
        : HistoryView.prescriptions,
    close: () => navigate(Routes.patients),
  };
}
