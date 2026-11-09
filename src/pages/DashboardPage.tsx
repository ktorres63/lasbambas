import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderOpen,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react'
import Modal from '../components/ui/Modal'
import {
  clearStoredSession,
  getStoredSession,
  verifyCurrentSession,
  type AuthUser,
} from '../services/auth'
import {
  buildApiUrl,
  checkBackendHealth,
  deleteStoredApplicant,
  listStoredApplicants,
  saveStoredApplicant,
  type StoredApplicant,
} from '../services/documentRepository'
import { REQUIRED_APPLICANT_DOCUMENTS } from '../services/applicantDocuments'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const EMPTY_FILES: (File | null)[] = REQUIRED_APPLICANT_DOCUMENTS.map(() => null)

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(() => {
    return getStoredSession()?.user ?? null
  })

  const [dni, setDni] = useState('')
  const [fullName, setFullName] = useState('')
  const [files, setFiles] = useState<(File | null)[]>(EMPTY_FILES)
  const [dniError, setDniError] = useState<string | null>(null)
  const [filesError, setFilesError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [applicants, setApplicants] = useState<StoredApplicant[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState(false)
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedDni, setExpandedDni] = useState<string | null>(null)
  const [applicantToDelete, setApplicantToDelete] =
    useState<StoredApplicant | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const dniInputRef = useRef<HTMLInputElement>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const refreshDashboardData = async () => {
    setListLoading(true)
    setListError(false)

    const [healthOk, applicantsResult] = await Promise.allSettled([
      checkBackendHealth(),
      listStoredApplicants(),
    ])

    setBackendHealthy(healthOk.status === 'fulfilled' ? healthOk.value : false)

    if (applicantsResult.status === 'fulfilled') {
      setApplicants(applicantsResult.value)
    } else {
      setListError(true)
    }

    setListLoading(false)
  }

  useEffect(() => {
    const current = getStoredSession()
    if (!current) {
      navigate('/login', { replace: true })
      return
    }

    let active = true

    verifyCurrentSession().then((verifiedUser) => {
      if (!active) return
      if (!verifiedUser) {
        navigate('/login', { replace: true })
        return
      }
      setUser(verifiedUser)
    })

    Promise.allSettled([checkBackendHealth(), listStoredApplicants()]).then(
      ([healthOk, applicantsResult]) => {
        if (!active) return
        setBackendHealthy(
          healthOk.status === 'fulfilled' ? healthOk.value : false,
        )
        if (applicantsResult.status === 'fulfilled') {
          setApplicants(applicantsResult.value)
        } else {
          setListError(true)
        }
        setListLoading(false)
      },
    )

    return () => {
      active = false
    }
  }, [navigate])

  const handleLogout = () => {
    clearStoredSession()
    navigate('/login', { replace: true })
  }

  const clearForm = () => {
    setDni('')
    setFullName('')
    setFiles(EMPTY_FILES)
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
      setGeneralError(`“${file.name}” no es un archivo PDF válido.`)
      if (fileInputRefs.current[index]) fileInputRefs.current[index]!.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setGeneralError(
        `“${file.name}” supera el tamaño máximo de 10 MB permitido por archivo.`,
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
    setDniError(null)
    setFilesError(null)
    setGeneralError(null)
    setSuccessMessage(null)

    const normalizedDni = dni.trim()
    let invalid = false

    if (!/^\d{8}$/.test(normalizedDni)) {
      setDniError('El DNI debe contener exactamente 8 dígitos.')
      dniInputRef.current?.focus()
      invalid = true
    }

    if (files.some((file) => file === null)) {
      setFilesError('Debes adjuntar los cuatro documentos PDF obligatorios.')
      invalid = true
    }

    if (invalid) return

    setIsSaving(true)

    try {
      await saveStoredApplicant({
        dni: normalizedDni,
        fullName: fullName.trim() || `Postulante DNI ${normalizedDni}`,
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

      const updatedList = await listStoredApplicants()
      setApplicants(updatedList)
      setExpandedDni(normalizedDni)
      setSuccessMessage(
        `Los cuatro documentos del DNI ${normalizedDni} se subieron y registraron correctamente en el servidor.`,
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
      if (expandedDni === applicantToDelete.dni) {
        setExpandedDni(null)
      }
      setApplicantToDelete(null)
    } catch {
      setListError(true)
    } finally {
      setIsDeleting(false)
    }
  }

  const selectApplicantForUpdate = (applicant: StoredApplicant) => {
    setDni(applicant.dni)
    setFullName(applicant.fullName ?? '')
    setDniError(null)
    setSuccessMessage(null)
    dniInputRef.current?.focus()
  }

  const filteredApplicants = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return applicants
    return applicants.filter(
      (item) =>
        item.dni.includes(query) ||
        (item.fullName?.toLowerCase().includes(query) ?? false),
    )
  }, [applicants, searchTerm])

  const totalDocuments = useMemo(
    () =>
      applicants.reduce(
        (sum, applicant) => sum + applicant.documents.length,
        0,
      ),
    [applicants],
  )

  const completeProfiles = useMemo(
    () =>
      applicants.filter((applicant) => applicant.documents.length >= 4).length,
    [applicants],
  )

  if (!user) {
    return null
  }

  return (
    <section className="bg-[#f4f4f4] px-[15px] pb-20 pt-[140px] lg:pt-[170px]">
      <div className="mx-auto max-w-[1260px]">
        {/* Cabecera del Dashboard */}
        <div className="mb-8 flex flex-col gap-6 border-b border-[#dedede] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="bg-brand-red px-2.5 py-1 text-[11px] font-black uppercase tracking-[2px] text-white">
                Dashboard RR. HH.
              </span>
              <span className="inline-flex items-center gap-1.5 border border-[#d6d6d6] bg-white px-2.5 py-1 text-[11px] font-bold text-brand-ink">
                <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-brand-red" />
                {user.name} ({user.email})
              </span>
            </div>
            <h1 className="text-[32px] font-light leading-[38px] text-brand-ink lg:text-[42px] lg:leading-[48px]">
              Panel de <strong className="font-black">Reclutamiento y Documentos</strong>
            </h1>
            <p className="mt-3 max-w-[700px] text-[15px] leading-[24px] text-[#555]">
              Administra los expedientes PDF de los postulantes almacenados en
              Cloudflare D1 y R2, verifica su estado y habilita su consulta por DNI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/postulante/documentos"
              className="inline-flex h-11 items-center gap-2 border border-brand-ink bg-white px-4 text-[12px] font-bold uppercase tracking-[1px] text-brand-ink transition-colors hover:bg-brand-ink hover:text-white"
            >
              Vista del postulante
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => void refreshDashboardData()}
              disabled={listLoading}
              className="inline-flex h-11 items-center gap-2 border border-[#cfcfcf] bg-white px-4 text-[12px] font-bold uppercase tracking-[1px] text-brand-ink transition-colors hover:border-brand-red hover:text-brand-red disabled:opacity-50"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${listLoading ? 'animate-spin' : ''}`}
              />
              Actualizar
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-11 items-center gap-2 bg-brand-ink px-4 text-[12px] font-bold uppercase tracking-[1px] text-white transition-colors hover:bg-brand-red"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Tarjetas de métricas */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#dedede] bg-white p-5 shadow-[0_6px_20px_rgba(35,31,32,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#777]">
                Postulantes con DNI
              </span>
              <Users aria-hidden="true" className="h-5 w-5 text-brand-red" />
            </div>
            <p className="mt-3 text-[34px] font-black leading-none text-brand-ink">
              {listLoading ? '—' : applicants.length}
            </p>
            <p className="mt-2 text-[12px] text-[#666]">
              Registrados en base de datos D1
            </p>
          </div>

          <div className="border border-[#dedede] bg-white p-5 shadow-[0_6px_20px_rgba(35,31,32,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#777]">
                Documentos en R2
              </span>
              <FolderOpen aria-hidden="true" className="h-5 w-5 text-brand-red" />
            </div>
            <p className="mt-3 text-[34px] font-black leading-none text-brand-ink">
              {listLoading ? '—' : totalDocuments}
            </p>
            <p className="mt-2 text-[12px] text-[#666]">
              Archivos PDF privados activos
            </p>
          </div>

          <div className="border border-[#dedede] bg-white p-5 shadow-[0_6px_20px_rgba(35,31,32,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#777]">
                Expedientes completos
              </span>
              <FileCheck2 aria-hidden="true" className="h-5 w-5 text-brand-red" />
            </div>
            <p className="mt-3 text-[34px] font-black leading-none text-brand-ink">
              {listLoading ? '—' : completeProfiles}
            </p>
            <p className="mt-2 text-[12px] text-[#666]">
              Con los 4 documentos requeridos
            </p>
          </div>

          <div className="border border-[#dedede] bg-white p-5 shadow-[0_6px_20px_rgba(35,31,32,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#777]">
                Estado del Backend
              </span>
              <Activity
                aria-hidden="true"
                className={`h-5 w-5 ${
                  backendHealthy ? 'text-[#28632b]' : 'text-brand-red'
                }`}
              />
            </div>
            <p className="mt-3 text-[22px] font-black leading-tight text-brand-ink">
              {backendHealthy === null
                ? 'Verificando…'
                : backendHealthy
                  ? 'Operativo'
                  : 'Sin conexión'}
            </p>
            <p className="mt-2 text-[12px] text-[#666]">
              API /api/health · D1 + R2
            </p>
          </div>
        </div>

        {/* Contenido principal: Formulario de carga + Directorio de postulantes */}
        <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            noValidate
            onSubmit={onSubmit}
            className="border border-[#dedede] bg-white p-6 shadow-[0_10px_35px_rgba(35,31,32,0.05)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#eee] pb-5">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-red text-[13px] font-black text-white">
                  01
                </span>
                <div>
                  <h2 className="text-[20px] font-black leading-6 text-brand-ink">
                    Asociar documentos a postulante
                  </h2>
                  <p className="mt-1 text-[13px] leading-5 text-[#666]">
                    Ingresa los datos del postulante y sube sus 4 documentos PDF.
                  </p>
                </div>
              </div>

              {(dni || fullName) && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="text-[11px] font-bold uppercase tracking-[1px] text-[#777] underline hover:text-brand-red"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="dashboard-applicant-dni"
                  className="mb-2 block text-[12px] font-bold uppercase tracking-[1.5px] text-brand-ink"
                >
                  DNI del postulante *
                </label>
                <input
                  ref={dniInputRef}
                  id="dashboard-applicant-dni"
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
                    dniError
                      ? 'dashboard-applicant-dni-error'
                      : 'dashboard-applicant-dni-hint'
                  }
                  className={`h-12 w-full border bg-white px-4 text-[15px] tracking-[1px] text-brand-ink outline-none transition-colors placeholder:tracking-normal placeholder:text-[#9a9a9a] focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 ${
                    dniError ? 'border-brand-red' : 'border-[#cfcfcf]'
                  }`}
                />
                {dniError ? (
                  <p
                    id="dashboard-applicant-dni-error"
                    role="alert"
                    className="mt-2 text-[12px] leading-4 text-brand-red"
                  >
                    {dniError}
                  </p>
                ) : (
                  <p
                    id="dashboard-applicant-dni-hint"
                    className="mt-2 text-[12px] leading-4 text-[#777]"
                  >
                    Si el DNI ya existe, sus documentos se actualizarán.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="dashboard-applicant-name"
                  className="mb-2 block text-[12px] font-bold uppercase tracking-[1.5px] text-brand-ink"
                >
                  Nombre completo (opcional)
                </label>
                <input
                  id="dashboard-applicant-name"
                  type="text"
                  autoComplete="off"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value)
                    setSuccessMessage(null)
                  }}
                  placeholder="Ej. Juan Pérez Quispe"
                  className="h-12 w-full border border-[#cfcfcf] bg-white px-4 text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#9a9a9a] focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
                />
                <p className="mt-2 text-[12px] leading-4 text-[#777]">
                  Se guarda en la ficha del postulante en D1.
                </p>
              </div>
            </div>

            <fieldset className="mt-8">
              <legend className="text-[12px] font-bold uppercase tracking-[1.5px] text-brand-ink">
                Documentos PDF requeridos
              </legend>
              <p className="mt-2 text-[12px] leading-5 text-[#777]">
                Los cuatro documentos son obligatorios. Máximo 10 MB por archivo.
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
                        htmlFor={`dashboard-document-${index}`}
                        className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-[#cfcfcf] bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[1px] text-brand-ink transition-colors hover:border-brand-red hover:text-brand-red focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-red"
                      >
                        <UploadCloud aria-hidden="true" className="h-4 w-4" />
                        {file ? 'Reemplazar PDF' : 'Seleccionar PDF'}
                        <input
                          ref={(input) => {
                            fileInputRefs.current[index] = input
                          }}
                          id={`dashboard-document-${index}`}
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
                            className="flex h-7 w-7 shrink-0 items-center justify-center text-[#777] transition-colors hover:bg-brand-red hover:text-white"
                          >
                            <X aria-hidden="true" className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="mt-3 text-[11px] text-[#999]">
                          PDF · Máx. 10 MB
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>

              {filesError && (
                <p
                  role="alert"
                  className="mt-3 text-[12px] font-semibold text-brand-red"
                >
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
                Al guardar, el postulante podrá consultarlos ingresando su DNI.
              </p>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center gap-2 bg-brand-red px-6 text-[12px] font-bold uppercase tracking-[1.5px] text-white transition-colors duration-200 hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-[18px] w-[18px] animate-spin"
                  />
                ) : (
                  <Save aria-hidden="true" className="h-[18px] w-[18px]" />
                )}
                {isSaving ? 'Subiendo al servidor…' : 'Guardar documentos'}
              </button>
            </div>
          </form>

          {/* Panel lateral: Directorio de DNIs registrados */}
          <aside className="border border-[#dedede] bg-white shadow-[0_10px_35px_rgba(35,31,32,0.05)]">
            <div className="border-b border-[#eee] p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[18px] font-black text-brand-ink">
                  Expedientes por DNI
                </h2>
                <span className="bg-[#f2f2f2] px-2.5 py-0.5 text-[11px] font-bold text-brand-ink">
                  {applicants.length} registros
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-[#777]">
                Consulta, previsualiza o elimina los documentos en R2.
              </p>

              <div className="relative mt-4">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888]"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Filtrar por DNI o nombre…"
                  className="h-10 w-full border border-[#cfcfcf] bg-[#fafafa] pl-10 pr-3 text-[13px] text-brand-ink outline-none transition-colors focus:border-brand-red focus:bg-white"
                />
              </div>
            </div>

            {listLoading && (
              <div className="flex items-center justify-center gap-3 px-5 py-12 text-[13px] text-[#666]">
                <LoaderCircle
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin text-brand-red"
                />
                Cargando registros del servidor…
              </div>
            )}

            {!listLoading && listError && (
              <div
                role="alert"
                className="m-5 flex items-start gap-3 border border-[#e7b4b4] bg-[#fdf2f2] p-4 text-[12px] leading-5 text-[#8a1c15]"
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  No se pudieron cargar los registros desde el servidor. Verifica que
                  MineraBackend esté activo.
                </p>
              </div>
            )}

            {!listLoading && !listError && filteredApplicants.length === 0 && (
              <div className="px-5 py-12 text-center">
                <FileText aria-hidden="true" className="mx-auto h-8 w-8 text-[#bbb]" />
                <p className="mt-3 text-[13px] leading-5 text-[#777]">
                  {searchTerm.trim()
                    ? 'No hay coincidencias para la búsqueda.'
                    : 'Todavía no hay DNIs con documentos asociados.'}
                </p>
              </div>
            )}

            {!listLoading && !listError && filteredApplicants.length > 0 && (
              <ul className="max-h-[640px] divide-y divide-[#eee] overflow-y-auto">
                {filteredApplicants.map((applicant) => {
                  const isExpanded = expandedDni === applicant.dni

                  return (
                    <li key={applicant.dni} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[16px] font-black tracking-[1px] text-brand-ink">
                              {applicant.dni}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-[1px] ${
                                applicant.documents.length >= 4
                                  ? 'bg-[#e8f5e9] text-[#28632b]'
                                  : 'bg-[#fff3e0] text-[#9a5b13]'
                              }`}
                            >
                              {applicant.documents.length >= 4
                                ? 'Completo'
                                : `${applicant.documents.length}/4 PDF`}
                            </span>
                          </div>
                          {applicant.fullName && (
                            <p className="mt-0.5 text-[13px] font-semibold text-[#444]">
                              {applicant.fullName}
                            </p>
                          )}
                          <p className="mt-1 text-[11px] text-[#777]">
                            Actualizado:{' '}
                            {new Date(applicant.updatedAt).toLocaleString('es-PE', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => selectApplicantForUpdate(applicant)}
                            className="border border-[#d6d6d6] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] text-brand-ink transition-colors hover:border-brand-red hover:text-brand-red"
                          >
                            Cargar DNI
                          </button>
                          <button
                            type="button"
                            onClick={() => setApplicantToDelete(applicant)}
                            aria-label={`Eliminar documentos del DNI ${applicant.dni}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-[#888] transition-colors hover:bg-brand-red hover:text-white"
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDni(isExpanded ? null : applicant.dni)
                          }
                          className="text-[11px] font-bold uppercase tracking-[1px] text-brand-red hover:underline"
                        >
                          {isExpanded
                            ? 'Ocultar archivos'
                            : `Ver ${applicant.documents.length} documentos`}
                        </button>
                      </div>

                      {isExpanded && (
                        <ul className="mt-3 space-y-2 border-t border-[#eee] pt-3">
                          {applicant.documents.map((doc) => {
                            const href = doc.downloadPath
                              ? buildApiUrl(`${doc.downloadPath}?inline=true`)
                              : buildApiUrl(
                                  `/api/documents/${encodeURIComponent(doc.id)}/download?inline=true`,
                                )

                            return (
                              <li key={doc.id}>
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-2 border border-[#eaeaea] bg-[#fafafa] px-3 py-2 text-[12px] text-brand-ink transition-colors hover:border-brand-red hover:text-brand-red"
                                >
                                  <span className="truncate font-semibold">
                                    {doc.title}
                                  </span>
                                  <ArrowUpRight
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5 shrink-0 text-brand-red"
                                  />
                                </a>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                })}
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
        labelledBy="dashboard-eliminar-documentos-titulo"
      >
        <div className="p-8">
          <h2
            id="dashboard-eliminar-documentos-titulo"
            className="pr-10 text-[22px] font-black leading-7 text-brand-ink"
          >
            ¿Eliminar expediente del servidor?
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-[#555]">
            Se eliminarán de R2 y D1 todos los documentos asociados al DNI{' '}
            <strong className="font-black">{applicantToDelete?.dni}</strong>. El
            postulante ya no podrá visualizarlos en su consulta.
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
