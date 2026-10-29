# Enviar el formulario a Google Sheets

El formulario **Ficha de ingreso** (`src/components/sections/PersonnelEntryForm.tsx`)
envía los datos a una hoja de cálculo de Google mediante un Web App de
Apps Script.

```
Formulario (React)  ──POST text/plain──▶  Web App Apps Script  ──▶  Hoja de cálculo
```

## 1. Crear la hoja de cálculo

1. Crea una hoja nueva en <https://sheets.google.com>.
2. Ponle un nombre, por ejemplo **Postulaciones**.
3. La pestaña donde se escriben las filas también se llama **Postulaciones**
   (`SHEET_NAME` en `Code.gs`). Si tu pestaña tiene otro nombre, cambia esa
   variable por el nombre real de la pestaña.

No hace falta crear las columnas: el script escribe la cabecera la primera vez
con el orden de campos del formulario.

## 2. Pegar el script

1. En la hoja: **Extensiones → Apps Script**.
2. Borra el contenido de `Código.gs` y pega el archivo
   [`Code.gs`](./google-apps-script/Code.gs).
3. Guarda (Ctrl+S).

## 3. Desplegar como aplicación web

**Implementar → Nueva implementación →** tipo **Aplicación web**:

| Ajuste | Valor |
| --- | --- |
| Descripción | `Ficha de ingreso` |
| Ejecutar como | **Yo** |
| Quién tiene acceso | **Cualquier persona** |

> "Cualquier persona" es necesario para que el navegador pueda hacer el POST sin
> iniciar sesión. El script no expone la hoja: solo acepta escrituras y no
> devuelve los datos guardados.

Copia la URL de implementación: termina en **`/exec`**.

## 4. Configurar `.env`

```bash
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfy.../exec
```

- El archivo `.env` está en `.gitignore`, no se sube al repositorio.
- Al ser una variable `VITE_*` **es pública** (queda dentro del bundle). Eso es
  inevitable en un sitio estático y aceptable aquí: la URL solo permite *añadir*
  filas. Guárdala solo como "endpoint público", nunca pongas ahí secretos.
- Reinicia `pnpm dev`: Vite solo lee `.env` al arrancar.
- En Vercel, añade la variable en **Settings → Environment Variables** y
  vuelve a desplegar.

## 5. Probar

1. Abre la URL `/exec` en el navegador: debe devolver
   `{"ok":true,"service":"Ficha de ingreso","sheet":"Postulaciones"}`.
2. Completa el formulario y pulsa **Enviar formulario**.
3. Revisa la hoja: aparece una fila nueva y la cabecera creada automáticamente.

## Detalles de implementación

- **CORS**: el cuerpo se envía con `Content-Type: text/plain`. Con
  `application/json` el navegador lanzaría un *preflight* `OPTIONS` que Apps
  Script no responde, y el envío fallaría. Con texto plano la petición es
  "simple" y no requiere preflight.
- **Duplicados**: cada envío lleva un `ID de envío` (UUID). Si el navegador no
  puede leer la respuesta y reintenta, el script detecta el ID y no duplica la
  fila.
- **Concurrencia**: `LockService` serializa las escrituras para que dos envíos
  simultáneos no sobrescriban filas.
- **Opciones**: los códigos internos (`afp`, `bcp`, `si`…) se guardan con su
  etiqueta legible (`AFP`, `Banco de Crédito del Perú (BCP)`, `Sí`).
- **Listas**: hijos, contactos de emergencia y empresas anteriores se guardan en
  una sola celda separada por ` | `.

## Limitaciones conocidas

- No hay validación en el servidor: el script solo comprueba que el cuerpo sea
  JSON. Un cliente malicioso podría escribir filas arbitrarias en la hoja.
- No hay límite de envíos (rate limiting) ni captcha. Si aparece spam, añade un
  campo trampa o limita por `ID de envío` repetido.
- Si editas `Code.gs`, hay que **volver a implementar** para publicar los
  cambios. La URL `/exec` se mantiene si editas la implementación existente.
