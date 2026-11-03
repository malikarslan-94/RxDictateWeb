import { useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { Action } from '@/constants/roles';
import { useSetting } from '@/features/clinic';
import { useCan } from '@/hooks/useCan';
import { formatPrintDate } from '@/utils/date';

import {
  useGetPatientPortalQuery,
  useRemovePatientLinkMutation,
  useSendPatientInviteMutation,
  useUpdatePatientPortalMutation,
} from '../api';
import { PORTAL_ENABLED_KEY, PortalState } from '../constants';
import { portalCopy } from '../copy';

const copy = portalCopy.patient;

/**
 * One patient's online access: where it stands, and what this person may do
 * about it. Whether a record can link is the server's answer; the setting only
 * says which reason to give when it can't.
 */
export function usePatientAccess(patientId: string) {
  const canRead = useCan(Action['patient.portal.read']);
  const canInvite = useCan(Action['patient.portal.invite']);
  const canManage = useCan(Action['patient.portal.manage']);
  const isClinicOn = useSetting(PORTAL_ENABLED_KEY).value;
  const portal = useGetPatientPortalQuery(canRead ? patientId : skipToken);
  const [sendInvite, inviting] = useSendPatientInviteMutation();
  const [updatePortal, updating] = useUpdatePatientPortalMutation();
  const [removeLink, removing] = useRemovePatientLinkMutation();
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);

  const view = portal.data ?? null;
  const dated = (date: Date | null) => (date ? formatPrintDate(date) : '');
  const status = view?.status;
  const isLinked = status === PortalState.linked;
  const hasLink = isLinked || status === PortalState.dormant;

  const line = !view
    ? null
    : view.blocked
      ? copy.status.blocked
      : !view.available
        ? isClinicOn
          ? copy.status.noPhone
          : copy.status.clinicOff
        : isLinked
          ? copy.status.linked(dated(view.linkedAt))
          : status === PortalState.dormant
            ? copy.status.dormant
            : status === PortalState.invited
              ? copy.status.invited(dated(view.invitedAt))
              : copy.status.none;

  return {
    isShown: canRead && view !== null,
    line,
    canInvite:
      canInvite &&
      view !== null &&
      view.available &&
      !view.blocked &&
      !isLinked,
    inviteLabel: status === PortalState.none ? copy.invite : copy.inviteAgain,
    invite: () => sendInvite(patientId),
    isInviting: inviting.isLoading,
    canManage,
    isBlocked: view?.blocked ?? false,
    setBlocked: (blocked: boolean) => updatePortal({ patientId, blocked }),
    isUpdating: updating.isLoading,
    canRemove: canManage && hasLink,
    isConfirmingRemove,
    askRemove: () => setIsConfirmingRemove(true),
    keep: () => setIsConfirmingRemove(false),
    remove: async () => {
      await removeLink(patientId);
      setIsConfirmingRemove(false);
    },
    isRemoving: removing.isLoading,
  };
}
