import { version } from '../../package.json';

/** The name as the logo writes it: "Rx" in dark teal, "Dictate" in ink. */
export const APP_NAME_PARTS = { lead: 'Rx', rest: 'Dictate' } as const;

/**
 * Product name. index.html and public/site.webmanifest repeat it, since the
 * browser reads them before any of this loads; change all three together.
 */
export const APP_NAME = `${APP_NAME_PARTS.lead}${APP_NAME_PARTS.rest}`;

/** The `version` in package.json, e.g. "1.0.0". */
export const APP_VERSION = version;
