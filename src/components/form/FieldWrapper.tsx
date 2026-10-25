import type { ReactNode } from 'react'
import { errorClass, hintClass, labelClass, requiredMarkClass } from './styles'

interface FieldWrapperProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

/** Estructura común de etiqueta, ayuda, control y mensaje de error. */
export default function FieldWrapper({
  id,
  label,
  required = false,
  hint,
  error,
  className = '',
  children,
}: FieldWrapperProps) {
  return (
    <div className={`min-w-0 scroll-mt-32 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className={requiredMarkClass}>
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        )}
      </label>

      {hint && (
        <p id={`${id}-hint`} className={hintClass}>
          {hint}
        </p>
      )}

      <div className="mt-1.5">{children}</div>

      {error && (
        <p id={`${id}-error`} className={errorClass} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
