import { StateMessage } from '@/components';
import { Button, Icon } from '@/ui';

import { LetterheadPreviewDialog } from '../components/LetterheadPreviewDialog';
import { LocationCard } from '../components/LocationCard';
import { LocationDialog } from '../components/LocationDialog';
import { SettingsLayout } from '../components/SettingsLayout';
import { settingsCopy } from '../copy';
import { useLocationsSettings } from '../hooks/useLocationsSettings';

const copy = settingsCopy.locations;

/** Every place the doctor works, each with its own list, hours and header. */
export function LocationsSettingsScreen() {
  const page = useLocationsSettings();

  return (
    <SettingsLayout
      title={settingsCopy.sections.locations}
      actions={
        <Button
          label={copy.add}
          icon={<Icon name="plus" className="size-4" />}
          onClick={page.add}
        />
      }
    >
      <p className="max-w-readable text-body text-ink-secondary">
        {copy.subtitle}
      </p>
      <StateMessage
        isLoading={page.isLoading}
        error={page.error}
        onRetry={page.retry}
      />
      <div className="grid grid-cols-2 gap-5">
        {page.cards.map((card) => (
          <LocationCard key={card.id} location={card} />
        ))}
      </div>

      {page.isAdding ? (
        <LocationDialog location={null} onClose={page.close} />
      ) : null}
      {page.editing ? (
        <LocationDialog
          key={page.editing.id}
          location={page.editing}
          onClose={page.close}
        />
      ) : null}
      {page.previewing ? (
        <LetterheadPreviewDialog
          location={page.previewing}
          onClose={page.close}
        />
      ) : null}
    </SettingsLayout>
  );
}
