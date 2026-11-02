import { AuthLayout, LogoutDialog } from '@/features/auth';
import { Button, Icon } from '@/ui';

import { adminCopy } from '../copy';
import { useAdminHome } from '../hooks/useAdminHome';

/** The platform's area: a holding page until the admin console exists. */
export function AdminHomeScreen() {
  const page = useAdminHome();
  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary-tint text-primary-strong">
          <Icon name="users" className="size-6" />
        </span>
        <div>
          <h1 className="text-screen-title">{page.title}</h1>
          <p className="mt-2 text-body text-ink-secondary">{page.role}</p>
        </div>
        <p className="text-body">{adminCopy.coming}</p>
        <Button
          label={adminCopy.logout}
          variant="secondary"
          icon={<Icon name="logOut" className="size-4" />}
          onClick={page.askLogout}
        />
      </div>
      {page.isLoggingOut ? <LogoutDialog onClose={page.closeLogout} /> : null}
    </AuthLayout>
  );
}
