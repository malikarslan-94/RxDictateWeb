import { Banner, Button, Dialog, Icon } from '@/ui';

import { authCopy } from '../copy';
import { useLogoutDialog } from '../hooks/useLogoutDialog';

export type LogoutDialogProps = {
  onClose: () => void;
};

/** Confirm before logging out of this computer. */
export function LogoutDialog({ onClose }: LogoutDialogProps) {
  const dialog = useLogoutDialog(onClose);
  return (
    <Dialog
      title={authCopy.logout.title}
      description={dialog.body}
      onClose={dialog.close}
      actions={
        <>
          <Button
            label={authCopy.logout.cancel}
            variant="secondary"
            onClick={dialog.close}
          />
          <Button
            label={authCopy.logout.confirm}
            variant="destructive"
            icon={<Icon name="logOut" className="size-4" />}
            loading={dialog.isSigningOut}
            onClick={dialog.confirm}
          />
        </>
      }
    >
      {dialog.pendingWarning ? (
        <Banner tone="warning">{dialog.pendingWarning}</Banner>
      ) : null}
    </Dialog>
  );
}
