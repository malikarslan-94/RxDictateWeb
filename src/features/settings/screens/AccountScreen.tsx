import { FormInput, PageHeader } from '@/components';
import { LogoutDialog } from '@/features/auth';
import { LockSettingsCard } from '@/features/lock';
import { Avatar, Button, Card, Icon, StatusChip } from '@/ui';

import { settingsCopy } from '../copy';
import { useAccount } from '../hooks/useAccount';
import { useAccountName } from '../hooks/useAccountName';

const copy = settingsCopy.account;

/** The assistant's account: who they are, where they work, this computer. */
export function AccountScreen() {
  const account = useAccount();
  const name = useAccountName();

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader icon="user" meta={copy.eyebrow} title={copy.title} />
      <div className="flex max-w-readable flex-col gap-5">
        <Card className="flex items-center gap-4">
          <Avatar name={name.name} size="lg" tone="warm" />
          <div className="min-w-0 flex-1">
            {name.isEditing ? (
              <form
                onSubmit={name.save}
                noValidate
                className="flex items-start gap-2"
              >
                <FormInput
                  control={name.control}
                  name="name"
                  aria-label={copy.name}
                  autoFocus
                  onKeyDown={name.onKeyDown}
                  containerClassName="min-w-0 flex-1"
                />
                <Button
                  type="submit"
                  label={copy.saveName}
                  size="medium"
                  loading={name.isSaving}
                />
                <Button
                  label={copy.cancelName}
                  variant="text"
                  size="medium"
                  onClick={name.cancel}
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={name.startEdit}
                aria-label={copy.editName}
                title={copy.editName}
                className="group flex items-center gap-2 rounded-md text-left"
              >
                <span className="text-title group-hover:text-primary-strong">
                  {name.name}
                </span>
                <Icon
                  name="pencil"
                  className="size-4 text-ink-secondary group-hover:text-primary-strong"
                />
              </button>
            )}
            <p className="mt-1 text-meta text-ink-secondary">
              {account.roleLine}
            </p>
          </div>
        </Card>
        <Card className="flex flex-col gap-3">
          <h2 className="text-section">{copy.worksAt}</h2>
          <p className="text-body font-bold">{account.clinicName}</p>
          <div className="flex flex-wrap gap-2">
            {account.locations.map((location) => (
              <StatusChip
                key={location.id}
                label={location.name}
                tone="active"
                icon="mapPin"
              />
            ))}
          </div>
          <p className="text-meta text-ink-secondary">{copy.worksAtHint}</p>
        </Card>
        <LockSettingsCard canChangeTime={false} />
        <div className="flex items-center justify-between">
          <Button
            label={copy.logout}
            variant="secondary"
            icon={<Icon name="logOut" className="size-4" />}
            onClick={account.askLogout}
          />
          <p className="text-meta text-ink-secondary">{account.version}</p>
        </div>
      </div>
      {account.isLoggingOut ? (
        <LogoutDialog onClose={account.closeLogout} />
      ) : null}
    </div>
  );
}
