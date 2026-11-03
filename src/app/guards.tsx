import { Navigate, Outlet } from 'react-router';

import { Routes, homePath } from '@/constants/routes';
import type { Role } from '@/constants/roles';
import { AppArea, selectActiveRole, selectAppArea } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

/** Where each part of the app sends someone who belongs elsewhere. */
function useAreaHome() {
  const area = useAppSelector(selectAppArea);
  const role = useAppSelector(selectActiveRole);
  const home =
    area === AppArea.Auth
      ? Routes.signIn
      : area === AppArea.Onboarding
        ? Routes.setupAboutYou
        : area === AppArea.Platform
          ? Routes.platform
          : homePath(role);
  return { area, role, home };
}

/** Its pages show only in this part of the app: signed out, setup, in, or the platform. */
export function AreaGuard({ area }: { area: AppArea }) {
  const current = useAreaHome();
  return current.area === area ? (
    <Outlet />
  ) : (
    <Navigate to={current.home} replace />
  );
}

/** Its pages are for these roles; anyone else goes to their own start page. */
export function RoleGuard({ roles }: { roles: readonly Role[] }) {
  const current = useAreaHome();
  return current.role && roles.includes(current.role) ? (
    <Outlet />
  ) : (
    <Navigate to={current.home} replace />
  );
}

/** `/` and unknown paths: wherever this person starts. */
export function HomeRedirect() {
  return <Navigate to={useAreaHome().home} replace />;
}
