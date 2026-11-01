import type { AuthMode } from './constants';

/** What Sign in hands the code screen, in the router's history state. */
export type VerifyState = {
  phone: string;
  mode: AuthMode;
  keepSignedIn: boolean;
  devCode?: string;
};

/** Set when the code screen sends the user back: an error code to explain. */
export type SignInState = {
  reason?: string;
  mode?: AuthMode;
};

/** What "not linked to a clinic" shows. */
export type NoClinicState = { phone: string };
