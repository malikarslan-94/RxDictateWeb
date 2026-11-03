import { SETTINGS, patientPortalStateSchema } from '@/contract';

/** The clinic's two settings for its patients' online access. */
export const PORTAL_ENABLED_KEY = 'portal.enabled';
export const PORTAL_INVITES_KEY = 'portal.invites';

/** `InviteMode.manual`, `.auto`. */
export const InviteMode = SETTINGS[PORTAL_INVITES_KEY].schema.enum;

/** `PortalState.none`, `.invited`, `.linked`, `.dormant`. */
export const PortalState = patientPortalStateSchema.enum;
