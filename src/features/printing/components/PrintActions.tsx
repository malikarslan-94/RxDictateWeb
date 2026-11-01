import { HotkeyLabel } from '@/constants/keys';
import { Button, Icon, Kbd } from '@/ui';

import { printingCopy } from '../copy';
import type { PrintoutState } from '../hooks/usePrintout';

const copy = printingCopy.actions;

/** Print, with the PDF and WhatsApp for sharing. */
export function PrintActions({ printout }: { printout: PrintoutState }) {
  const isReady = printout.printout !== null;
  return (
    <div className="flex flex-col gap-3">
      <Button
        label={copy.print}
        fullWidth
        icon={<Icon name="printer" className="size-4" />}
        disabled={!isReady}
        onClick={printout.print}
      />
      <p className="flex items-center justify-center gap-2 text-meta text-ink-secondary">
        {copy.orPress} <Kbd keys={HotkeyLabel.print} />
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button
          label={copy.pdf}
          variant="secondary"
          icon={<Icon name="download" className="size-4" />}
          disabled={!isReady}
          loading={printout.isOpeningPdf}
          onClick={printout.openPdf}
        />
        <Button
          label={copy.whatsapp}
          variant="secondary"
          icon={<Icon name="share" className="size-4" />}
          disabled={!isReady || !printout.patient?.phone}
          onClick={printout.shareOnWhatsApp}
        />
      </div>
    </div>
  );
}
