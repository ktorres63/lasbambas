import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertCircle,
  ArrowUpRight,
  FileText,
  FolderSearch,
  LoaderCircle,
  RotateCcw,
  Search,
} from 'lucide-react'
import {
  getApplicantDocuments,
  type ApplicantDocument,
} from '../services/applicantDocuments'

const dniSchema = z.object({
  dni: z
    .string()
    .trim()
    .min(1, 'Ingresa tu DNI.')
    .regex(/^\d{8}$/, 'El DNI debe contener exactamente 8 dígitos.'),
})

type DniValues = z.infer<typeof dniSchema>

type QueryResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; dni: string; documents: ApplicantDocument[] }
  | { status: 'not-found'; dni: string }
  | { status: 'error' }

function DocumentCard({ document }: { document: ApplicantDocument }) {
  return (
    <li>
      <a
        href={document.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col border border-[#dedede] bg-white p-5 transition-colors duration-200 hover:border-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#f2f2f2] text-brand-red transition-colors duration-200 group-hover:bg-brand-red group-hover:text-white">
            <FileText aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="bg-[#f2f2f2] px-2 py-1 text-[10px] font-bold uppercase tracking-[1.5px] text-[#666]">
            PDF
          </span>
        </div>

        <h3 className="mt-5 text-[16px] font-bold leading-[22px] text-brand-ink">
          {document.title}
        </h3>
        <p className="mt-2 flex-1 text-[13px] leading-[20px] text-[#666]">
          {document.description}
        </p>

        <span className="mt-5 inline-flex items-center gap-2 border-t border-[#eee] pt-4 text-[12px] font-bold uppercase tracking-[1px] text-brand-red">
          Abrir PDF
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </span>
      </a>
    </li>
  )
}

export default function ApplicantDocumentsPage() {
  const [result, setResult] = useState<QueryResult>({ status: 'idle' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DniValues>({
    resolver: zodResolver(dniSchema),
    defaultValues: { dni: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    const urls =
      result.status === 'found'
        ? result.documents
            .filter((document) => document.objectUrl)
            .map((document) => document.href)
        : []

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [result])

  const onSubmit = async ({ dni }: DniValues) => {
    setResult({ status: 'loading' })

    try {
      const documents = await getApplicantDocuments(dni)
      setResult(
        documents
          ? { status: 'found', dni, documents }
          : { status: 'not-found', dni },
      )
    } catch {
      setResult({ status: 'error' })
    }
  }

  const resetSearch = () => {
    reset()
    setResult({ status: 'idle' })
  }

  return (
    <section className="bg-[#f4f4f4] px-[15px] pb-20 pt-[140px] lg:pt-[170px]">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-9 max-w-[760px]">
          <p className="mb-2 text-[14px] uppercase tracking-[2px] text-brand-red">
            Postulantes
          </p>
          <h1 className="text-[32px] font-light leading-[38px] text-brand-ink lg:text-[40px] lg:leading-[46px]">
            Consulta de <strong className="font-black">documentos</strong>
          </h1>
          <p className="mt-4 text-[15px] leading-[24px] text-[#555]">
            Ingresa tu DNI para consultar los documentos PDF asociados a tu
            postulación.
          </p>
        </div>

        <div className="border border-[#dedede] bg-white p-6 shadow-[0_10px_35px_rgba(35,31,32,0.05)] sm:p-8">
          <form
            noValidate
            aria-busy={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
            onChange={() => {
              if (result.status === 'idle') return
              setResult({ status: 'idle' })
            }}
            className="grid gap-5 sm:grid-cols-[minmax(0,320px)_auto] sm:items-start"
          >
            <div>
              <label
                htmlFor="applicant-dni"
                className="mb-2 block text-[12px] font-bold uppercase tracking-[1.5px] text-brand-ink"
              >
                DNI del postulante
              </label>
              <input
                {...register('dni')}
                id="applicant-dni"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={8}
                placeholder="Ingresa 8 dígitos"
                aria-invalid={errors.dni ? true : undefined}
                aria-describedby={
                  errors.dni ? 'applicant-dni-error' : 'applicant-dni-hint'
                }
                className={`h-12 w-full border bg-white px-4 text-[15px] tracking-[1px] text-brand-ink outline-none transition-colors placeholder:tracking-normal placeholder:text-[#9a9a9a] focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 ${
                  errors.dni ? 'border-brand-red' : 'border-[#cfcfcf]'
                }`}
              />

              {errors.dni ? (
                <p
                  id="applicant-dni-error"
                  role="alert"
                  className="mt-2 text-[12px] leading-4 text-brand-red"
                >
                  {errors.dni.message}
                </p>
              ) : (
                <p id="applicant-dni-hint" className="mt-2 text-[12px] leading-4 text-[#777]">
                  Debe contener exactamente 8 dígitos.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center gap-2 bg-brand-red px-6 text-[13px] font-bold uppercase tracking-[1.5px] text-white transition-colors duration-200 hover:bg-brand-red-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:cursor-not-allowed disabled:opacity-60 sm:mt-[30px] sm:justify-self-start"
            >
              {isSubmitting ? (
                <LoaderCircle aria-hidden="true" className="h-[18px] w-[18px] animate-spin" />
              ) : (
                <Search aria-hidden="true" className="h-[18px] w-[18px]" />
              )}
              {isSubmitting ? 'Consultando…' : 'Buscar documentos'}
            </button>
          </form>

          <p className="mt-5 border-t border-[#eee] pt-4 text-[12px] leading-5 text-[#777]">
            <span className="font-bold text-brand-ink">Información:</span> aquí se
            muestran los documentos oficiales registrados por el área de Recursos
            Humanos para tu número de DNI.
          </p>
        </div>

        <div className="mt-8" aria-live="polite">
          {result.status === 'idle' && (
            <div className="flex min-h-[180px] flex-col items-center justify-center border border-dashed border-[#d6d6d6] bg-white/50 px-6 py-10 text-center">
              <FolderSearch aria-hidden="true" className="h-9 w-9 text-[#b5b5b5]" />
              <p className="mt-4 max-w-[420px] text-[14px] leading-6 text-[#666]">
                Los documentos disponibles aparecerán aquí después de consultar tu DNI.
              </p>
            </div>
          )}

          {result.status === 'loading' && (
            <div
              role="status"
              className="flex min-h-[180px] flex-col items-center justify-center border border-[#dedede] bg-white px-6 py-10 text-center"
            >
              <LoaderCircle
                aria-hidden="true"
                className="h-8 w-8 animate-spin text-brand-red"
              />
              <p className="mt-4 text-[14px] text-[#555]">Buscando documentos…</p>
            </div>
          )}

          {result.status === 'not-found' && (
            <div
              role="alert"
              className="flex min-h-[180px] flex-col items-center justify-center border border-[#e7b4b4] bg-[#fdf2f2] px-6 py-10 text-center"
            >
              <AlertCircle aria-hidden="true" className="h-9 w-9 text-[#8a1c15]" />
              <h2 className="mt-4 text-[20px] font-black text-[#8a1c15]">
                No encontramos documentos
              </h2>
              <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-[#7a3430]">
                No hay documentos asociados al DNI{' '}
                <strong className="font-black">{result.dni}</strong>. Verifica el número
                ingresado e inténtalo nuevamente.
              </p>
              <button
                type="button"
                onClick={resetSearch}
                className="mt-6 inline-flex items-center gap-2 border border-[#8a1c15] px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] text-[#8a1c15] transition-colors hover:bg-[#8a1c15] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a1c15]"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                Consultar otro DNI
              </button>
            </div>
          )}

          {result.status === 'error' && (
            <div
              role="alert"
              className="flex min-h-[180px] flex-col items-center justify-center border border-[#e7b4b4] bg-[#fdf2f2] px-6 py-10 text-center"
            >
              <AlertCircle aria-hidden="true" className="h-9 w-9 text-[#8a1c15]" />
              <h2 className="mt-4 text-[20px] font-black text-[#8a1c15]">
                No se pudo realizar la consulta
              </h2>
              <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-[#7a3430]">
                Ocurrió un problema al buscar los documentos. Inténtalo nuevamente.
              </p>
              <button
                type="button"
                onClick={resetSearch}
                className="mt-6 inline-flex items-center gap-2 border border-[#8a1c15] px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] text-[#8a1c15] transition-colors hover:bg-[#8a1c15] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a1c15]"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                Intentar nuevamente
              </button>
            </div>
          )}

          {result.status === 'found' && (
            <div>
              <div className="mb-5 flex flex-col gap-4 border-b border-[#dedede] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-[2px] text-brand-red">
                    Consulta completada
                  </p>
                  <h2 className="text-[24px] font-black leading-8 text-brand-ink">
                    Documentos disponibles
                  </h2>
                  <p className="mt-2 text-[13px] text-[#666]">
                    {result.documents.length} documentos encontrados para el DNI{' '}
                    <strong className="font-bold text-brand-ink">{result.dni}</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetSearch}
                  className="inline-flex w-fit items-center gap-2 border border-brand-ink px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] text-brand-ink transition-colors hover:bg-brand-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  Consultar otro DNI
                </button>
              </div>

              <ul className="grid gap-4 sm:grid-cols-2">
                {result.documents.map((document) => (
                  <DocumentCard key={document.id} document={document} />
                ))}
              </ul>

              <p className="mt-4 text-[12px] leading-5 text-[#777]">
                Los documentos se abrirán en una nueva pestaña.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
