import type { ReactNode } from 'react'

interface FormSectionProps {
  letter: string
  title: string
  description?: string
  children: ReactNode
}

/** Tarjeta principal de una sección de la ficha. */
export default function FormSection({
  letter,
  title,
  description,
  children,
}: FormSectionProps) {
  const headingId = `seccion-${letter.toLowerCase()}`

  return (
    <section
      aria-labelledby={headingId}
      className="border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7 lg:p-8"
    >
      <div className="flex items-start gap-4 border-b border-[#ececec] pb-5">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-red text-[16px] font-black text-white"
        >
          {letter}
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 id={headingId} className="text-[20px] font-black leading-6 text-brand-ink">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-[13px] leading-5 text-[#666]">{description}</p>
          )}
        </div>
      </div>

      <div className="pt-6">{children}</div>
    </section>
  )
}

interface FormSubsectionProps {
  title: string
  description?: string
  children: ReactNode
}

/** Agrupación visual interna de una sección. */
export function FormSubsection({ title, description, children }: FormSubsectionProps) {
  return (
    <div className="border-t border-[#f0f0f0] pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-[14px] font-black uppercase tracking-[1px] text-brand-ink">{title}</h3>
      {description && <p className="mt-1 text-[12px] leading-5 text-[#777]">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}
