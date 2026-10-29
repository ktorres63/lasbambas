import {
  afpCommissionOptions,
  availabilityOptions,
  bankOptions,
  countryOptions,
  englishLevelOptions,
  maritalStatusOptions,
  pensionSystemOptions,
  yesNoOptions,
  type SelectOption,
} from '../data/personnelEntry'
import type { PersonnelEntryValues } from '../schemas/personnelEntry'

/** Valor admitido en una columna de la hoja de cálculo. */
export type SheetValue = string | number

/** Fila que se envía a Google Sheets: clave = nombre de la columna. */
export type SheetPayload = Record<string, SheetValue>

/** Resultado del envío al Web App de Google Apps Script. */
export type SubmissionResult =
  | { status: 'success' }
  /** La petición salió, pero el navegador no pudo leer la respuesta (CORS). */
  | { status: 'unverified' }
  | { status: 'not-configured' }
  | { status: 'error'; message: string }

/**
 * URL del Web App de Google Apps Script.
 * Se lee en tiempo de compilación desde `.env` (VITE_GOOGLE_SCRIPT_URL).
 * Al llevar el prefijo VITE_ acaba en el bundle: no es un secreto, solo la URL pública.
 */
const scriptUrl = (import.meta.env.VITE_GOOGLE_SCRIPT_URL ?? '').trim()

/** Indica si la variable de entorno está definida y parece un Web App válido. */
export const isGoogleScriptConfigured =
  scriptUrl.length > 0 && /^https:\/\/script\.google\.com\/.+/.test(scriptUrl)

const REQUEST_TIMEOUT_MS = 20_000

/** Texto legible de una opción; si el código no existe se devuelve el valor tal cual. */
function optionLabel(options: SelectOption[], value: string): string {
  if (!value) return ''
  return options.find((option) => option.value === value)?.label ?? value
}

/** Convierte valores opcionales (undefined / null) en cadena vacía. */
function text(value: string | number | undefined): string {
  return value === undefined || value === null ? '' : String(value)
}

/** Identificador único por envío: evita filas duplicadas si se reintenta la petición. */
function createSubmissionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/** Fecha y hora local en formato ISO con desfase, útil para ordenar en la hoja. */
function timestamp(): string {
  const now = new Date()
  const offset = -now.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const pad = (value: number) => String(Math.floor(Math.abs(value))).padStart(2, '0')
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return `${local.toISOString().slice(0, 19)}${sign}${pad(offset / 60)}:${pad(offset % 60)}`
}

function formatChildren(children: PersonnelEntryValues['children']): string {
  return children
    .filter((child) => child.fullName.trim() !== '' || child.age !== undefined)
    .map((child) => {
      const name = child.fullName.trim() || 'Sin nombre'
      return child.age === undefined ? name : `${name} (${child.age} años)`
    })
    .join(' | ')
}

function formatEmergencyContacts(
  contacts: PersonnelEntryValues['emergencyContacts'],
): string {
  return contacts
    .filter((contact) => contact.fullName.trim() !== '' || contact.mobile.trim() !== '')
    .map((contact) => {
      const phones = [
        contact.fixedPhone.trim() ? `fijo ${contact.fixedPhone.trim()}` : '',
        contact.mobile.trim() ? `celular ${contact.mobile.trim()}` : '',
      ].filter(Boolean)
      const name = contact.fullName.trim() || 'Sin nombre'
      return phones.length > 0 ? `${name} (${phones.join(', ')})` : name
    })
    .join(' | ')
}

function formatPreviousCompanies(
  companies: PersonnelEntryValues['previousCompanies'],
): string {
  return companies
    .filter(
      (company) => company.company.trim() !== '' || company.position.trim() !== '',
    )
    .map((company) => {
      const name = company.company.trim() || 'Sin empresa'
      return company.position.trim() ? `${name} — ${company.position.trim()}` : name
    })
    .join(' | ')
}

/**
 * Convierte los valores del formulario en una fila plana con nombres de columna
 * legibles (las opciones se guardan con su etiqueta, no con el código interno).
 * El orden de las claves es el orden de las columnas en la hoja.
 */
export function buildSheetPayload(values: PersonnelEntryValues): SheetPayload {
  return {
    'ID de envío': createSubmissionId(),
    'Fecha de envío': timestamp(),

    // A. Datos personales
    'Nombres completos': values.fullName,
    DNI: values.dni,
    'Fecha de nacimiento': values.birthDate,
    Nacionalidad:
      values.nationality === 'otra'
        ? values.nationalityOther.trim()
        : optionLabel(countryOptions, values.nationality),
    Dirección: values.address,
    Distrito: values.district,
    Provincia: values.province,
    'Teléfono fijo': values.fixedPhone,
    Celular: values.mobile,
    'Sistema previsional': optionLabel(pensionSystemOptions, values.pensionSystem),
    'Comisión AFP': optionLabel(afpCommissionOptions, values.afpCommission),
    'Estado civil': optionLabel(maritalStatusOptions, values.maritalStatus),
    Cónyuge: values.spouseName,
    'Correo personal': values.personalEmail,
    'Correo Telrad': values.telradEmail,
    'Talla de zapato': values.shoeSize,
    'Talla de camisa': values.shirtSize,
    'Talla de pantalón': values.pantsSize,
    'Tiene hijos': optionLabel(yesNoOptions, values.hasChildren),
    Hijos: formatChildren(values.children),
    'Contactos de emergencia': formatEmergencyContacts(values.emergencyContacts),
    'Empresas anteriores': formatPreviousCompanies(values.previousCompanies),

    // B. Antecedentes académicos y profesionales
    'Título académico': values.academicTitle,
    'Institución académica': values.academicInstitution,
    '¿Estudia actualmente?': optionLabel(yesNoOptions, values.isStudying),
    'Carrera actual': values.currentCareer,
    'Año de ingreso': text(values.entryYear),
    'Institución adicional': values.additionalInstitution,
    Banco: optionLabel(bankOptions, values.bankName),
    'Número de cuenta': values.bankAccount,
    CCI: values.cci,
    'Banco CTS': optionLabel(bankOptions, values.ctsBank),

    // C. Satisfacción laboral
    'Le gusta de su trabajo': values.satisfactionMost,
    'No le gusta de su trabajo': values.satisfactionLeast,
    'Qué necesita para mejorar': values.satisfactionNeeds,

    // D. Autocalificación
    Fortalezas: values.strengths,
    'Aspectos a desarrollar': values.developmentAreas,

    // E. Logros
    'Mayor logro': values.greatestAchievement,

    // F. Expectativa salarial
    'Expectativa salarial mensual (S/)': text(values.monthlySalaryExpectation),

    // G. Nivel de inglés
    'Nivel de inglés': optionLabel(englishLevelOptions, values.englishLevel),

    // H. Disponibilidad
    Disponibilidad: optionLabel(availabilityOptions, values.availability),
    'Disponible desde': values.availableFrom,
  }
}

/**
 * Envía la ficha de ingreso al Web App de Google Apps Script.
 *
 * El cuerpo se manda como `text/plain` a propósito: `application/json` obliga al
 * navegador a lanzar una petición de verificación (preflight OPTIONS) que Apps
 * Script no responde, y el envío fallaría por CORS. Con texto plano la petición
 * es "simple", se realiza sin preflight y Apps Script la lee desde
 * `e.postData.contents`.
 */
export async function submitPersonnelEntry(
  values: PersonnelEntryValues,
): Promise<SubmissionResult> {
  if (!isGoogleScriptConfigured) {
    return { status: 'not-configured' }
  }

  const body = JSON.stringify(buildSheetPayload(values))
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',
      signal: controller.signal,
    })

    const raw = await response.text()

    let parsed: unknown = null
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = null
    }

    // El script responde { ok: false, error: '...' } ante un fallo controlado.
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      (parsed as { ok?: unknown }).ok === false
    ) {
      const message = (parsed as { error?: unknown }).error
      return {
        status: 'error',
        message:
          typeof message === 'string' && message.trim() !== ''
            ? message
            : 'El servicio rechazó el envío.',
      }
    }

    if (!response.ok) {
      return {
        status: 'error',
        message: `El servicio respondió con el código ${response.status}.`,
      }
    }

    return { status: 'success' }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        status: 'error',
        message: 'La solicitud tardó demasiado. Revisa tu conexión e inténtalo otra vez.',
      }
    }

    /*
     * Si la respuesta no se puede leer por CORS, la fila puede haberse guardado
     * igualmente. Se reintenta en modo `no-cors` (sin leer la respuesta) y, como
     * el script descarta los IDs de envío repetidos, no se duplica el registro.
     */
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
      })
      return { status: 'unverified' }
    } catch {
      return {
        status: 'error',
        message:
          'No se pudo conectar con el servicio de envío. Revisa tu conexión e inténtalo otra vez.',
      }
    }
  } finally {
    window.clearTimeout(timeout)
  }
}
