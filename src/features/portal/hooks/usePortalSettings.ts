import { settingSourceSchema } from '@/contract';
import { useSetting } from '@/features/clinic';

import {
  InviteMode,
  PORTAL_ENABLED_KEY,
  PORTAL_INVITES_KEY,
} from '../constants';
import { portalCopy } from '../copy';

const copy = portalCopy.settings;
const SettingSource = settingSourceSchema.enum;

/** Settings › Patient access: whether the clinic's patients can link, and how invites go out. */
export function usePortalSettings() {
  const enabled = useSetting(PORTAL_ENABLED_KEY);
  const invites = useSetting(PORTAL_INVITES_KEY);
  const isFixed = (setting: { isLocked: boolean; source: string }) =>
    setting.isLocked && setting.source === SettingSource.platform;
  const isEnabledFixed = isFixed(enabled);
  const isInvitesFixed = isFixed(invites);

  return {
    isEnabled: enabled.value,
    canChangeEnabled: enabled.canSetForClinic && !isEnabledFixed,
    setEnabled: (next: boolean) => enabled.setForClinic(next),
    inviteOptions: [
      {
        value: InviteMode.manual,
        label: copy.invites.manual,
        disabled: isInvitesFixed,
      },
      {
        value: InviteMode.auto,
        label: copy.invites.auto,
        disabled: isInvitesFixed,
      },
    ],
    inviteMode: invites.value,
    inviteHint: copy.invitesHint[invites.value],
    setInviteMode: (next: typeof invites.value) => invites.setForClinic(next),
    note: isEnabledFixed || isInvitesFixed ? copy.fixedByPlatform : null,
    isSaving: enabled.isSaving || invites.isSaving,
  };
}
