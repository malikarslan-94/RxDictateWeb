/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The API root including /api/v1, for a deployed build. */
  readonly VITE_API_URL?: string;
}
