import { useFormContext } from 'react-hook-form'
import type { PersonnelEntryValues } from '../../../schemas/personnelEntry'
import FormSection from '../../form/FormSection'
import TextField from '../../form/TextField'
import { toOptionalNumber } from '../../form/registerHelpers'

/**
 * La empresa aún debe confirmar si la expectativa se expresa en monto bruto o neto.
 * El formulario no agrega esa condición ni la muestra como si estuviera definida.
 */
export default function SalaryExpectationSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonnelEntryValues>()

  return (
    <FormSection
      letter="F"
      title="Expectativa salarial"
      description="Indica el monto mensual que esperas percibir. Este campo es opcional."
    >
      <div className="max-w-[360px]">
        <TextField
          label="Expectativa salarial mensual (PEN)"
          type="number"
          inputMode="decimal"
          min={1}
          max={1_000_000}
          step={1}
          prefix="S/"
          hint="Monto mensual en soles peruanos."
          error={errors.monthlySalaryExpectation?.message}
          {...register('monthlySalaryExpectation', { setValueAs: toOptionalNumber })}
        />
      </div>
    </FormSection>
  )
}
