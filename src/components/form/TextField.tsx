import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import FieldWrapper from './FieldWrapper'
import { getDescribedBy } from './fieldA11y'
import { inputClass } from './styles'

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  label: string
  id?: string
  error?: string
  hint?: string
  /** Contenido visual fijo dentro del campo, por ejemplo "S/". */
  prefix?: string
  /** Clases para el contenedor (útil para ocupar varias columnas). */
  wrapClassName?: string
  inputClassName?: string
}

export default function TextField({
  label,
  id,
  error,
  hint,
  prefix,
  wrapClassName,
  inputClassName = '',
  required = false,
  ...inputProps
}: TextFieldProps) {
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
        {prefix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[14px] font-medium text-[#555]"
          >
            {prefix}
          </span>
        )}
        <input
          {...inputProps}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} ${prefix ? 'pl-10' : ''} ${inputClassName}`}
        />
      </div>
    </FieldWrapper>
  )
}
