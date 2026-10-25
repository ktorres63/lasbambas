/** Construye aria-describedby a partir de las ayudas visibles del campo. */
export function getDescribedBy(
  id: string,
  hint?: string,
  error?: string,
): string | undefined {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}

/** Obtiene el mensaje de error a nivel de un campo con useFieldArray. */
export function getArrayRootError(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined

  const root = (error as { root?: { message?: unknown } }).root
  return typeof root?.message === 'string' ? root.message : undefined
}
