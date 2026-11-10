/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del Web App de Google Apps Script (debe terminar en `/exec`). */
  readonly VITE_GOOGLE_SCRIPT_URL?: string
  /** URL base del backend desplegado. Vacío usa el proxy local de Vite. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
