import { useFormContext } from 'react-hook-form'
import type { PersonnelEntryValues } from '../../../schemas/personnelEntry'
import { LONG_ANSWER_MAX_LENGTH } from '../../../data/personnelEntry'
import FormSection from '../../form/FormSection'
import TextareaField from '../../form/TextareaField'

export default function JobSatisfactionSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonnelEntryValues>()

  return (
    <FormSection
      letter="C"
      title="Aspectos de satisfacción laboral"
      description="Estas preguntas son opcionales y ayudan a conocer tus preferencias de trabajo."
    >
      <div className="space-y-5">
        <TextareaField
          label="¿Qué actividad le agradaba más realizar en su última experiencia laboral?"
          maxLength={LONG_ANSWER_MAX_LENGTH}
          error={errors.satisfactionMost?.message}
          {...register('satisfactionMost')}
        />
        <TextareaField
          label="¿Qué actividad le generaba menos satisfacción?"
          maxLength={LONG_ANSWER_MAX_LENGTH}
          error={errors.satisfactionLeast?.message}
          {...register('satisfactionLeast')}
        />
        <TextareaField
          label="¿Qué necesita un centro de labores para brindarle satisfacción?"
          maxLength={LONG_ANSWER_MAX_LENGTH}
          error={errors.satisfactionNeeds?.message}
          {...register('satisfactionNeeds')}
        />
      </div>
    </FormSection>
  )
}
