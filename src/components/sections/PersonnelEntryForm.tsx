import { useEffect, useRef, useState } from 'react'
import type { ComponentType, FormEvent } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Info,
  Send,
  Trash2,
} from 'lucide-react'
import { personnelEntryDefaults } from '../../data/personnelEntry'
import {
  personnelEntrySchema,
  type PersonnelEntryValues,
} from '../../schemas/personnelEntry'
import Modal from '../ui/Modal'
import PersonalDataSection from './personnel/PersonalDataSection'
import AcademicAndBankSection from './personnel/AcademicAndBankSection'
import JobSatisfactionSection from './personnel/JobSatisfactionSection'
import SelfAssessmentSection from './personnel/SelfAssessmentSection'
import AchievementsSection from './personnel/AchievementsSection'
import SalaryExpectationSection from './personnel/SalaryExpectationSection'
import EnglishLevelSection from './personnel/EnglishLevelSection'
import AvailabilitySection from './personnel/AvailabilitySection'
import { primaryButtonClass, secondaryButtonClass } from '../form/styles'
import { submitPersonnelEntry } from '../../services/googleSheets'

type SubmitStatus =
  | 'idle'
  | 'invalid'
  | 'sending'
  | 'sent'
  | 'unverified'
  | 'error'
  | 'not-configured'

/** Clases extra para deshabilitar los botones mientras se envía. */
const disabledClass = 'disabled:cursor-not-allowed disabled:opacity-50'

interface FormStep {
  id: string
  title: string
  Component: ComponentType
  fields: FieldPath<PersonnelEntryValues>[]
}

const FORM_STEPS: FormStep[] = [
  {
    id: 'A',
    title: 'Datos personales',
    Component: PersonalDataSection,
    fields: [
      'fullName',
      'dni',
      'birthDate',
      'nationality',
      'nationalityOther',
      'address',
      'district',
      'province',
      'fixedPhone',
      'mobile',
      'pensionSystem',
      'afpCommission',
      'maritalStatus',
      'spouseName',
      'personalEmail',
      'telradEmail',
      'shoeSize',
      'shirtSize',
      'pantsSize',
      'hasChildren',
      'children',
      'emergencyContacts',
      'previousCompanies',
    ],
  },
  {
    id: 'B',
    title: 'Antecedentes académicos y profesionales',
    Component: AcademicAndBankSection,
    fields: [
      'academicTitle',
      'academicInstitution',
      'isStudying',
      'currentCareer',
      'entryYear',
      'additionalInstitution',
      'bankName',
      'bankAccount',
      'cci',
      'ctsBank',
    ],
  },
  {
    id: 'C',
    title: 'Aspectos de satisfacción laboral',
    Component: JobSatisfactionSection,
    fields: ['satisfactionMost', 'satisfactionLeast', 'satisfactionNeeds'],
  },
  {
    id: 'D',
    title: 'Autocalificación',
    Component: SelfAssessmentSection,
    fields: ['strengths', 'developmentAreas'],
  },
  {
    id: 'E',
    title: 'Logros y experiencia laboral',
    Component: AchievementsSection,
    fields: ['greatestAchievement'],
  },
  {
    id: 'F',
    title: 'Expectativa salarial',
    Component: SalaryExpectationSection,
    fields: ['monthlySalaryExpectation'],
  },
  {
    id: 'G',
    title: 'Nivel de inglés',
    Component: EnglishLevelSection,
    fields: ['englishLevel'],
  },
  {
    id: 'H',
    title: 'Disponibilidad',
    Component: AvailabilitySection,
    fields: ['availability', 'availableFrom'],
  },
]

/** Comprueba si un campo o array de campos tiene un error de validación. */
function hasFieldError(errors: unknown, field: string): boolean {
  const value = field.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[key]
  }, errors)

  return value !== undefined && value !== null
}

export default function PersonnelEntryForm() {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [pendingFocus, setPendingFocus] =
    useState<FieldPath<PersonnelEntryValues> | null>(null)
  const [scrollRequest, setScrollRequest] = useState(0)
  const stepTopRef = useRef<HTMLDivElement>(null)

  const methods = useForm<PersonnelEntryValues>({
    resolver: zodResolver(personnelEntrySchema),
    defaultValues: personnelEntryDefaults,
    mode: 'onTouched',
    shouldFocusError: false,
  })

  const { handleSubmit, reset, trigger, setFocus } = methods
  const step = FORM_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === FORM_STEPS.length - 1

  useEffect(() => {
    if (!pendingFocus) return

    const timer = window.setTimeout(() => {
      setFocus(pendingFocus)
      setPendingFocus(null)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [pendingFocus, setFocus])

  useEffect(() => {
    if (!scrollRequest) return

    stepTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [scrollRequest])

  const goToStep = (index: number, focusField?: FieldPath<PersonnelEntryValues>) => {
    setCurrentStep(index)
    setPendingFocus(focusField ?? null)
    setScrollRequest((request) => request + 1)
  }

  const goNext = async () => {
    const fields = step.fields
    const isValidStep = await trigger(fields)

    if (!isValidStep) {
      setStatus('invalid')
      const firstError = fields.find((field) =>
        methods.getFieldState(field).invalid,
      )
      setPendingFocus(firstError ?? null)
      setScrollRequest((request) => request + 1)

      if (firstError) {
        setFocus(firstError)
      }
      return
    }

    setStatus('idle')
    goToStep(Math.min(currentStep + 1, FORM_STEPS.length - 1))
  }

  const goPrevious = () => {
    setStatus('idle')
    goToStep(Math.max(currentStep - 1, 0))
  }

  const isSending = status === 'sending'

  // Envía la ficha al Web App de Google Apps Script (Google Sheets).
  const submitForm = handleSubmit(
    async (values) => {
      setSubmitError(null)
      setStatus('sending')

      const result = await submitPersonnelEntry(values)

      if (result.status === 'success') {
        setStatus('sent')
        reset()
        setCurrentStep(0)
        return
      }

      if (result.status === 'unverified') {
        setStatus('unverified')
        reset()
        setCurrentStep(0)
        return
      }

      if (result.status === 'not-configured') {
        setStatus('not-configured')
        return
      }

      setSubmitError(result.message)
      setStatus('error')
    },
    (formErrors) => {
      setStatus('invalid')

      const errorStepIndex = FORM_STEPS.findIndex((formStep) =>
        formStep.fields.some((field) => hasFieldError(formErrors, field)),
      )

      if (errorStepIndex === -1) return

      const errorStep = FORM_STEPS[errorStepIndex]
      const firstError = errorStep.fields.find((field) =>
        hasFieldError(formErrors, field),
      )
      goToStep(errorStepIndex, firstError)
    },
  )

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (isLastStep) {
      void submitForm(event)
      return
    }

    event.preventDefault()
    void goNext()
  }

  const confirmClear = () => {
    reset()
    setStatus('idle')
    setCurrentStep(0)
    setPendingFocus(null)
    setScrollRequest((request) => request + 1)
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

        {status === 'sent' && (
          <div
            role="status"
            className="flex items-start gap-3 border border-[#b9d3e6] bg-[#f1f7fb] p-4 text-[13px] leading-5 text-[#174a68]"
          >
            <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              ¡Gracias! Tu ficha de ingreso se envió correctamente y quedó registrada.
            </p>
          </div>
        )}

        {status === 'sending' && (
          <div
            role="status"
            className="flex items-start gap-3 border border-[#e3e3e3] bg-[#fafafa] p-4 text-[13px] leading-5 text-[#555]"
          >
            <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Enviando tu ficha de ingreso, no cierres esta página…</p>
          </div>
        )}

        {status === 'unverified' && (
          <div
            role="status"
            className="flex items-start gap-3 border border-[#e7d7a8] bg-[#fdf9ec] p-4 text-[13px] leading-5 text-[#7a5c12]"
          >
            <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Tu envío se realizó, pero el navegador no pudo confirmar la respuesta del
              servicio. Si no recibes confirmación por correo, vuelve a enviar la ficha.
            </p>
          </div>
        )}

        {status === 'not-configured' && (
          <div
            role="alert"
            className="flex items-start gap-3 border border-[#e7b4b4] bg-[#fdf2f2] p-4 text-[13px] leading-5 text-[#8a1c15]"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              El envío no está configurado: falta definir la URL del servicio en el
              archivo <code className="font-mono">.env</code>. Tu información no se envió.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="flex items-start gap-3 border border-[#e7b4b4] bg-[#fdf2f2] p-4 text-[13px] leading-5 text-[#8a1c15]"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              {submitError ?? 'No se pudo enviar la ficha.'} Tus datos siguen en el
              formulario, puedes intentarlo de nuevo.
            </p>
          </div>
        )}

        <form
          noValidate
          onSubmit={onFormSubmit}
          onChange={() => setStatus('idle')}
          className="space-y-5"
        >
          <div ref={stepTopRef} className="scroll-mt-28 space-y-5">
            <nav
              aria-label="Progreso del formulario"
              className="border border-[#e3e3e3] bg-white p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12px] font-bold uppercase tracking-[1px] text-brand-red">
                  Paso {currentStep + 1} de {FORM_STEPS.length}
                </p>
                <p className="text-[13px] font-bold text-brand-ink">{step.title}</p>
              </div>

              <ol className="mt-3 flex gap-1.5">
                {FORM_STEPS.map((formStep, index) => {
                  const isCurrent = index === currentStep
                  const isComplete = index < currentStep

                  return (
                    <li
                      key={formStep.id}
                      className="flex-1"
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <span
                        className={`block h-1.5 ${
                          isCurrent || isComplete ? 'bg-brand-red' : 'bg-[#e0e0e0]'
                        }`}
                      />
                      <span className="sr-only">
                        Paso {index + 1}, {formStep.title}
                        {isComplete ? ', completado' : isCurrent ? ', actual' : ''}
                      </span>
                    </li>
                  )
                })}
              </ol>

              <p className="sr-only" role="status" aria-live="polite">
                Paso {currentStep + 1} de {FORM_STEPS.length}: {step.title}
              </p>
            </nav>

            {FORM_STEPS.map((formStep, index) => {
              const Section = formStep.Component

              return (
                <div key={formStep.id} hidden={index !== currentStep}>
                  <Section />
                </div>
              )
            })}

            <div className="border border-[#e3e3e3] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  className={`${secondaryButtonClass} ${disabledClass}`}
                  disabled={isSending}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Limpiar formulario
                </button>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  {!isFirstStep && (
                    <button
                      type="button"
                      onClick={goPrevious}
                      className={`${secondaryButtonClass} ${disabledClass}`}
                      disabled={isSending}
                    >
                      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                      Anterior
                    </button>
                  )}

                  {isLastStep ? (
                    <button
                      type="submit"
                      className={`${primaryButtonClass} ${disabledClass}`}
                      disabled={isSending}
                    >
                      <Send aria-hidden="true" className="h-4 w-4" />
                      {isSending ? 'Enviando…' : 'Enviar formulario'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void goNext()}
                      className={`${primaryButtonClass} ${disabledClass}`}
                      disabled={isSending}
                    >
                      Siguiente
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-4 border-t border-[#eee] pt-4 text-[12px] leading-5 text-[#666]">
                Paso {currentStep + 1} de {FORM_STEPS.length}. Los campos marcados con{' '}
                <span className="font-bold text-brand-red">*</span> son obligatorios. La
                validación de este formulario se ejecuta en el navegador.
              </p>

              <p className="mt-2 text-[12px] leading-5 text-[#777]">
                Al enviar la ficha, tus datos se registran en una hoja de cálculo de Google
                administrada por la empresa.
              </p>
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
