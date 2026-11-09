/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del Web App de Google Apps Script (debe terminar en `/exec`). */
  readonly VITE_GOOGLE_SCRIPT_URL?: string
  /** URL base del backend de documentos. Vacío usa el proxy de Vite en desarrollo. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
