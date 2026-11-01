import type { PrescriptionStatus } from '@/contract';
import { StatusChip } from '@/ui';

import { RxStatus } from '../constants';

export type RxStatusChipProps = {
  status: PrescriptionStatus;
  label: string;
};

/** Where a prescription stands: being written, signed, or set aside. */
export function RxStatusChip({ status, label }: RxStatusChipProps) {
  if (status === RxStatus.draft) {
    return <StatusChip label={label} tone="active" icon="pencil" />;
  }
  if (status === RxStatus.approved) {
    return <StatusChip label={label} tone="ready" icon="check" />;
  }
  return <StatusChip label={label} tone="neutral" />;
}
