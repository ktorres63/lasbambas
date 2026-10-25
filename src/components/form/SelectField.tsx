import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import FieldWrapper from './FieldWrapper'
import { getDescribedBy } from './fieldA11y'
import { inputClass } from './styles'
import type { SelectOption } from '../../data/personnelEntry'

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className'> {
  label: string
  options: SelectOption[]
  id?: string
  error?: string
  hint?: string
  placeholder?: string
  wrapClassName?: string
  selectClassName?: string
}

export default function SelectField({
  label,
  options,
  id,
  error,
  hint,
  placeholder = 'Selecciona una opción',
  wrapClassName,
  selectClassName = '',
  required = false,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedBy = getDescribedBy(fieldId, hint, error)

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={wrapClassName}
    >
      <div className="relative">
        <select
          {...selectProps}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} appearance-none pr-10 ${selectClassName}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]"
        />
      </div>
    </FieldWrapper>
  )
}
