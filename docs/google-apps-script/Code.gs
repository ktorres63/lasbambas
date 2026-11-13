/**
 * Google Apps Script — receptor de la Ficha de ingreso (MineraWeb)
 * ---------------------------------------------------------------
 * Pega este archivo en el editor de Apps Script de la hoja de cálculo
 * (Extensiones > Apps Script), reemplazando el contenido de Código.gs.
 *
 * Despliegue (obligatorio para que el formulario funcione):
 *   1. Implementar > Nueva implementación.
 *   2. Tipo: "Aplicación web".
 *   3. Ejecutar como: "Yo".
 *   4. Quién tiene acceso: "Cualquier persona".
 *   5. Implementar, copiar la URL (termina en /exec) y ponerla en el .env
 *      como VITE_GOOGLE_SCRIPT_URL.
 *
 * Cada vez que edites este código hay que crear una NUEVA implementación
 * (o editar la existente) para que los cambios se publiquen.
 */

/**
 * Nombre de la pestaña donde se escriben las filas.
 * Si tu pestaña se llama distinto, cambia este valor.
 */
var SHEET_NAME = 'Postulaciones'

/** Columna que identifica cada envío y evita filas duplicadas. */
var ID_COLUMN = 'ID de envío'

/**
 * Cabeceras de plantillas anteriores que se reutilizan en lugar de dejar
 * columnas vacías y crear duplicados al final de la hoja.
 */
var HEADER_ALIASES = {
  'ID de envío': ['ID'],
  'Fecha de envío': ['Fecha de registro'],
}

/** Mapa inverso para resolver una cabecera heredada en tiempo constante. */
var HEADER_TO_CANONICAL = (function () {
  var map = {}

  Object.keys(HEADER_ALIASES).forEach(function (canonical) {
    HEADER_ALIASES[canonical].forEach(function (alias) {
      map[alias] = canonical
    })
  })

  return map
})()

function doPost(e) {
  var lock = LockService.getScriptLock()

  try {
    lock.waitLock(30000)
  } catch (lockError) {
    return jsonResponse({ ok: false, error: 'El servicio está ocupado, reintenta.' })
  }

  try {
    var payload = readPayload(e)

    if (!payload) {
      return jsonResponse({ ok: false, error: 'El cuerpo de la petición está vacío.' })
    }

    var sheet = getSheet()
    var headers = ensureHeaders(sheet, payload)

    var submissionId = payload[ID_COLUMN]

    if (submissionId && findRowById(sheet, headers, submissionId) !== -1) {
      // Envío repetido (por ejemplo, un reintento tras un fallo de red): no se duplica.
      return jsonResponse({ ok: true, duplicate: true })
    }

    var row = headers.map(function (header) {
      return normalizeCellValue(payload[canonicalPayloadKey(header)])
    })

    sheet.appendRow(row)
    SpreadsheetApp.flush()

    return jsonResponse({ ok: true })
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) })
  } finally {
    lock.releaseLock()
  }
}

/**
 * GET de prueba: abre la URL /exec en el navegador y confirma que el
 * despliegue funciona antes de probar el formulario.
 */
function doGet() {
  return jsonResponse({
    ok: true,
    service: 'Ficha de ingreso',
    sheet: getSheet().getName(),
  })
}

/**
 * Devuelve la pestaña de destino.
 * - Si existe una pestaña con el nombre indicado, se usa esa.
 * - Si la hoja de cálculo se llama "Postulaciones" pero la pestaña no, y la
 *   primera pestaña está vacía, se reutiliza en lugar de crear una nueva.
 * - En cualquier otro caso se crea la pestaña.
 */
function getSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = spreadsheet.getSheetByName(SHEET_NAME)

  if (sheet) return sheet

  var firstSheet = spreadsheet.getSheets()[0]

  if (firstSheet && firstSheet.getLastRow() === 0) {
    return firstSheet
  }

  return spreadsheet.insertSheet(SHEET_NAME)
}

/** Devuelve la clave actual del payload para una cabecera heredada. */
function canonicalPayloadKey(header) {
  return HEADER_TO_CANONICAL[header] || header
}

/** Indica si una columna no tiene datos debajo de la cabecera. */
function isColumnEmpty(sheet, columnNumber) {
  var lastRow = sheet.getLastRow()

  if (lastRow < 2) return true

  var values = sheet.getRange(2, columnNumber, lastRow - 1, 1).getValues()

  return values.every(function (row) {
    return normalizeCellValue(row[0]) === ''
  })
}

/**
 * Reutiliza las cabeceras antiguas y elimina sus duplicados vacíos.
 * Ejemplo: "ID" pasa a "ID de envío" y "Fecha de registro" a "Fecha de envío".
 * Si la columna actual ya existe en otro lugar, se elimina la antigua vacía.
 */
function reconcileLegacyHeaders(sheet, headers) {
  Object.keys(HEADER_ALIASES).forEach(function (canonical) {
    var aliases = HEADER_ALIASES[canonical]

    aliases.forEach(function (alias) {
      var index = headers.indexOf(alias)

      if (index === -1) return

      if (headers.indexOf(canonical) === -1) {
        sheet.getRange(1, index + 1).setValue(canonical)
        headers[index] = canonical
        return
      }

      if (isColumnEmpty(sheet, index + 1)) {
        sheet.deleteColumn(index + 1)
        headers.splice(index, 1)
      }
    })
  })

  return headers
}

/** Elimina saltos de línea, tabulaciones y espacios repetidos en una celda. */
function normalizeCellValue(value) {
  if (typeof value === 'number') return value
  if (value === undefined || value === null) return ''

  return String(value).replace(/\s+/g, ' ').trim()
}

/** Lee el JSON enviado por el formulario. */
function readPayload(e) {
  var raw = e && e.postData && e.postData.contents

  if (raw) {
    try {
      return JSON.parse(raw)
    } catch (parseError) {
      return null
    }
  }

  // Alternativa: envío como formulario clásico (application/x-www-form-urlencoded).
  if (e && e.parameter && e.parameter.payload) {
    try {
      return JSON.parse(e.parameter.payload)
    } catch (parameterError) {
      return null
    }
  }

  return null
}

/**
 * Garantiza que la cabecera tenga una columna por cada clave recibida.
 * Devuelve la lista de cabeceras en el orden real de la hoja.
 */
function ensureHeaders(sheet, payload) {
  var incoming = Object.keys(payload)
  var lastColumn = sheet.getLastColumn()
  var headers

  if (lastColumn === 0) {
    headers = incoming
    var firstHeaderRange = sheet.getRange(1, 1, 1, headers.length)
    firstHeaderRange.setValues([headers])
    firstHeaderRange.setFontWeight('bold')
    sheet.setFrozenRows(1)
    return headers
  }

  headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
  headers = reconcileLegacyHeaders(sheet, headers)

  var missing = incoming.filter(function (key) {
    return findHeaderIndex(headers, key) === -1
  })

  if (missing.length > 0) {
    var startColumn = headers.length + 1
    var missingHeaderRange = sheet.getRange(1, startColumn, 1, missing.length)
    missingHeaderRange.setValues([missing])
    missingHeaderRange.setFontWeight('bold')
    headers = headers.concat(missing)
  }

  return headers
}

/** Encuentra el índice de una cabecera, incluida su versión heredada. */
function findHeaderIndex(headers, header) {
  var directIndex = headers.indexOf(header)

  if (directIndex !== -1) return directIndex

  var aliases = HEADER_ALIASES[header] || []

  for (var i = 0; i < aliases.length; i++) {
    var aliasIndex = headers.indexOf(aliases[i])

    if (aliasIndex !== -1) return aliasIndex
  }

  return -1
}

/** Busca un ID de envío en su columna. Devuelve el número de fila o -1. */
function findRowById(sheet, headers, submissionId) {
  var idIndex = findHeaderIndex(headers, ID_COLUMN)
  var lastRow = sheet.getLastRow()

  if (idIndex === -1 || lastRow < 2) return -1

  var values = sheet.getRange(2, idIndex + 1, lastRow - 1, 1).getValues()

  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(submissionId)) {
      return i + 2
    }
  }

  return -1
}

/** Respuesta JSON con cabecera CORS abierta. */
function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
