import { z } from 'zod'

/** Año máximo admitido para el inicio de estudios. */
export const currentYear = new Date().getFullYear()

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** Devuelve la fecha local en formato ISO (YYYY-MM-DD). */
function todayISO(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Comprueba que el texto sea una fecha ISO real, sin desbordes de mes o día. */
function isValidISODate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

const isValidPhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, '')
  return /^[0-9+()\s.-]+$/.test(value) && digits.length >= 6 && digits.length <= 15
}

const requiredText = (message: string) => z.string().trim().min(1, message)

const requiredPhone = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(isValidPhone, 'Ingresa un teléfono válido (de 6 a 15 dígitos).')

const optionalPhone = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || isValidPhone(value),
    'Ingresa un teléfono válido (de 6 a 15 dígitos).',
  )

const requiredEmail = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .pipe(z.email('Ingresa un correo electrónico válido.'))

const optionalEmail = z
  .string()
  .trim()
  .pipe(z.union([z.literal(''), z.email('Ingresa un correo electrónico válido.')]))

const birthDate = z
  .string()
  .trim()
  .min(1, 'La fecha de nacimiento es obligatoria.')
  .refine(isValidISODate, 'Ingresa una fecha de nacimiento válida.')
  .refine(
    (value) => value >= '1900-01-01',
    'La fecha de nacimiento no puede ser anterior a 1900.',
  )
  .refine(
    (value) => value <= todayISO(),
    'La fecha de nacimiento no puede ser futura.',
  )

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || isValidISODate(value),
    'Ingresa una fecha válida.',
  )

/** Edad de un hijo. La obligatoriedad se valida solo cuando la persona declara hijos. */
const childAge = z
  .number({ error: 'La edad debe ser un número.' })
  .int('La edad debe ser un número entero.')
  .min(0, 'La edad no puede ser negativa.')
  .max(99, 'La edad no puede superar los 99 años.')
  .optional()

const childSchema = z.object({
  fullName: z.string().trim(),
  age: childAge,
})

const emergencyContactSchema = z.object({
  fullName: requiredText('El nombre completo es obligatorio.'),
  fixedPhone: optionalPhone,
  mobile: requiredPhone('El celular del contacto es obligatorio.'),
})

const previousCompanySchema = z.object({
  company: z.string().trim(),
  position: z.string().trim(),
})

/**
 * Esquema único de la ficha de ingreso.
 *
 * La obligatoriedad condicional y las comprobaciones que afectan a varios campos
 * se resuelven aquí para no duplicar reglas en los componentes visuales.
 */
export const personnelEntrySchema = z
  .object({
    // A. Datos personales
    fullName: requiredText('Los nombres completos son obligatorios.'),
    dni: z
      .string()
      .trim()
      .regex(/^\d{8}$/, 'El DNI debe contener exactamente 8 dígitos.'),
    birthDate,
    nationality: requiredText('Selecciona la nacionalidad.'),
    nationalityOther: z.string().trim(),
    address: requiredText('La dirección es obligatoria.'),
    district: requiredText('El distrito es obligatorio.'),
    province: requiredText('La provincia es obligatoria.'),
    fixedPhone: optionalPhone,
    mobile: requiredPhone('El celular personal es obligatorio.'),
    pensionSystem: requiredText('Selecciona el sistema previsional.'),
    afpCommission: z.string().trim(),
    maritalStatus: requiredText('Selecciona el estado civil.'),
    spouseName: z.string().trim(),
    personalEmail: requiredEmail('El correo personal es obligatorio.'),
    telradEmail: optionalEmail,
    shoeSize: requiredText('Selecciona la talla de zapato.'),
    shirtSize: requiredText('Selecciona la talla de camisa o blusa.'),
    pantsSize: requiredText('Selecciona la talla de pantalón.'),
    hasChildren: requiredText('Indica si tienes hijos.'),
    children: z.array(childSchema),
    emergencyContacts: z
      .array(emergencyContactSchema)
      .min(1, 'Agrega al menos un contacto de emergencia.'),
    previousCompanies: z.array(previousCompanySchema).length(2),

    // B. Antecedentes académicos y profesionales
    academicTitle: z.string().trim(),
    academicInstitution: z.string().trim(),
    isStudying: z.string().trim(),
    currentCareer: z.string().trim(),
    entryYear: z
      .number({ error: 'El año de ingreso debe ser un número.' })
      .int('El año de ingreso debe ser un número entero.')
      .min(1950, 'El año de ingreso no puede ser anterior a 1950.')
      .max(currentYear, `El año de ingreso no puede ser posterior a ${currentYear}.`)
      .optional(),
    additionalInstitution: z.string().trim(),

    bankName: requiredText('Selecciona el banco de la cuenta actual.'),
    bankAccount: z
      .string()
      .trim()
      .regex(/^\d{6,20}$/, 'Ingresa un número de cuenta válido (de 6 a 20 dígitos).'),
    cci: z
      .string()
      .trim()
      .regex(/^\d{20}$/, 'El CCI debe contener exactamente 20 dígitos.'),
    ctsBank: requiredText('Selecciona el banco para la cuenta CTS.'),

    // C. Satisfacción laboral
    satisfactionMost: z.string().trim(),
    satisfactionLeast: z.string().trim(),
    satisfactionNeeds: z.string().trim(),

    // D. Autocalificación
    strengths: z.string().trim(),
    developmentAreas: z.string().trim(),

    // E. Logros
    greatestAchievement: z.string().trim(),

    // F. Expectativa salarial
    monthlySalaryExpectation: z
      .number({ error: 'La expectativa salarial debe ser un número.' })
      .positive('La expectativa salarial debe ser mayor que cero.')
      .max(1_000_000, 'La expectativa salarial no puede superar S/ 1 000 000.')
      .optional(),

    // G. Nivel de inglés
    englishLevel: z.string().trim(),

    // H. Disponibilidad
    availability: z.string().trim(),
    availableFrom: optionalDate,
  })
  .superRefine((data, ctx) => {
    if (data.nationality === 'otra' && data.nationalityOther === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['nationalityOther'],
        message: 'Especifica tu nacionalidad.',
      })
    }

    if (data.pensionSystem === 'afp' && data.afpCommission === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['afpCommission'],
        message: 'Selecciona el tipo de comisión AFP.',
      })
    }

    if (
      (data.maritalStatus === 'casado' || data.maritalStatus === 'conviviente') &&
      data.spouseName === ''
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['spouseName'],
        message: 'Ingresa el nombre completo del cónyuge.',
      })
    }

    if (data.hasChildren === 'si') {
      if (data.children.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['children'],
          message: 'Agrega al menos un hijo o hija.',
        })
      }

      data.children.forEach((child, index) => {
        if (child.fullName === '') {
          ctx.addIssue({
            code: 'custom',
            path: ['children', index, 'fullName'],
            message: 'Los nombres y apellidos son obligatorios.',
          })
        }

        if (child.age === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: ['children', index, 'age'],
            message: 'La edad es obligatoria.',
          })
        }
      })
    }

    if (data.isStudying === 'si' && data.currentCareer === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['currentCareer'],
        message: 'Indica la carrera que estás cursando.',
      })
    }

    data.previousCompanies.forEach((company, index) => {
      const hasSomeData = company.company !== '' || company.position !== ''

      if (hasSomeData && company.company === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['previousCompanies', index, 'company'],
          message: 'Ingresa el nombre de la empresa.',
        })
      }

      if (hasSomeData && company.position === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['previousCompanies', index, 'position'],
          message: 'Ingresa el cargo desempeñado.',
        })
      }
    })

    if (data.availability === 'otra-fecha') {
      if (data.availableFrom === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['availableFrom'],
          message: 'Selecciona la fecha de disponibilidad.',
        })
      } else if (data.availableFrom < todayISO()) {
        ctx.addIssue({
          code: 'custom',
          path: ['availableFrom'],
          message: 'La fecha de disponibilidad no puede ser pasada.',
        })
      }
    }
  })

export type PersonnelEntryValues = z.infer<typeof personnelEntrySchema>
