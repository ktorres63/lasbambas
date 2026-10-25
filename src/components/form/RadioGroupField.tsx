import type { UseFormRegisterReturn } from 'react-hook-form'
import { errorClass, hintClass, labelClass, requiredMarkClass } from './styles'
import { getDescribedBy } from './fieldA11y'
import type { SelectOption } from '../../data/personnelEntry'

interface RadioGroupFieldProps {
  legend: string
  registration: UseFormRegisterReturn
  options: SelectOption[]
  error?: string
  hint?: string
  required?: boolean
  className?: string
}

/** Grupo de opciones único con botones de radio y foco visible. */
export default function RadioGroupField({
  legend,
  registration,
  options,
  error,
  hint,
  required = false,
  className = '',
}: RadioGroupFieldProps) {
  const describedBy = getDescribedBy(registration.name, hint, error)

  return (
    <fieldset className={`min-w-0 scroll-mt-32 ${className}`} aria-describedby={describedBy}>
      <legend className={labelClass}>
        {legend}
        {required && (
          <>
            <span aria-hidden="true" className={requiredMarkClass}>
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        )}
      </legend>

      {hint && (
        <p id={`${registration.name}-hint`} className={hintClass}>
          {hint}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const optionId = `${registration.name}-${option.value}`
          return (
            <label key={option.value} className="relative inline-flex cursor-pointer">
              <input
                {...registration}
                id={optionId}
                type="radio"
                value={option.value}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                className="peer sr-only"
              />
              <span className="border border-[#cfcfcf] bg-white px-4 py-2 text-[13px] font-semibold text-brand-ink transition-colors duration-200 hover:border-brand-red hover:text-brand-red peer-checked:border-brand-red peer-checked:bg-brand-red peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-red">
                {option.label}
              </span>
            </label>
          )
        })}
      </div>

      {error && (
        <p id={`${registration.name}-error`} className={errorClass} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
