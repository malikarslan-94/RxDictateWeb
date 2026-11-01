import { useListLocationsQuery } from '@/features/clinic';
import { usePrintSettings } from '@/features/printing';
import { selectActiveLocationId } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

import { useSamplePrintout } from './useSamplePrintout';

/** Settings › Printing: this computer's choices beside the page they make. */
export function usePrintingSettings() {
  const settings = usePrintSettings();
  const locationId = useAppSelector(selectActiveLocationId);
  const locations = useListLocationsQuery();
  const location = locations.data?.find((item) => item.id === locationId);

  return { settings, printout: useSamplePrintout(location) };
}
