import type { ChipTone, IconName } from '@/ui';

/** One row of Today's list, ready to show. */
export type TodayRow = {
  id: string;
  token: number;
  name: string;
  /** "31 · F · MR-10188". */
  details: string;
  /** "10:20 am". */
  added: string;
  status: { label: string; tone: ChipTone; icon: IconName };
  /** Start, Continue or View, and where it goes. */
  action: {
    label: string;
    kind: 'start' | 'continue' | 'view';
    open: () => void;
  };
  isCurrent: boolean;
};
