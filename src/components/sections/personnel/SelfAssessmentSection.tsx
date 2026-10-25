import { useFormContext } from 'react-hook-form'
import type { PersonnelEntryValues } from '../../../schemas/personnelEntry'
import FormSection from '../../form/FormSection'
import TextareaField from '../../form/TextareaField'

export default function SelfAssessmentSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonnelEntryValues>()

  return (
    <FormSection
      letter="D"
      title="Autocalificación"
      description="Estas preguntas son opcionales y permiten conocer tu autoevaluación."
    >
      <div className="space-y-5">
        <TextareaField
          label="¿Cuáles considera que son sus fortalezas?"
          error={errors.strengths?.message}
          {...register('strengths')}
        />
        <TextareaField
          label="¿Qué aspectos necesita desarrollar y qué está haciendo al respecto?"
          error={errors.developmentAreas?.message}
          {...register('developmentAreas')}
        />
      </div>
    </FormSection>
  )
}
