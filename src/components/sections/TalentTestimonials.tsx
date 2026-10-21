import { useState } from 'react'
import { testimonials } from '../../data/home'

export default function TalentTestimonials() {
  const [index, setIndex] = useState(0)
  const total = testimonials.length
  const prev = () => setIndex((i) => (i - 1 + total) % total)
  const next = () => setIndex((i) => (i + 1) % total)
  const t = testimonials[index]

  return (
    <section className="w-full bg-[linear-gradient(270deg,#fff_66%,#e5e5e5_66%)]">
      <div className="mx-auto max-w-[1300px] px-[15px] lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr]">
          {/* Panel gris */}
          <div className="bg-brand-grey px-[25px] py-[68px]">
            <div className="relative text-left text-[40px] font-black leading-[42px] tracking-tight text-brand-red">
              <span
                aria-hidden="true"
                className="absolute -left-[25px] top-0 h-full w-px bg-brand-red"
              />
              <span className="block text-[20px] font-light">Conoce</span>
              <br />
              Nuestros Talentos
            </div>
          </div>

          {/* Panel blanco con slider */}
          <div className="relative border-y border-brand-red bg-white px-[25px] py-[68px] lg:px-[80px]">
            <div className="flex flex-col gap-6 sm:flex-row">
              <img
                src={t.image}
                alt={t.author}
                className="h-auto w-full max-w-[294px] self-start"
              />
              {/* Las comillas viven dentro del margen izquierdo de la columna
                  de texto, sin invadir la foto. */}
              <div className="relative w-full pl-[34px] sm:pl-[44px]">
                <img
                  src="/assets/img/comillas.svg"
                  alt=""
                  aria-hidden="true"
                  className="absolute left-0 top-1 h-[18px] w-[18px] sm:top-0 sm:h-[31px] sm:w-[31px]"
                />
                <p className="mb-[30px] text-[16px] leading-[26px] text-brand-ink">{t.quote}</p>
                <div className="mb-[5px] text-[24px] font-black leading-[26px] text-brand-red">
                  {t.author}
                </div>
                <div className="text-[13px] leading-[24px] text-brand-red">{t.role}</div>
              </div>
            </div>

            {/* Controles */}
            <div className="mt-8 flex items-center justify-end gap-6">
              <button
                onClick={prev}
                aria-label="Anterior testimonio"
                className="cursor-pointer"
              >
                <img src="/assets/img/btn-red-prev.svg" alt="" className="h-[19.8px] w-[12.1px]" />
              </button>
              <button onClick={next} aria-label="Siguiente testimonio" className="cursor-pointer">
                <img src="/assets/img/btn-red-next.svg" alt="" className="h-[19.8px] w-[12.1px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
