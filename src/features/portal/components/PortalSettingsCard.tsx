import { Card, Segmented, Switch } from '@/ui';

import { portalCopy } from '../copy';
import { usePortalSettings } from '../hooks/usePortalSettings';

const copy = portalCopy.settings;

/** Whether this clinic's patients can see their records, and how invites go out. */
export function PortalSettingsCard() {
  const settings = usePortalSettings();

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-section">{copy.title}</h2>
        <p className="text-body text-ink-secondary">{copy.body}</p>
      </div>
      <div className="flex items-start justify-between gap-4 border-t border-border pt-4">
        <div>
          <p className="text-body font-bold">{copy.enabled}</p>
          <p className="text-meta text-ink-secondary">{copy.enabledHint}</p>
        </div>
        <Switch
          label={copy.enabled}
          checked={settings.isEnabled}
          disabled={!settings.canChangeEnabled || settings.isSaving}
          onChange={settings.setEnabled}
        />
      </div>
      {settings.isEnabled ? (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-label">{copy.invitesLabel}</p>
          <div>
            <Segmented
              label={copy.invitesLabel}
              options={settings.inviteOptions}
              value={settings.inviteMode}
              onChange={settings.setInviteMode}
            />
          </div>
          <p className="text-meta text-ink-secondary">{settings.inviteHint}</p>
        </div>
      ) : null}
      {settings.note ? (
        <p className="text-meta text-ink-secondary">{settings.note}</p>
      ) : null}
    </Card>
  );
}
