import { Button, Icon, Spinner } from '@/ui';

import { vitalsCopy } from '../copy';
import { useVisitVitals } from '../hooks/useVisitVitals';
import { VitalsDialog } from './VitalsDialog';
import { VitalsReadings } from './VitalsReadings';

export type VisitVitalsProps = {
  visitId: string;
  /** From the visit: null until vitals are saved. */
  recordedAt: Date | null;
};

/** A list row's vitals: the readings to correct, or "Add vitals". */
export function VisitVitals({ visitId, recordedAt }: VisitVitalsProps) {
  const cell = useVisitVitals(visitId, recordedAt);

  return (
    <>
      {cell.readings.length > 0 ? (
        <button
          type="button"
          onClick={cell.open}
          aria-label={cell.editLabel}
          className="rounded-xs px-2 py-1 text-left hover:bg-primary-tint"
        >
          <VitalsReadings readings={cell.readings} compact />
        </button>
      ) : cell.isLoading ? (
        <Spinner className="size-4 text-primary" />
      ) : (
        <Button
          label={vitalsCopy.add}
          size="small"
          variant="tonal"
          icon={<Icon name="activity" className="size-4" />}
          disabled={!cell.canEdit}
          onClick={cell.open}
        />
      )}
      {cell.isOpen ? (
        <VitalsDialog
          vitals={cell.vitals}
          getVisitId={cell.getVisitId}
          onClose={cell.close}
        />
      ) : null}
    </>
  );
}
