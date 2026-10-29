/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del Web App de Google Apps Script (debe terminar en `/exec`). */
  readonly VITE_GOOGLE_SCRIPT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
