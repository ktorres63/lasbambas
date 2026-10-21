/**
 * Configuración del botón flotante de WhatsApp.
 *
 * ⚠️ DATOS DE EJEMPLO (placeholder). Reemplázalos por los datos reales de la
 * empresa antes de publicar. La web original no incluye un botón de WhatsApp
 * público, por eso no hay un valor oficial en la referencia.
 */
export interface WhatsAppConfig {
  /** Activa o desactiva el botón en todo el sitio */
  enabled: boolean
  /** Número en formato internacional, sin "+", espacios ni guiones (ej. '51987654321') */
  phone: string
  /** Mensaje que se prerrellena al abrir el chat */
  message: string
  /** Texto de accesibilidad y tooltip del botón */
  label: string
}

export const whatsapp: WhatsAppConfig = {
  enabled: true,
  // TODO: reemplazar por el número real
  phone: '51 937337485 ',
  // TODO: reemplazar por el mensaje real
  message: 'Hola, me gustaría recibir más información sobre Las Bambas.',
  label: 'Escríbenos por WhatsApp',
}
