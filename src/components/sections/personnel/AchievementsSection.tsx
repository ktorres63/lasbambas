import { useFormContext } from 'react-hook-form'
import type { PersonnelEntryValues } from '../../../schemas/personnelEntry'
import FormSection from '../../form/FormSection'
import TextareaField from '../../form/TextareaField'

export default function AchievementsSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonnelEntryValues>()

  return (
    <FormSection
      letter="E"
      title="Logros y experiencia laboral"
      description="Esta pregunta es opcional."
    >
      <TextareaField
        label="¿Cuál considera el mayor logro obtenido en su última experiencia laboral?"
        error={errors.greatestAchievement?.message}
        {...register('greatestAchievement')}
      />
    </FormSection>
  )
}
