/**
 * Cliente HTTP para la gestión de documentos de postulantes en MineraBackend
 * (Cloudflare Workers + D1 + R2).
 */

const rawBaseUrl = import.meta.env.VITE_API_URL ?? ''
export const API_BASE_URL = rawBaseUrl.trim().replace(/\/+$/, '')

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(buildApiUrl('/api/health'), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return response.ok
  } catch {
    return false
  }
}

export interface BackendApplicantDTO {
  id: string
  dni: string
  fullName: string
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export interface BackendDocumentMetadataDTO {
  id: string
  applicantId: string
  applicationId: string | null
  fileName: string
  mimeType: string
  sizeBytes: number
  documentType: string
  uploadedBy: string | null
  createdAt: string
  downloadPath: string
}

interface ApiApplicantWithDocuments {
  applicant: BackendApplicantDTO
  documents: BackendDocumentMetadataDTO[]
}

export interface StoredApplicantDocument {
  id: string
  title: string
  description: string
  fileName: string
  mimeType: string
  blob?: Blob
  backendDocumentId?: string
  downloadPath?: string
}

export interface StoredApplicant {
  dni: string
  fullName: string
  documents: StoredApplicantDocument[]
  updatedAt: string
}

const REQUIREMENT_METADATA: Record<
  string,
  { title: string; description: string; order: number }
> = {
  'ingreso-cese': {
    title: 'Ingreso y cese de personal',
    description: 'Lineamientos del proceso de ingreso y cese de personal.',
    order: 0,
  },
  'cartilla-acreditacion': {
    title: 'Cartilla de acreditación de personal',
    description: 'Resumen de los requisitos para la acreditación de personal.',
    order: 1,
  },
  'procedimiento-acreditacion': {
    title: 'Procedimiento de acreditación de personal',
    description:
      'Procedimiento completo para la acreditación de personal contratista.',
    order: 2,
  },
  'carta-responsabilidad': {
    title: 'Carta de liberación de responsabilidad',
    description:
      'Formato de liberación de responsabilidad para el ingreso a la operación.',
    order: 3,
  },
}

function mapBackendDocument(
  doc: BackendDocumentMetadataDTO,
): StoredApplicantDocument {
  const meta = REQUIREMENT_METADATA[doc.documentType]
  return {
    id: doc.id,
    title: meta?.title ?? doc.fileName,
    description:
      meta?.description ?? `Documento registrado (${doc.documentType}).`,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    backendDocumentId: doc.id,
    downloadPath: doc.downloadPath,
  }
}

function mapBackendApplicantEntry(
  entry: ApiApplicantWithDocuments,
): StoredApplicant {
  const sortedDocs = [...entry.documents].sort((a, b) => {
    const orderA = REQUIREMENT_METADATA[a.documentType]?.order ?? 99
    const orderB = REQUIREMENT_METADATA[b.documentType]?.order ?? 99
    if (orderA !== orderB) return orderA - orderB
    return b.createdAt.localeCompare(a.createdAt)
  })

  const latestDocDate = entry.documents.reduce(
    (latest, doc) => (doc.createdAt > latest ? doc.createdAt : latest),
    entry.applicant.updatedAt,
  )

  return {
    dni: entry.applicant.dni,
    fullName: entry.applicant.fullName,
    updatedAt: latestDocDate,
    documents: sortedDocs.map(mapBackendDocument),
  }
}

async function extractErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    if (typeof body?.message === 'string' && body.message.trim().length > 0) {
      return body.message
    }
  } catch {
    // Ignorar error de parseo JSON
  }
  return fallback
}

/**
 * Obtiene un postulante y sus documentos por DNI desde `GET /api/applicants/:dni/documents`.
 * Devuelve `null` si el backend responde 404.
 */
export async function getStoredApplicant(
  dni: string,
): Promise<StoredApplicant | null> {
  const normalizedDni = dni.trim()
  const response = await fetch(
    buildApiUrl(`/api/applicants/${encodeURIComponent(normalizedDni)}/documents`),
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        'No se pudo consultar los documentos del postulante.',
      ),
    )
  }

  const payload = (await response.json()) as {
    status: string
    data: ApiApplicantWithDocuments
  }

  return mapBackendApplicantEntry(payload.data)
}

/**
 * Lista todos los postulantes con documentos registrados desde `GET /api/applicants`.
 */
export async function listStoredApplicants(): Promise<StoredApplicant[]> {
  const response = await fetch(buildApiUrl('/api/applicants'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        'No se pudieron cargar los registros de postulantes.',
      ),
    )
  }

  const payload = (await response.json()) as {
    status: string
    data: ApiApplicantWithDocuments[]
  }

  return payload.data
    .map(mapBackendApplicantEntry)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

/**
 * Sube los documentos de un postulante a `POST /api/recruiter/documents`.
 * Si el DNI ya tenía documentos previos, los reemplaza eliminando los anteriores
 * una vez que los nuevos se hayan subido con éxito.
 */
export async function saveStoredApplicant(
  applicant: StoredApplicant,
): Promise<void> {
  const normalizedDni = applicant.dni.trim()
  const existing = await getStoredApplicant(normalizedDni)
  const previousDocIds =
    existing?.documents
      .map((doc) => doc.backendDocumentId ?? doc.id)
      .filter(Boolean) ?? []

  const uploadedDocIds: string[] = []
  const fullName =
    applicant.fullName.trim() || `Postulante DNI ${normalizedDni}`

  try {
    for (const doc of applicant.documents) {
      if (!doc.blob) {
        throw new Error(`Falta el archivo para "${doc.title}".`)
      }

      const normalizedFile =
        doc.blob instanceof File && doc.blob.type === 'application/pdf'
          ? doc.blob
          : new File([doc.blob], doc.fileName, {
              type: doc.mimeType || 'application/pdf',
            })

      const formData = new FormData()
      formData.append('dni', normalizedDni)
      formData.append('fullName', fullName)
      formData.append('documentType', doc.id)
      formData.append('uploadedBy', 'rrhh-web')
      formData.append('file', normalizedFile, doc.fileName)

      const response = await fetch(buildApiUrl('/api/recruiter/documents'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(
          await extractErrorMessage(
            response,
            `No se pudo subir el documento "${doc.title}".`,
          ),
        )
      }

      const result = (await response.json()) as {
        data?: { document?: { id?: string } }
      }
      if (result.data?.document?.id) {
        uploadedDocIds.push(result.data.document.id)
      }
    }
  } catch (error) {
    // Revertir subidas parciales si alguno de los 4 archivos falla
    await Promise.allSettled(
      uploadedDocIds.map((id) =>
        fetch(buildApiUrl(`/api/documents/${encodeURIComponent(id)}`), {
          method: 'DELETE',
        }),
      ),
    )
    throw error
  }

  // Eliminar los documentos anteriores que fueron reemplazados
  if (previousDocIds.length > 0) {
    await Promise.allSettled(
      previousDocIds.map((id) =>
        fetch(buildApiUrl(`/api/documents/${encodeURIComponent(id)}`), {
          method: 'DELETE',
        }),
      ),
    )
  }
}

/**
 * Elimina todos los documentos asociados a un DNI usando `DELETE /api/documents/:id`.
 */
export async function deleteStoredApplicant(dni: string): Promise<void> {
  const normalizedDni = dni.trim()
  const existing = await getStoredApplicant(normalizedDni)
  if (!existing || existing.documents.length === 0) {
    return
  }

  const responses = await Promise.all(
    existing.documents.map((doc) => {
      const docId = doc.backendDocumentId ?? doc.id
      return fetch(buildApiUrl(`/api/documents/${encodeURIComponent(docId)}`), {
        method: 'DELETE',
      })
    }),
  )

  const failed = responses.find((res) => !res.ok && res.status !== 404)
  if (failed) {
    throw new Error(
      await extractErrorMessage(
        failed,
        'No se pudieron eliminar todos los documentos del postulante.',
      ),
    )
  }
}
