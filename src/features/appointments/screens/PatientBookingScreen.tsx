import { BookAppointmentDialog } from '../components/BookAppointmentDialog';
import { usePatientBookingRoute } from '../hooks/usePatientBookingRoute';

/** Book an appointment for one patient, over the Patients page. */
export function PatientBookingScreen() {
  const route = usePatientBookingRoute();
  return (
    <BookAppointmentDialog
      preset={{ patientId: route.patientId }}
      onClose={route.close}
    />
  );
}
