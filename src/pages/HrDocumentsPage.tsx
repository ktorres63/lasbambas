import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  LoaderCircle,
  Save,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import Modal from '../components/ui/Modal'
import {
  deleteStoredApplicant,
  listStoredApplicants,
  saveStoredApplicant,
  type StoredApplicant,
} from '../services/documentRepository'
import { REQUIRED_APPLICANT_DOCUMENTS } from '../services/applicantDocuments'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const EMPTY_FILES: (File | null)[] = REQUIRED_APPLICANT_DOCUMENTS.map(() => null)

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

export default function HrDocumentsPage() {
  const [fullName, setFullName] = useState('')
  const [dni, setDni] = useState('')
  const [files, setFiles] = useState<(File | null)[]>(EMPTY_FILES)
  const [fullNameError, setFullNameError] = useState<string | null>(null)
  const [dniError, setDniError] = useState<string | null>(null)
  const [filesError, setFilesError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [applicants, setApplicants] = useState<StoredApplicant[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState(false)
  const [applicantToDelete, setApplicantToDelete] =
    useState<StoredApplicant | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fullNameInputRef = useRef<HTMLInputElement>(null)
  const dniInputRef = useRef<HTMLInputElement>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let active = true

    listStoredApplicants()
      .then((storedApplicants) => {
        if (active) setApplicants(storedApplicants)
      })
      .catch(() => {
        if (active) setListError(true)
      })
      .finally(() => {
        if (active) setListLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const clearForm = () => {
    setFullName('')
    setDni('')
    setFiles(EMPTY_FILES)
    setFullNameError(null)
    setDniError(null)
    setFilesError(null)
    fileInputRefs.current.forEach((input) => {
      if (input) input.value = ''
    })
  }

  const onFileChange = (index: number, file: File | null) => {
    setSuccessMessage(null)
    setGeneralError(null)

    if (!file) {
      setFiles((current) =>
        current.map((item, itemIndex) => (itemIndex === index ? null : item)),
      )
      return
    }

    if (!isPdf(file)) {
      setGeneralError(`“${file.name}” no es un archivo PDF.`)
      if (fileInputRefs.current[index]) fileInputRefs.current[index]!.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setGeneralError(
        `“${file.name}” supera el tamaño máximo de 5 MB permitido por archivo.`,
      )
      if (fileInputRefs.current[index]) fileInputRefs.current[index]!.value = ''
      return
    }

    setFilesError(null)
    setFiles((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? file : item)),
    )
  }

  const removeFile = (index: number) => {
    setFiles((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? null : item)),
    )
    setSuccessMessage(null)

    if (fileInputRefs.current[index]) fileInputRefs.current[index]!.value = ''
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFullNameError(null)
    setDniError(null)
    setFilesError(null)
    setGeneralError(null)
    setSuccessMessage(null)

    const normalizedFullName = fullName.trim().replace(/\s+/g, ' ')
    const normalizedDni = dni.trim()
    let firstInvalidInput: HTMLInputElement | null = null
    let invalid = false

    if (!normalizedFullName) {
      setFullNameError('Ingresa el nombre completo del postulante.')
      firstInvalidInput = fullNameInputRef.current
      invalid = true
    }

    if (!/^\d{8}$/.test(normalizedDni)) {
      setDniError('El DNI debe contener exactamente 8 dígitos.')
      firstInvalidInput ??= dniInputRef.current
      invalid = true
    }

    if (files.some((file) => file === null)) {
      setFilesError('Debes adjuntar los cuatro documentos PDF.')
      invalid = true
    }

    if (invalid) {
      firstInvalidInput?.focus()
      return
    }

    setIsSaving(true)

    try {
      await saveStoredApplicant({
        dni: normalizedDni,
        fullName: normalizedFullName,
        updatedAt: new Date().toISOString(),
        documents: REQUIRED_APPLICANT_DOCUMENTS.map((requirement, index) => {
          const file = files[index] as File
          return {
            ...requirement,
            fileName: file.name,
            mimeType: file.type || 'application/pdf',
            blob: file,
          }
        }),
      })

      setApplicants(await listStoredApplicants())
      setSuccessMessage(
        `Los cuatro documentos de ${normalizedFullName} (DNI ${normalizedDni}) se guardaron correctamente.`,
      )
      clearForm()
    } catch (error) {
      setGeneralError(
        error instanceof Error && error.message
          ? error.message
          : 'No se pudieron guardar los documentos. Verifica la conexión con el servidor e inténtalo nuevamente.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!applicantToDelete) return

    setIsDeleting(true)
    setListError(false)

    try {
      await deleteStoredApplicant(applicantToDelete.dni)
      setApplicants((current) =>
        current.filter((applicant) => applicant.dni !== applicantToDelete.dni),
      )
      setApplicantToDelete(null)
    } catch {
      setListError(true)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="bg-[#f4f4f4] px-[15px] pb-20 pt-[140px] lg:pt-[170px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[760px]">
            <p className="mb-2 text-[14px] uppercase tracking-[2px] text-brand-red">
              Recursos Humanos
            </p>
            <h1 className="text-[32px] font-light leading-[38px] text-brand-ink lg:text-[40px] lg:leading-[46px]">
              Gestión de <strong className="font-black">documentos</strong>
            </h1>
            <p className="mt-4 text-[15px] leading-[24px] text-[#555]">
              Registra el nombre y DNI de un postulante, y asocia sus cuatro documentos
              PDF para que pueda consultarlos.
            </p>
          </div>

          <Link
            to="/postulante/documentos"
            className="inline-flex w-fit items-center gap-2 border border-brand-ink px-4 py-2.5 text-[12px] font-bold uppercase tracking-[1px] text-brand-ink transition-colors hover:bg-brand-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            Vista del postulante
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

       
        <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <form
            noValidate
            onSubmit={onSubmit}
            className="border border-[#dedede] bg-white p-6 shadow-[0_10px_35px_rgba(35,31,32,0.05)] sm:p-8"
          >
            <div className="flex items-start gap-4 border-b border-[#eee] pb-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-red text-[13px] font-black text-white">
                01
              </span>
              <div>
                <h2 className="text-[20px] font-black leading-6 text-brand-ink">
                  Asociar documentos
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-[#666]">
                  Ingresa el nombre y el DNI del postulante, luego adjunta los
                  cuatro PDF solicitados.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="hr-applicant-name"
                  className="mb-2 block text-[12px] font-bold uppercase tracking-[1.5px] text-brand-ink"
                >
                  Nombre completo
                </label>
                <input
                  ref={fullNameInputRef}
                  id="hr-applicant-name"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value)
                    setFullNameError(null)
                    setSuccessMessage(null)
                  }}
                  placeholder="Nombres y apellidos"
                  aria-invalid={fullNameError ? true : undefined}
                  aria-describedby={
                    fullNameError
                      ? 'hr-applicant-name-error'
                      : 'hr-applicant-name-hint'
                  }
                  className={`h-12 w-full border bg-white px-4 text-[15px] text-brand-ink outline-none transition-colors placeholder:text-[#9a9a9a] focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 ${
                    fullNameError ? 'border-brand-red' : 'border-[#cfcfcf]'
                  }`}
                />
                {fullNameError ? (
                  <p
                    id="hr-applicant-name-error"
                    role="alert"
                    className="mt-2 text-[12px] leading-4 text-brand-red"
                  >
                    {fullNameError}
                  </p>
                ) : (
                  <p
                    id="hr-applicant-name-hint"
                    className="mt-2 text-[12px] leading-4 text-[#777]"
                  >
                    Se guardará junto con los documentos del postulante.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="hr-applicant-dni"
                  className="mb-2 block text-[12px] font-bold uppercase tracking-[1.5px] text-brand-ink"
                >
                  DNI del postulante
                </label>
                <input
                  ref={dniInputRef}
                  id="hr-applicant-dni"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  value={dni}
                  onChange={(event) => {
                    setDni(event.target.value)
                    setDniError(null)
                    setSuccessMessage(null)
                  }}
                  placeholder="Ingresa 8 dígitos"
                  aria-invalid={dniError ? true : undefined}
                  aria-describedby={
                    dniError ? 'hr-applicant-dni-error' : 'hr-applicant-dni-hint'
                  }
                  className={`h-12 w-full border bg-white px-4 text-[15px] tracking-[1px] text-brand-ink outline-none transition-colors placeholder:tracking-normal placeholder:text-[#9a9a9a] focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 ${
                    dniError ? 'border-brand-red' : 'border-[#cfcfcf]'
                  }`}
                />
                {dniError ? (
                  <p
                    id="hr-applicant-dni-error"
                    role="alert"
                    className="mt-2 text-[12px] leading-4 text-brand-red"
                  >
                    {dniError}
                  </p>
                ) : (
                  <p
                    id="hr-applicant-dni-hint"
                    className="mt-2 text-[12px] leading-4 text-[#777]"
                  >
                    Si el DNI ya existe, sus datos serán reemplazados.
                  </p>
                )}
              </div>
            </div>

            <fieldset className="mt-8">
              <legend className="text-[12px] font-bold uppercase tracking-[1.5px] text-brand-ink">
                Documentos PDF
              </legend>
              <p className="mt-2 text-[12px] leading-5 text-[#777]">
                Los cuatro documentos son obligatorios. Máximo 5 MB por archivo.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {REQUIRED_APPLICANT_DOCUMENTS.map((requirement, index) => {
                  const file = files[index]

                  return (
                    <li
                      key={requirement.id}
                      className={`flex min-w-0 flex-col border p-4 transition-colors ${
                        file
                          ? 'border-brand-red/40 bg-[#fffafa]'
                          : 'border-[#dedede] bg-[#fafafa]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-brand-red">
                          Documento {String(index + 1).padStart(2, '0')}
                        </span>
                        <FileText
                          aria-hidden="true"
                          className={`h-4 w-4 ${
                            file ? 'text-brand-red' : 'text-[#aaa]'
                          }`}
                        />
                      </div>

                      <p className="mt-3 min-h-10 text-[13px] font-bold leading-5 text-brand-ink">
                        {requirement.title}
                      </p>

                      <label
                        htmlFor={`hr-document-${index}`}
                        className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-[#cfcfcf] bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[1px] text-brand-ink transition-colors hover:border-brand-red hover:text-brand-red focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-red"
                      >
                        <UploadCloud aria-hidden="true" className="h-4 w-4" />
                        {file ? 'Reemplazar PDF' : 'Seleccionar PDF'}
                        <input
                          ref={(input) => {
                            fileInputRefs.current[index] = input
                          }}
                          id={`hr-document-${index}`}
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={(event) =>
                            onFileChange(index, event.target.files?.[0] ?? null)
                          }
                          className="sr-only"
                        />
                      </label>

                      {file ? (
                        <div className="mt-3 flex min-w-0 items-center gap-2 border-t border-[#eee] pt-3">
                          <span
                            title={file.name}
                            className="min-w-0 flex-1 truncate text-[11px] text-[#666]"
                          >
                            {file.name} · {formatFileSize(file.size)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            aria-label={`Quitar ${requirement.title}`}
                            className="flex h-7 w-7 shrink-0 items-center justify-center text-[#777] transition-colors hover:bg-brand-red hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                          >
                            <X aria-hidden="true" className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="mt-3 text-[11px] text-[#999]">PDF · Máx. 5 MB</p>
                      )}
                    </li>
                  )
                })}
              </ul>

              {filesError && (
                <p role="alert" className="mt-3 text-[12px] font-semibold text-brand-red">
                  {filesError}
                </p>
              )}
            </fieldset>

            {generalError && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 border border-[#e7b4b4] bg-[#fdf2f2] p-4 text-[13px] leading-5 text-[#8a1c15]"
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{generalError}</p>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mt-6 flex items-start gap-3 border border-[#b9d3b9] bg-[#f1f8f1] p-4 text-[13px] leading-5 text-[#28632b]"
              >
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{successMessage}</p>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-4 border-t border-[#eee] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] leading-5 text-[#777]">
                Los archivos se enviarán al servidor y quedarán disponibles para consulta por DNI.
              </p>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center gap-2 bg-brand-red px-6 text-[12px] font-bold uppercase tracking-[1.5px] text-white transition-colors duration-200 hover:bg-brand-red-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-[18px] w-[18px] animate-spin"
                  />
                ) : (
                  <Save aria-hidden="true" className="h-[18px] w-[18px]" />
                )}
                {isSaving ? 'Guardando…' : 'Guardar documentos'}
              </button>
            </div>
          </form>

          <aside className="border border-[#dedede] bg-white">
            <div className="border-b border-[#eee] p-5">
              <h2 className="text-[18px] font-black text-brand-ink">
                Postulantes registrados
              </h2>
              <p className="mt-1 text-[12px] leading-5 text-[#777]">
                Asociaciones activas en el servidor.
              </p>
            </div>

            {listLoading && (
              <div className="flex items-center justify-center gap-3 px-5 py-12 text-[13px] text-[#666]">
                <LoaderCircle
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin text-brand-red"
                />
                Cargando registros…
              </div>
            )}

            {!listLoading && listError && (
              <div
                role="alert"
                className="m-5 flex items-start gap-3 border border-[#e7b4b4] bg-[#fdf2f2] p-4 text-[12px] leading-5 text-[#8a1c15]"
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <p>No se pudieron cargar los registros guardados.</p>
              </div>
            )}

            {!listLoading && !listError && applicants.length === 0 && (
              <div className="px-5 py-12 text-center">
                <FileText aria-hidden="true" className="mx-auto h-8 w-8 text-[#bbb]" />
                <p className="mt-3 text-[13px] leading-5 text-[#777]">
                  Todavía no hay postulantes con documentos asociados.
                </p>
              </div>
            )}

            {!listLoading && !listError && applicants.length > 0 && (
              <ul className="divide-y divide-[#eee]">
                {applicants.map((applicant) => (
                  <li key={applicant.dni} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-[15px] font-black leading-5 text-brand-ink">
                          {applicant.fullName || `Postulante DNI ${applicant.dni}`}
                        </p>
                        <p className="mt-1 text-[12px] font-bold tracking-[1px] text-[#555]">
                          DNI {applicant.dni}
                        </p>
                        <p className="mt-1 text-[11px] text-[#777]">
                          {applicant.documents.length} documentos ·{' '}
                          {new Date(applicant.updatedAt).toLocaleString('es-PE', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setApplicantToDelete(applicant)}
                        aria-label={`Eliminar documentos de ${applicant.fullName || `el DNI ${applicant.dni}`}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center text-[#888] transition-colors hover:bg-brand-red hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="mt-3 inline-block bg-[#f2f2f2] px-2 py-1 text-[10px] font-bold uppercase tracking-[1px] text-[#666]">
                      {applicant.documents.length === 4 ? 'Completo' : 'Incompleto'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>

      <Modal
        open={applicantToDelete !== null}
        onClose={() => {
          if (!isDeleting) setApplicantToDelete(null)
        }}
        labelledBy="eliminar-documentos-titulo"
      >
        <div className="p-8">
          <h2
            id="eliminar-documentos-titulo"
            className="pr-10 text-[22px] font-black leading-7 text-brand-ink"
          >
            ¿Eliminar esta asociación?
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-[#555]">
            Se eliminarán los cuatro documentos de{' '}
            <strong className="font-black">
              {applicantToDelete?.fullName ||
                `el postulante con DNI ${applicantToDelete?.dni}`}
            </strong>
            {applicantToDelete?.fullName && (
              <>
                {' '}
                (DNI <strong className="font-black">{applicantToDelete.dni}</strong>)
              </>
            )}
            . El postulante dejará de verlos en la consulta.
          </p>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setApplicantToDelete(null)}
              disabled={isDeleting}
              className="border border-brand-ink px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] text-brand-ink transition-colors hover:bg-brand-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 bg-brand-red px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] text-white transition-colors hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                />
              ) : (
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              )}
              {isDeleting ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
