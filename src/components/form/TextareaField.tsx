import { useId, useState } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import FieldWrapper from './FieldWrapper'
import { getDescribedBy } from './fieldA11y'
import { textareaClass } from './styles'
import { collapseWhitespace } from '../../utils/text'

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
  maxLength,
  onChange,
  onKeyDown,
  ...textareaProps
}: TextareaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedBy = getDescribedBy(fieldId, hint, error)
  const [length, setLength] = useState(0)
  const showsCounter = typeof maxLength === 'number'

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
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            return
          }
          onKeyDown?.(event)
        }}
        onChange={(event) => {
          const normalized = collapseWhitespace(event.currentTarget.value)
          if (normalized !== event.currentTarget.value) {
            event.currentTarget.value = normalized
          }
          setLength(normalized.length)
          onChange?.(event)
        }}
        className={`${textareaClass} ${textareaClassName}`}
      />

      {showsCounter && (
        <p className="mt-1 text-right text-[11px] leading-4 text-[#777]">
          {length} / {maxLength} caracteres
        </p>
      )}
    </FieldWrapper>
  )
}
