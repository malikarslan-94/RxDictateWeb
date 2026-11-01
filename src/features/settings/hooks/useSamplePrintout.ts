import type { LocationView } from '@/contract';
import {
  samplePrintout,
  scheduleLine,
  toLocationForm,
  useGetMeQuery,
  useGetPracticeQuery,
} from '@/features/clinic';
import type { Printout } from '@/types/printout';

/** A made-up prescription under one location's real header. */
export function useSamplePrintout(
  location: LocationView | undefined,
): Printout | null {
  const me = useGetMeQuery();
  const practice = useGetPracticeQuery();
  if (!location) return null;
  const { days, opensAt, closesAt } = toLocationForm(location);

  return samplePrintout({
    doctorName: me.data?.name ?? '',
    qualifications: practice.data?.qualifications.join(', ') ?? '',
    speciality: practice.data?.speciality ?? '',
    pmdcNo: practice.data?.pmdcNo ?? '',
    clinicName: location.name,
    address: location.address,
    phone: location.phone,
    schedule:
      location.timings.length > 0 ? scheduleLine(days, opensAt, closesAt) : '',
  });
}
