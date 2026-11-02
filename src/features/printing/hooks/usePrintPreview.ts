import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Action } from '@/constants/roles';
import { Routes } from '@/constants/routes';
import { RxStatus } from '@/features/prescription';
import { useCan } from '@/hooks/useCan';
import { useNow } from '@/hooks/useNow';
import { formatTimeAgo } from '@/utils/date';

import { printingCopy } from '../copy';
import { usePrintout } from './usePrintout';
import { usePrintSettings } from './usePrintSettings';

/** A minute is fine-grained enough for "approved just now". */
const AGO_TICK_MS = 60_000;

/**
 * The doctor's print preview: the page, this computer's settings, Print,
 * and "Save as template" once it's signed.
 */
export function usePrintPreview() {
  const navigate = useNavigate();
  const canSaveTemplate = useCan(Action['template.create']);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const { id = '' } = useParams<{ id: string }>();
  const printout = usePrintout(id || null);
  const settings = usePrintSettings();
  const now = useNow(AGO_TICK_MS);
  const rx = printout.prescription;
  const copy = printingCopy.preview;

  return {
    printout,
    settings,
    meta: copy.meta([
      printout.patient?.name ?? '',
      rx?.number ?? '',
      rx?.approvedAt
        ? copy.approvedAgo(formatTimeAgo(rx.approvedAt, now))
        : rx
          ? copy.draft
          : '',
    ]),
    back: () => navigate(Routes.today),
    canSaveTemplate: canSaveTemplate && rx?.status === RxStatus.approved,
    templateName:
      rx?.sections.diagnosis.map((item) => item.text).join(', ') ?? '',
    isSavingTemplate,
    saveTemplate: () => setIsSavingTemplate(true),
    closeSaveTemplate: () => setIsSavingTemplate(false),
  };
}
