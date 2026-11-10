import { useFormContext, useWatch } from 'react-hook-form'
import type { PersonnelEntryValues } from '../../../schemas/personnelEntry'
import { currentYear } from '../../../schemas/personnelEntry'
import { bankOptions, notInformedOption, yesNoOptions } from '../../../data/personnelEntry'
import FormSection, { FormSubsection } from '../../form/FormSection'
import SelectField from '../../form/SelectField'
import TextField from '../../form/TextField'
import RadioGroupField from '../../form/RadioGroupField'
import { toOptionalNumber } from '../../form/registerHelpers'
import { fieldGridClass } from '../../form/styles'

/**
 * Antecedentes académicos y profesionales, incluida la información bancaria.
 *
 * El documento original menciona nuevamente "Nacionalidad" en esta sección.
 * No se duplica el campo: la nacionalidad se registra una sola vez en la sección A.
 */

/** La situación académica es opcional: se ofrece una opción explícita para no responder. */
const studyingChoices = [...yesNoOptions, notInformedOption]

export default function AcademicAndBankSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PersonnelEntryValues>()

  const isStudying = useWatch({ control, name: 'isStudying' })

  return (
    <FormSection
      letter="B"
      title="Antecedentes académicos y profesionales"
      description="Estudios, situación académica actual y datos para el abono de haberes."
    >
      <div className="space-y-8">
        <FormSubsection
          title="Formación"
          description="La nacionalidad se registra una sola vez, en la sección A."
        >
          <div className={fieldGridClass}>
            <TextField
              label="Título o profesión"
              autoComplete="organization-title"
              placeholder="Ej. Ingeniero de Minas"
              error={errors.academicTitle?.message}
              {...register('academicTitle')}
            />
            <TextField
              label="Institución educativa"
              autoComplete="organization"
              error={errors.academicInstitution?.message}
              {...register('academicInstitution')}
            />
            <RadioGroupField
              legend="¿Está cursando una carrera?"
              registration={register('isStudying')}
              options={studyingChoices}
              error={errors.isStudying?.message}
            />
            {isStudying === 'si' && (
              <TextField
                label="Carrera actual"
                required
                placeholder="Nombre de la carrera"
                error={errors.currentCareer?.message}
                {...register('currentCareer')}
              />
            )}
            <TextField
              label="Año de ingreso"
              type="number"
              inputMode="numeric"
              min={1950}
              max={currentYear}
              hint={`Entre 1950 y ${currentYear}.`}
              error={errors.entryYear?.message}
              {...register('entryYear', { setValueAs: toOptionalNumber })}
            />
            <TextField
              label="Institución adicional"
              hint="Opcional. Otros estudios o instituciones."
              autoComplete="organization"
              error={errors.additionalInstitution?.message}
              {...register('additionalInstitution')}
            />
          </div>
        </FormSubsection>

        <FormSubsection
          title="Información bancaria"
          description="Opcional. Datos de la cuenta para el pago de remuneraciones y CTS."
        >
          <div className={fieldGridClass}>
            <SelectField
              label="Banco de la cuenta actual"
              placeholder="Selecciona un banco"
              options={bankOptions}
              error={errors.bankName?.message}
              {...register('bankName')}
            />
            <TextField
              label="Número de cuenta"
              type="text"
              inputMode="numeric"
              maxLength={20}
              autoComplete="off"
              hint="Opcional. Solo números, sin espacios ni guiones."
              error={errors.bankAccount?.message}
              {...register('bankAccount')}
            />
            <TextField
              label="Código de cuenta interbancario (CCI)"
              type="text"
              inputMode="numeric"
              maxLength={20}
              autoComplete="off"
              hint="Opcional. 20 dígitos."
              error={errors.cci?.message}
              {...register('cci')}
            />
            <SelectField
              label="Banco para la cuenta CTS"
              placeholder="Selecciona un banco"
              options={bankOptions}
              error={errors.ctsBank?.message}
              {...register('ctsBank')}
            />
          </div>
        </FormSubsection>
      </div>
    </FormSection>
  )
}
