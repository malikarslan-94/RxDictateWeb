import { LogoutDialog } from '@/features/auth';
import { LockSettingsCard } from '@/features/lock';
import { Button, Card, Icon, StatusChip } from '@/ui';

import { SettingsLayout } from '../components/SettingsLayout';
import { settingsCopy } from '../copy';
import { useSecuritySettings } from '../hooks/useSecuritySettings';

const copy = settingsCopy.security;

/** Locking this computer, and where the doctor is signed in. */
export function SecuritySettingsScreen() {
  const security = useSecuritySettings();

  return (
    <SettingsLayout title={settingsCopy.sections.security}>
      <LockSettingsCard canChangeTime />
      <Card className="flex flex-col gap-4">
        <h2 className="text-section">{copy.signedIn}</h2>
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-sm bg-neutral-soft text-ink-secondary">
            <Icon name="lock" className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body font-bold">{security.device}</p>
            <p className="text-meta text-ink-secondary">{security.keptLine}</p>
          </div>
          <Button
            label={copy.logout}
            variant="secondary"
            size="small"
            icon={<Icon name="logOut" className="size-4" />}
            onClick={security.askLogout}
          />
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <p className="text-body text-ink-secondary">{copy.logoutAll}</p>
          <StatusChip label={copy.soon} tone="neutral" />
        </div>
      </Card>
      {security.isLoggingOut ? (
        <LogoutDialog onClose={security.closeLogout} />
      ) : null}
    </SettingsLayout>
  );
}
