import { useFormContext } from 'react-hook-form'
import type { PersonnelEntryValues } from '../../../schemas/personnelEntry'
import { englishLevelOptions } from '../../../data/personnelEntry'
import FormSection from '../../form/FormSection'
import RadioGroupField from '../../form/RadioGroupField'

export default function EnglishLevelSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonnelEntryValues>()

  return (
    <FormSection
      letter="G"
      title="Nivel de inglés"
      description="Selecciona el nivel que mejor describe tu dominio del idioma. Este campo es opcional."
    >
      <RadioGroupField
        legend="Nivel de inglés"
        registration={register('englishLevel')}
        options={englishLevelOptions}
        error={errors.englishLevel?.message}
      />
    </FormSection>
  )
}
