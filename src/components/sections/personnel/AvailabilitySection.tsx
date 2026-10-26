import { useFormContext, useWatch } from 'react-hook-form'
import type { PersonnelEntryValues } from '../../../schemas/personnelEntry'
import { availabilityOptions } from '../../../data/personnelEntry'
import FormSection from '../../form/FormSection'
import SelectField from '../../form/SelectField'
import TextField from '../../form/TextField'
import { fieldGridClass } from '../../form/styles'

export default function AvailabilitySection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PersonnelEntryValues>()

  const availability = useWatch({ control, name: 'availability' })

  return (
    <FormSection
      letter="H"
      title="Disponibilidad"
      description="Indica cuándo podrías iniciar labores. Este campo es opcional."
    >
      <div className={fieldGridClass}>
        <SelectField
          label="Disponibilidad para iniciar"
          placeholder="Selecciona una opción"
          options={availabilityOptions}
          error={errors.availability?.message}
          {...register('availability')}
        />
        {availability === 'otra-fecha' && (
          <TextField
            label="Fecha de disponibilidad"
            required
            type="date"
            error={errors.availableFrom?.message}
            {...register('availableFrom')}
          />
        )}
      </div>
    </FormSection>
  )
}
