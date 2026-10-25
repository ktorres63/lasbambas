import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import FieldWrapper from './FieldWrapper'
import { getDescribedBy } from './fieldA11y'
import { textareaClass } from './styles'

export interface TextareaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {
  label: string
  id?: string
  error?: string
  hint?: string
  wrapClassName?: string
  textareaClassName?: string
}

export default function TextareaField({
  label,
  id,
  error,
  hint,
  wrapClassName,
  textareaClassName = '',
  required = false,
  ...textareaProps
}: TextareaFieldProps) {
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
      <textarea
        {...textareaProps}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${textareaClass} ${textareaClassName}`}
      />
    </FieldWrapper>
  )
}
