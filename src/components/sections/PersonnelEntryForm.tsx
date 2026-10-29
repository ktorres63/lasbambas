import { useEffect, useRef, useState } from 'react'
import type { ComponentType, FormEvent, KeyboardEvent, ReactNode } from 'react'
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
import type { LucideIcon } from 'lucide-react'
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

interface SubmissionState {
  status: SubmitStatus
  error: string | null
}

interface StepRequest {
  id: number
  focusField: FieldPath<PersonnelEntryValues> | null
}

/** Clases extra para deshabilitar los botones mientras se envía. */
const disabledClass = 'disabled:cursor-not-allowed disabled:opacity-50'

const noticeClass = {
  error: 'border-[#e7b4b4] bg-[#fdf2f2] text-[#8a1c15]',
  info: 'border-[#b9d3e6] bg-[#f1f7fb] text-[#174a68]',
  neutral: 'border-[#e3e3e3] bg-[#fafafa] text-[#555]',
  warning: 'border-[#e7d7a8] bg-[#fdf9ec] text-[#7a5c12]',
} as const

interface StatusNoticeConfig {
  role: 'alert' | 'status'
  className: string
  Icon: LucideIcon
  message?: ReactNode
}

const STATUS_NOTICES: Record<Exclude<SubmitStatus, 'idle'>, StatusNoticeConfig> = {
  invalid: {
    role: 'alert',
    className: noticeClass.error,
    Icon: AlertCircle,
    message:
      'Revisa los campos marcados con un mensaje de error antes de continuar. Las validaciones se ejecutan en el navegador.',
  },
  sent: {
    role: 'status',
    className: noticeClass.info,
    Icon: Info,
    message: '¡Gracias! Tu ficha de ingreso se envió correctamente y quedó registrada.',
  },
  sending: {
    role: 'status',
    className: noticeClass.neutral,
    Icon: Info,
    message: 'Enviando tu ficha de ingreso, no cierres esta página…',
  },
  unverified: {
    role: 'status',
    className: noticeClass.warning,
    Icon: Info,
    message:
      'Tu envío se realizó, pero el navegador no pudo confirmar la respuesta del servicio. Si no recibes confirmación por correo, vuelve a enviar la ficha.',
  },
  'not-configured': {
    role: 'alert',
    className: noticeClass.error,
    Icon: AlertCircle,
    message: (
      <>
        El envío no está configurado: falta definir la URL del servicio en el archivo{' '}
        <code className="font-mono">.env</code>. Tu información no se envió.
      </>
    ),
  },
  error: {
    role: 'alert',
    className: noticeClass.error,
    Icon: AlertCircle,
  },
}

function FormStatusNotice({ status, error }: SubmissionState) {
  if (status === 'idle') return null

  const { role, className, Icon, message } = STATUS_NOTICES[status]

  return (
    <div
      role={role}
      className={`flex items-start gap-3 border p-4 text-[13px] leading-5 ${className}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <p>
        {status === 'error' ? (
          <>
            {error ?? 'No se pudo enviar la ficha.'} Tus datos siguen en el formulario,
            puedes intentarlo de nuevo.
          </>
        ) : (
          message
        )}
      </p>
    </div>
  )
}

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

const LAST_STEP_INDEX = FORM_STEPS.length - 1
const ENTER_ALLOWED_INPUT_TYPES = new Set([
  'button',
  'submit',
  'reset',
  'checkbox',
  'radio',
  'file',
])

/** Comprueba si un campo o array de campos tiene un error de validación. */
function hasFieldError(errors: unknown, field: string): boolean {
  const value = field.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[key]
  }, errors)

  return value !== undefined && value !== null
}

interface StepProgressProps {
  currentStep: number
  isSending: boolean
  onStepChange: (index: number) => void
}

function StepProgress({ currentStep, isSending, onStepChange }: StepProgressProps) {
  const step = FORM_STEPS[currentStep]

  return (
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
            <li key={formStep.id} className="flex-1">
              <button
                type="button"
                onClick={() => onStepChange(index)}
                disabled={index > currentStep || isSending}
                aria-current={isCurrent ? 'step' : undefined}
                className="group block w-full pt-1 text-left disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <span
                  className={`block h-1.5 transition-colors duration-200 ${
                    isCurrent || isComplete ? 'bg-brand-red' : 'bg-[#e0e0e0]'
                  } ${isComplete ? 'group-hover:bg-brand-red-dark' : ''}`}
                />
                <span className="sr-only">
                  Paso {index + 1}, {formStep.title}
                  {isComplete ? ', completado' : isCurrent ? ', actual' : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <p className="sr-only" role="status" aria-live="polite">
        Paso {currentStep + 1} de {FORM_STEPS.length}: {step.title}
      </p>
    </nav>
  )
}

export default function PersonnelEntryForm() {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
    error: null,
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [stepRequest, setStepRequest] = useState<StepRequest>({
    id: 0,
    focusField: null,
  })
  const [formScrollRequest, setFormScrollRequest] = useState(0)
  const [formVersion, setFormVersion] = useState(0)
  const stepTopRef = useRef<HTMLDivElement>(null)
  const formTopRef = useRef<HTMLDivElement>(null)

  const methods = useForm<PersonnelEntryValues>({
    resolver: zodResolver(personnelEntrySchema),
    defaultValues: personnelEntryDefaults,
    mode: 'onTouched',
    shouldFocusError: false,
  })

  const {
    handleSubmit,
    reset,
    trigger,
    setFocus,
    getFieldState,
    formState: { isDirty },
  } = methods
  const { status, error } = submission
  const step = FORM_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === LAST_STEP_INDEX
  const isSending = status === 'sending'
  const isSent = status === 'sent'

  const updateStatus = (nextStatus: SubmitStatus) => {
    setSubmission((current) =>
      current.status === nextStatus && current.error === null
        ? current
        : { status: nextStatus, error: null },
    )
  }

  const requestStepScroll = (focusField?: FieldPath<PersonnelEntryValues>) => {
    setStepRequest((current) => ({
      id: current.id + 1,
      focusField: focusField ?? null,
    }))
  }

  const scrollToForm = () => {
    setFormScrollRequest((request) => request + 1)
  }

  useEffect(() => {
    if (!stepRequest.id) return

    stepTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    // Lleva el foco al título del paso visible para que se anuncie el cambio.
    const heading = stepTopRef.current?.querySelector<HTMLElement>(
      '[data-step]:not([hidden]) h2',
    )
    heading?.focus({ preventScroll: true })

    const { focusField } = stepRequest
    if (!focusField) return

    const timer = window.setTimeout(() => setFocus(focusField), 0)
    return () => window.clearTimeout(timer)
  }, [stepRequest, setFocus])

  useEffect(() => {
    if (!formScrollRequest) return
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [formScrollRequest])

  const goToStep = (index: number, focusField?: FieldPath<PersonnelEntryValues>) => {
    setCurrentStep(index)
    requestStepScroll(focusField)
  }

  const goNext = async () => {
    const isValidStep = await trigger(step.fields)

    if (!isValidStep) {
      updateStatus('invalid')
      const firstError = step.fields.find((field) => getFieldState(field).invalid)
      goToStep(currentStep, firstError)

      if (firstError) setFocus(firstError)
      return
    }

    updateStatus('idle')
    goToStep(Math.min(currentStep + 1, LAST_STEP_INDEX))
  }

  const goPrevious = () => {
    updateStatus('idle')
    goToStep(Math.max(currentStep - 1, 0))
  }

  const resetForm = () => {
    reset()
    setCurrentStep(0)
    // Remonta los campos para que los contadores y las listas vuelvan a cero.
    setFormVersion((version) => version + 1)
  }

  // Envía la ficha al Web App de Google Apps Script (Google Sheets).
  const submitForm = handleSubmit(
    async (values) => {
      updateStatus('sending')
      const result = await submitPersonnelEntry(values)

      switch (result.status) {
        case 'success':
          updateStatus('sent')
          resetForm()
          scrollToForm()
          return
        case 'unverified':
          updateStatus('unverified')
          scrollToForm()
          return
        case 'not-configured':
          updateStatus('not-configured')
          return
        case 'error':
          setSubmission({ status: 'error', error: result.message })
      }
    },
    (formErrors) => {
      updateStatus('invalid')

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

  /**
   * Evita el envío implícito del navegador: pulsar Enter dentro de un campo de
   * texto (o de la fecha) enviaba el formulario completo desde cualquier paso.
   * Ahora solo el botón "Enviar formulario" lo envía; Enter sobre un botón
   * sigue funcionando normalmente.
   */
  const onFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return

    const target = event.target
    if (
      !(target instanceof HTMLInputElement) ||
      ENTER_ALLOWED_INPUT_TYPES.has(target.type)
    ) {
      return
    }

    event.preventDefault()
  }

  /** Mantiene el aviso durante el envío y lo retira al comenzar una nueva ficha. */
  const onFormChange = () => {
    if (isSending) return
    updateStatus('idle')
  }

  const confirmClear = () => {
    updateStatus('idle')
    resetForm()
    requestStepScroll()
    setConfirmClearOpen(false)
  }

  return (
    <FormProvider {...methods}>
      <div key={formVersion} ref={formTopRef} className="scroll-mt-28 space-y-5">
        <FormStatusNotice status={status} error={error} />

        <form
          noValidate
          onSubmit={onFormSubmit}
          onChange={onFormChange}
          onKeyDown={onFormKeyDown}
          className="space-y-5"
        >
          <div ref={stepTopRef} className="scroll-mt-28 space-y-5">
            <StepProgress
              currentStep={currentStep}
              isSending={isSending}
              onStepChange={goToStep}
            />

            {FORM_STEPS.map((formStep, index) => {
              const Section = formStep.Component

              return (
                <div key={formStep.id} data-step hidden={index !== currentStep}>
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
                  disabled={isSending || !isDirty}
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
                      key="submit"
                      type="submit"
                      className={`${primaryButtonClass} ${disabledClass}`}
                      disabled={isSending || isSent}
                    >
                      <Send aria-hidden="true" className="h-4 w-4" />
                      {isSending ? 'Enviando…' : isSent ? 'Enviado' : 'Enviar formulario'}
                    </button>
                  ) : (
                    <button
                      key="next"
                      type="button"
                      onClick={(event) => {
                        // Evita que el cambio al último paso convierta este clic en un envío.
                        event.preventDefault()
                        void goNext()
                      }}
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
