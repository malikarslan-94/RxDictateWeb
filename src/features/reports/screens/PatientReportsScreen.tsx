import { PatientReportsDialog } from '../components/PatientReportsDialog';
import type { ReportsStart } from '../hooks/usePatientReportsDialog';
import { usePatientReportsRoute } from '../hooks/usePatientReportsRoute';

export type PatientReportsScreenProps = {
  startWith?: ReportsStart;
};

/** A patient's reports, or the upload form, over the Patients page. */
export function PatientReportsScreen({ startWith }: PatientReportsScreenProps) {
  const route = usePatientReportsRoute();
  return (
    <PatientReportsDialog
      patientId={route.patientId}
      startWith={startWith}
      onClose={route.close}
    />
  );
}
