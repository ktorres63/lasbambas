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
      return payload[header] !== undefined && payload[header] !== null
        ? payload[header]
        : ''
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
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
    return headers
  }

  headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0]

  var missing = incoming.filter(function (key) {
    return headers.indexOf(key) === -1
  })

  if (missing.length > 0) {
    var startColumn = headers.length + 1
    sheet.getRange(1, startColumn, 1, missing.length).setValues([missing])
    sheet.getRange(1, startColumn, 1, missing.length).setFontWeight('bold')
    headers = headers.concat(missing)
  }

  return headers
}

/** Busca un ID de envío en su columna. Devuelve el número de fila o -1. */
function findRowById(sheet, headers, submissionId) {
  var idIndex = headers.indexOf(ID_COLUMN)

  if (idIndex === -1 || sheet.getLastRow() < 2) return -1

  var values = sheet
    .getRange(2, idIndex + 1, sheet.getLastRow() - 1, 1)
    .getValues()

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
