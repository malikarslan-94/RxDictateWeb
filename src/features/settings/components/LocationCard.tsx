import { Button, Card, Icon, StatusChip } from '@/ui';

import { settingsCopy } from '../copy';
import type { LocationCardItem } from '../types';

const copy = settingsCopy.locations;

export type LocationCardProps = {
  location: LocationCardItem;
};

/** One place the doctor works: where, when, who's there. */
export function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-sm bg-primary-soft text-primary-strong">
          <Icon name="building" className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-section">{location.name}</h2>
            {location.isDefault ? (
              <StatusChip label={copy.default} tone="active" />
            ) : null}
          </div>
          {location.address ? (
            <p className="text-meta text-ink-secondary">{location.address}</p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <p className="flex items-start gap-2 text-body">
          <Icon name="clock" className="mt-0.5 size-4 text-ink-secondary" />
          {location.hours}
        </p>
        <div className="flex items-start gap-2">
          <Icon name="user" className="mt-0.5 size-4 text-ink-secondary" />
          <div>
            <p className="text-meta text-ink-secondary">{copy.assistant}</p>
            <p className="text-body">{location.assistants}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          label={copy.edit}
          variant="secondary"
          size="small"
          icon={<Icon name="pencil" className="size-4" />}
          onClick={location.edit}
        />
        <Button
          label={copy.preview}
          variant="text"
          size="small"
          icon={<Icon name="printer" className="size-4" />}
          onClick={location.preview}
        />
      </div>
    </Card>
  );
}
