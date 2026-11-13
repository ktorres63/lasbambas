/**
 * Reemplaza saltos de línea, tabulaciones y espacios repetidos por un espacio
 * simple. Se usa tanto al escribir en el formulario como antes de enviar a
 * Google Sheets para que las celdas no contengan saltos de línea.
 */
export function collapseWhitespace(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\n\t\f\v\u00a0]+/g, ' ')
    .replace(/ {2,}/g, ' ')
}
