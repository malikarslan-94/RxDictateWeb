import { PastRxDialog } from '../components/PastRxDialog';
import { usePatientHistoryRoute } from '../hooks/usePatientHistoryRoute';

/** A patient's earlier prescriptions and timeline, over the Patients page. */
export function PatientHistoryScreen() {
  const route = usePatientHistoryRoute();
  return (
    <PastRxDialog
      patientId={route.patientId}
      visitId={null}
      initialId={route.initialId}
      initialView={route.initialView}
      onClose={route.close}
    />
  );
}
