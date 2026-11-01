import type { LocationView } from '@/contract';
import { usePrintSettings } from '@/features/printing';

import { settingsCopy } from '../copy';
import { useSamplePrintout } from './useSamplePrintout';

/** One location's header on a sample page, as this computer prints. */
export function useLetterheadPreview(location: LocationView) {
  const { options } = usePrintSettings();
  return {
    title: settingsCopy.locations.previewTitle(location.name),
    printout: useSamplePrintout(location),
    options,
  };
}
