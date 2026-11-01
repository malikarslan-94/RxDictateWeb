export { PatientsScreen } from './screens/PatientsScreen';
export { PatientPickerDialog } from './components/PatientPickerDialog';
export { AddPatientDialog } from './components/AddPatientDialog';
export { FormPatientField } from './components/FormPatientField';
export type { FormPatientFieldProps } from './components/FormPatientField';

export {
  useCreatePatientMutation,
  useGetPatientQuery,
  useSearchPatientsQuery,
} from './api';
export { usePatientSearch } from './hooks/usePatientSearch';
export {
  ageField,
  optionalPhoneField,
  patientNameField,
  sexField,
} from './schemas';
export type { PatientPage, PatientSearch } from './api';
export { patientLine, searchQuery } from './utils';
