import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileText,
  ListChecks,
  UserCheck,
} from 'lucide-react'
import { jobAreas, type JobArea, type JobPosition } from '../data/jobs'
import Modal from '../components/ui/Modal'

const countLabel = (n: number) => `${n} ${n === 1 ? 'puesto' : 'puestos'}`

interface Details {
  area: JobArea
  position: JobPosition
}

/** Botón "Postular": únicamente visual, sin acción asociada */
function ApplyButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      aria-disabled="true"
      title="Postulación disponible próximamente"
      className={`cursor-default bg-brand-red px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] text-white ${className}`}
    >
      Postular
    </button>
  )
}

export default function JobVacanciesPage() {
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [details, setDetails] = useState<Details | null>(null)

  const selectedArea = jobAreas.find((area) => area.id === selectedAreaId) ?? null

  return (
    <section className="bg-[#f4f4f4] px-[15px] pb-20 pt-[140px] lg:pt-[170px]">
      <div className="mx-auto max-w-[1300px]">
        {/* Encabezado */}
        <div className="mb-10 max-w-[760px]">
          <p className="mb-2 text-[14px] uppercase tracking-[2px] text-brand-red">
            Trabaja con nosotros
          </p>
          <h1 className="text-[32px] font-light leading-[38px] text-brand-ink lg:text-[40px] lg:leading-[46px]">
            Oportunidades <strong className="font-black">laborales</strong>
          </h1>
          <p className="mt-4 text-[15px] leading-[24px] text-[#555]">
            Encuentra oportunidades para formar parte de nuestro equipo y contribuir al desarrollo
            de la actividad minera.
          </p>
        </div>

        <div
          key={selectedAreaId ?? 'areas'}
          className="animate-fade-in motion-reduce:animate-none"
        >
          {selectedArea === null ? (
            /* Vista: cuadrícula de áreas */
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobAreas.map((area) => {
                const Icon = area.icon
                return (
                  <li key={area.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedAreaId(area.id)}
                      aria-label={`Ver puestos de ${area.name}`}
                      className="group flex w-full items-center gap-4 border-2 border-[#e3e3e3] bg-white p-5 text-left transition-colors duration-200 hover:border-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#f2f2f2] text-brand-red transition-colors duration-200 group-hover:bg-brand-red group-hover:text-white"
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-bold leading-[20px] text-brand-ink">
                          {area.name}
                        </span>
                        <span className="mt-1 block text-[12px] uppercase tracking-[1px] text-[#777]">
                          {countLabel(area.positions.length)}
                        </span>
                      </span>
                      <ChevronRight
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-brand-red transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            /* Vista: puestos del área seleccionada */
            <>
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedAreaId(null)}
                  className="inline-flex items-center gap-2 border-2 border-brand-ink px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] text-brand-ink transition-colors duration-200 hover:bg-brand-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Volver a las áreas
                </button>
                <div className="flex items-center gap-3">
                  <selectedArea.icon aria-hidden="true" className="h-7 w-7 text-brand-red" />
                  <h2 className="text-[22px] font-black leading-[28px] text-brand-ink">
                    {selectedArea.name}
                  </h2>
                  <span className="text-[12px] uppercase tracking-[1px] text-[#777]">
                    {countLabel(selectedArea.positions.length)}
                  </span>
                </div>
              </div>

              {/* Cambio rápido de área */}
              <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Cambiar de área">
                {jobAreas.map((area) => {
                  const isActive = area.id === selectedArea.id
                  return (
                    <button
                      key={area.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedAreaId(area.id)}
                      className={`border px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[1px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
                        isActive
                          ? 'border-brand-red bg-brand-red text-white'
                          : 'border-[#d5d5d5] bg-white text-[#666] hover:border-brand-red hover:text-brand-red'
                      }`}
                    >
                      {area.name}
                    </button>
                  )
                })}
              </div>

              {/* Cuadrícula de puestos */}
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedArea.positions.map((position) => (
                  <li
                    key={position.id}
                    className="flex flex-col border-2 border-[#e3e3e3] bg-white p-6 transition-colors duration-200 hover:border-brand-red/60"
                  >
                    <h3 className="text-[17px] font-bold leading-[22px] text-brand-ink">
                      {position.name}
                    </h3>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setDetails({ area: selectedArea, position })}
                        className="border border-brand-ink px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] text-brand-ink transition-colors duration-200 hover:bg-brand-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                      >
                        Ver detalles
                      </button>
                      <ApplyButton />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Modal: detalles del puesto */}
      <Modal
        open={details !== null}
        onClose={() => setDetails(null)}
        labelledBy={details ? `detalle-${details.position.id}` : undefined}
      >
        {details && (
          <div className="p-8 lg:p-10">
            <span className="mb-3 inline-block bg-brand-red px-3 py-1 text-[11px] font-bold uppercase tracking-[1px] text-white">
              {details.area.name}
            </span>
            <h2
              id={`detalle-${details.position.id}`}
              className="pr-10 text-[24px] font-black leading-[30px] text-brand-ink"
            >
              {details.position.name}
            </h2>

            <div className="mt-6 space-y-6 text-[14px] leading-[22px] text-[#555]">
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-[14px] font-black uppercase tracking-[1px] text-brand-ink">
                  <FileText aria-hidden="true" className="h-4 w-4 text-brand-red" />
                  Descripción
                </h3>
                <p>{details.position.description}</p>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-[14px] font-black uppercase tracking-[1px] text-brand-ink">
                  <ListChecks aria-hidden="true" className="h-4 w-4 text-brand-red" />
                  Funciones
                </h3>
                <ul className="space-y-1.5">
                  {details.position.functions.map((fn) => (
                    <li key={fn} className="flex items-start gap-2">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                      <span>{fn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-[14px] font-black uppercase tracking-[1px] text-brand-ink">
                  <ClipboardCheck aria-hidden="true" className="h-4 w-4 text-brand-red" />
                  Requisitos
                </h3>
                <ul className="space-y-1.5">
                  {details.position.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-[14px] font-black uppercase tracking-[1px] text-brand-ink">
                  <UserCheck aria-hidden="true" className="h-4 w-4 text-brand-red" />
                  Perfil profesional
                </h3>
                <p>{details.position.profile}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#eee] pt-5">
              <ApplyButton />
              {/* <p className="w-full text-[12px] italic text-[#999] sm:w-auto sm:flex-1">
                Contenido de ejemplo, editable en src/data/jobs.ts
              </p> */}
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
