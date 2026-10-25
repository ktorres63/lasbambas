import { Info } from 'lucide-react'
import PersonnelEntryForm from '../components/sections/PersonnelEntryForm'

export default function PersonnelEntryFormPage() {
  return (
    <section className="bg-[#f4f4f4] px-[15px] pb-20 pt-[140px] lg:pt-[170px]">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-8 max-w-[780px]">
          <p className="mb-2 text-[14px] uppercase tracking-[2px] text-brand-red">
            Recursos Humanos
          </p>
          <h1 className="text-[32px] font-light leading-[38px] text-brand-ink lg:text-[40px] lg:leading-[46px]">
            Ficha de <strong className="font-black">ingreso de personal</strong>
          </h1>
          <p className="mt-4 text-[15px] leading-[24px] text-[#555]">
            Completa la información personal, académica y laboral solicitada. Los campos
            marcados con <span className="font-bold text-brand-red">*</span> son obligatorios.
          </p>
        </div>

        <div
          role="note"
          className="mb-6 flex items-start gap-3 border border-[#ecd9a6] bg-[#fff8e6] p-4 text-[13px] leading-5 text-[#6b4f00]"
        >
          <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <span className="font-bold">Demostración funcional.</span> Este formulario valida
            los datos en el navegador, pero no cuenta con un servicio de envío ni almacena la
            información.
          </p>
        </div>

        <PersonnelEntryForm />
      </div>
    </section>
  )
}
