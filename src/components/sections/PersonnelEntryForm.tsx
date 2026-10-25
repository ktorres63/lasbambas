import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Info, Send, Trash2 } from 'lucide-react'
import { personnelEntryDefaults } from '../../data/personnelEntry'
import {
  personnelEntrySchema,
  type PersonnelEntryValues,
} from '../../schemas/personnelEntry'
import Modal from '../ui/Modal'
import PersonalDataSection from './personnel/PersonalDataSection'
// import AcademicAndBankSection from './personnel/AcademicAndBankSection'
// import JobSatisfactionSection from './personnel/JobSatisfactionSection'
// import SelfAssessmentSection from './personnel/SelfAssessmentSection'
// import AchievementsSection from './personnel/AchievementsSection'
// import SalaryExpectationSection from './personnel/SalaryExpectationSection'
// import EnglishLevelSection from './personnel/EnglishLevelSection'
// import AvailabilitySection from './personnel/AvailabilitySection'
import { primaryButtonClass, secondaryButtonClass } from '../form/styles'

type SubmitStatus = 'idle' | 'valid' | 'invalid'

export default function PersonnelEntryForm() {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const methods = useForm<PersonnelEntryValues>({
    resolver: zodResolver(personnelEntrySchema),
    defaultValues: personnelEntryDefaults,
    mode: 'onTouched',
  })

  const { handleSubmit, reset } = methods

  // No se recibe ni se registra el objeto de datos: no existe un servicio de envío.
  const submitForm = handleSubmit(
    () => setStatus('valid'),
    () => setStatus('invalid'),
  )

  const confirmClear = () => {
    reset()
    setStatus('idle')
    setConfirmClearOpen(false)
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-5">
        {status === 'invalid' && (
          <div
            role="alert"
            className="flex items-start gap-3 border border-[#e7b4b4] bg-[#fdf2f2] p-4 text-[13px] leading-5 text-[#8a1c15]"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Revisa los campos marcados con un mensaje de error antes de continuar. Las
              validaciones se ejecutan en el navegador.
            </p>
          </div>
        )}

        {status === 'valid' && (
          <div
            role="status"
            className="flex items-start gap-3 border border-[#b9d3e6] bg-[#f1f7fb] p-4 text-[13px] leading-5 text-[#174a68]"
          >
            <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              El formulario se validó correctamente. Esta es una demostración: los datos no
              se envían ni se almacenan en ningún servidor.
            </p>
          </div>
        )}

        <form
          noValidate
          onSubmit={submitForm}
          onChange={() => setStatus('idle')}
          className="space-y-5"
        >
          <PersonalDataSection />
          {/* <AcademicAndBankSection />
          <JobSatisfactionSection />
          <SelfAssessmentSection />
          <AchievementsSection />
          <SalaryExpectationSection />
          <EnglishLevelSection />
          <AvailabilitySection /> */}

          <div className="border border-[#e3e3e3] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[620px] text-[12px] leading-5 text-[#666]">
                Los campos marcados con <span className="font-bold text-brand-red">*</span> son
                obligatorios. Las validaciones de este formulario no sustituyen la validación
                del servidor.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  className={secondaryButtonClass}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Limpiar formulario
                </button>
                <button type="submit" className={primaryButtonClass}>
                  <Send aria-hidden="true" className="h-4 w-4" />
                  Enviar formulario
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Modal
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        labelledBy="confirmar-limpiar-titulo"
      >
        <div className="p-8">
          <h2
            id="confirmar-limpiar-titulo"
            className="pr-10 text-[22px] font-black leading-7 text-brand-ink"
          >
            ¿Limpiar el formulario?
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-[#555]">
            Se borrarán todos los datos ingresados, incluidos los hijos y los contactos de
            emergencia. Esta acción no se puede deshacer.
          </p>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setConfirmClearOpen(false)}
              className={secondaryButtonClass}
            >
              Cancelar
            </button>
            <button type="button" onClick={confirmClear} className={primaryButtonClass}>
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Sí, limpiar formulario
            </button>
          </div>
        </div>
      </Modal>
    </FormProvider>
  )
}
