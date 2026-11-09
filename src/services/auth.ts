import { buildApiUrl } from './documentRepository'

const SESSION_STORAGE_KEY = 'lasbambas-auth-session'
export const AUTH_CHANGE_EVENT = 'lasbambas-auth-change'

export interface AuthUser {
  email: string
  name: string
  role: 'recruiter' | 'admin'
}

export interface AuthSession {
  token: string
  user: AuthUser
}

function notifyAuthChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT))
  }
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.token || !parsed?.user?.email) return null
    return parsed
  } catch {
    return null
  }
}

export function saveStoredSession(session: AuthSession): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  notifyAuthChange()
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
  notifyAuthChange()
}

export function getAuthHeaders(): Record<string, string> {
  const session = getStoredSession()
  if (!session?.token) return {}
  return {
    Authorization: `Bearer ${session.token}`,
  }
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<AuthSession> {
  let response: Response
  try {
    response = await fetch(buildApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password }),
    })
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor de autenticación. Verifica que MineraBackend esté en ejecución.',
    )
  }

  let payload: {
    status?: string
    message?: string
    data?: AuthSession
  } = {}

  try {
    payload = (await response.json()) as typeof payload
  } catch {
    // Ignore JSON parse error
  }

  if (!response.ok || !payload.data?.token) {
    throw new Error(
      payload.message || 'Correo electrónico o contraseña incorrectos.',
    )
  }

  saveStoredSession(payload.data)
  return payload.data
}

export async function verifyCurrentSession(): Promise<AuthUser | null> {
  const session = getStoredSession()
  if (!session) return null

  try {
    const response = await fetch(buildApiUrl('/api/auth/me'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
    })

    if (response.status === 401) {
      clearStoredSession()
      return null
    }

    if (!response.ok) {
      return session.user
    }

    const payload = (await response.json()) as {
      data?: { user?: AuthUser }
    }
    return payload.data?.user ?? session.user
  } catch {
    // Si hay un corte momentáneo de red, conservamos la sesión local
    return session.user
  }
}
