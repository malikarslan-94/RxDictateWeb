import { PrintPreview } from '@/components';
import { PrintSettingsCard } from '@/features/printing';
import { Card } from '@/ui';

import { SettingsLayout } from '../components/SettingsLayout';
import { settingsCopy } from '../copy';
import { usePrintingSettings } from '../hooks/usePrintingSettings';

/** This computer's print choices, beside the page they make. */
export function PrintingSettingsScreen() {
  const page = usePrintingSettings();

  return (
    <SettingsLayout title={settingsCopy.sections.printing}>
      <p className="text-body text-ink-secondary">
        {settingsCopy.printing.subtitle}
      </p>
      <div className="flex items-start gap-5">
        <div className="w-96 shrink-0">
          <PrintSettingsCard settings={page.settings} />
        </div>
        {page.printout ? (
          <Card padding="medium" className="min-w-0 flex-1">
            <PrintPreview
              printout={page.printout}
              options={page.settings.options}
            />
          </Card>
        ) : null}
      </div>
    </SettingsLayout>
  );
}
