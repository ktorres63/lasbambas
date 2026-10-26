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

        <PersonnelEntryForm />
      </div>
    </section>
  )
}
