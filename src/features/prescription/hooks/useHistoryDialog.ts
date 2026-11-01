import { useState } from 'react';

import { HistoryView } from '@/constants/routes';

import { rxCopy } from '../copy';

/**
 * Which tab the History dialog shows, and whether it's saving a template.
 * A prescription opened from the timeline shows on the first tab.
 */
export function useHistoryDialog(
  initialView: HistoryView,
  selectPrescription: (prescriptionId: string) => void,
) {
  const [view, setView] = useState<HistoryView>(initialView);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  return {
    view,
    views: Object.values(HistoryView).map((value) => ({
      value,
      label: rxCopy.timeline.tabs[value],
    })),
    setView,
    openPrescription: (prescriptionId: string) => {
      selectPrescription(prescriptionId);
      setView(HistoryView.prescriptions);
    },
    isSavingTemplate,
    saveTemplate: () => setIsSavingTemplate(true),
    stopSaving: () => setIsSavingTemplate(false),
  };
}
