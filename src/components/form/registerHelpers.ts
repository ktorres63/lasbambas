/**
 * Convierte el valor de un input numérico vacío en undefined.
 * La validación de rangos y obligatoriedad permanece en el esquema Zod.
 */
export function toOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}
