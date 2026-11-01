import { useState } from 'react';

import { useTemplateList } from './useTemplateList';

export type UseTemplatePickerOptions = {
  /** Apply it; true once it's on the prescription. */
  onPick: (templateId: string) => Promise<boolean>;
  onClose: () => void;
};

/** Pick a template in the consult; the list closes once it's applied. */
export function useTemplatePicker({
  onPick,
  onClose,
}: UseTemplatePickerOptions) {
  const list = useTemplateList();
  const [pickingId, setPickingId] = useState<string | null>(null);

  return {
    ...list,
    rows: list.items.map((item) => ({
      ...item,
      isPicking: pickingId === item.id,
      pick: async () => {
        if (pickingId) return;
        setPickingId(item.id);
        const isApplied = await onPick(item.id);
        setPickingId(null);
        if (isApplied) onClose();
      },
    })),
    isBusy: pickingId !== null,
  };
}
