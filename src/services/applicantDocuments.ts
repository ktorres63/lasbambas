import {
  buildApiUrl,
  getStoredApplicant,
  type StoredApplicantDocument,
} from './documentRepository'

/**
 * Consulta de documentos del postulante conectada a MineraBackend.
 */
export interface ApplicantDocumentRequirement {
  id: string
  title: string
  description: string
}

export type ApplicantDocument = ApplicantDocumentRequirement & {
  fileName: string
  href: string
  /** Indica que la URL fue creada con un Blob local y debe revocarse. */
  objectUrl?: boolean
}

/** Los cuatro documentos obligatorios asociados a cada postulante. */
export const REQUIRED_APPLICANT_DOCUMENTS: ApplicantDocumentRequirement[] = [
  {
    id: 'ingreso-cese',
    title: 'Ingreso y cese de personal',
    description: 'Lineamientos del proceso de ingreso y cese de personal.',
  },
  {
    id: 'cartilla-acreditacion',
    title: 'Cartilla de acreditación de personal',
    description: 'Resumen de los requisitos para la acreditación de personal.',
  },
  {
    id: 'procedimiento-acreditacion',
    title: 'Procedimiento de acreditación de personal',
    description:
      'Procedimiento completo para la acreditación de personal contratista.',
  },
  {
    id: 'carta-responsabilidad',
    title: 'Carta de liberación de responsabilidad',
    description:
      'Formato de liberación de responsabilidad para el ingreso a la operación.',
  },
]

function mapApplicantDocument(
  document: StoredApplicantDocument,
): ApplicantDocument {
  if (document.downloadPath) {
    const separator = document.downloadPath.includes('?') ? '&' : '?'
    return {
      id: document.id,
      title: document.title,
      description: document.description,
      fileName: document.fileName,
      href: buildApiUrl(`${document.downloadPath}${separator}inline=true`),
    }
  }

  if (document.blob) {
    return {
      id: document.id,
      title: document.title,
      description: document.description,
      fileName: document.fileName,
      href: URL.createObjectURL(document.blob),
      objectUrl: true,
    }
  }

  return {
    id: document.id,
    title: document.title,
    description: document.description,
    fileName: document.fileName,
    href: buildApiUrl(`/api/documents/${encodeURIComponent(document.id)}/download?inline=true`),
  }
}

/**
 * Consulta `GET /api/applicants/:dni/documents` en MineraBackend y devuelve
 * los documentos asociados al DNI o `null` si no existe o no tiene documentos (404).
 */
export async function getApplicantDocuments(
  dni: string,
): Promise<ApplicantDocument[] | null> {
  const normalizedDni = dni.trim()

  const storedApplicant = await getStoredApplicant(normalizedDni)
  if (!storedApplicant || storedApplicant.documents.length === 0) {
    return null
  }

  return storedApplicant.documents.map(mapApplicantDocument)
}
