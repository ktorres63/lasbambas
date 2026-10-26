import type { DefaultValues } from 'react-hook-form'
import type { PersonnelEntryValues } from '../schemas/personnelEntry'

export interface SelectOption {
  value: string
  label: string
}

/** Códigos ISO 3166-1 alfa-2 usados para construir el selector de nacionalidades. */
const countryCodes = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX',
  'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ',
  'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK',
  'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM',
  'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS',
  'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN',
  'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN',
  'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV',
  'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ',
  'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI',
  'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM',
  'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC',
  'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV',
  'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR',
  'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
]

const regionNames =
  typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['es'], { type: 'region' })
    : null

export const countryOptions: SelectOption[] = [
  ...countryCodes
    .map((code) => ({ value: code, label: regionNames?.of(code) ?? code }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es')),
  { value: 'otra', label: 'Otra nacionalidad (especificar)' },
]

export const pensionSystemOptions: SelectOption[] = [
  { value: 'afp', label: 'AFP' },
  { value: 'onp', label: 'ONP' },
]

export const afpCommissionOptions: SelectOption[] = [
  { value: 'flujo', label: 'Comisión por flujo' },
  { value: 'saldo', label: 'Comisión por saldo' },
]

export const maritalStatusOptions: SelectOption[] = [
  { value: 'soltero', label: 'Soltero(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'conviviente', label: 'Conviviente' },
  { value: 'viudo', label: 'Viudo(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
]

export const yesNoOptions: SelectOption[] = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
]

/**
 * Listas de tallas de referencia.
 * Reemplazar estos valores por la tabla de tallas vigente de la empresa.
 */
export const shoeSizeOptions: SelectOption[] = Array.from({ length: 14 }, (_, index) => {
  const size = String(34 + index)
  return { value: size, label: size }
})

export const shirtSizeOptions: SelectOption[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(
  (size) => ({ value: size, label: size }),
)

export const pantsSizeOptions: SelectOption[] = Array.from({ length: 10 }, (_, index) => {
  const size = String(26 + index * 2)
  return { value: size, label: size }
})

/** Entidades bancarias configurables; ajustar a los bancos habilitados por la empresa. */
export const bankOptions: SelectOption[] = [
  { value: 'bcp', label: 'Banco de Crédito del Perú (BCP)' },
  { value: 'bbva', label: 'BBVA' },
  { value: 'interbank', label: 'Interbank' },
  { value: 'scotiabank', label: 'Scotiabank' },
  { value: 'banco-nacion', label: 'Banco de la Nación' },
  { value: 'banbif', label: 'BanBif' },
  { value: 'pichincha', label: 'Banco Pichincha' },
  { value: 'banco-falabella', label: 'Banco Falabella' },
  { value: 'ripley', label: 'Banco Ripley' },
  { value: 'gnb', label: 'Banco GNB' },
]

export const englishLevelOptions: SelectOption[] = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
]

export const availabilityOptions: SelectOption[] = [
  { value: 'inmediata', label: 'Inmediata' },
  { value: 'una-semana', label: 'En una semana' },
  { value: 'dos-semanas', label: 'En dos semanas' },
  { value: 'un-mes', label: 'En un mes' },
  { value: 'otra-fecha', label: 'Otra fecha' },
]

export const emptyChild: PersonnelEntryValues['children'][number] = {
  fullName: '',
  age: undefined,
}

export const emptyEmergencyContact: PersonnelEntryValues['emergencyContacts'][number] = {
  fullName: '',
  fixedPhone: '',
  mobile: '',
}

export const personnelEntryDefaults: DefaultValues<PersonnelEntryValues> = {
  fullName: '',
  dni: '',
  birthDate: '',
  nationality: '',
  nationalityOther: '',
  address: '',
  district: '',
  province: '',
  fixedPhone: '',
  mobile: '',
  pensionSystem: '',
  afpCommission: '',
  maritalStatus: '',
  spouseName: '',
  personalEmail: '',
  telradEmail: '',
  shoeSize: '',
  shirtSize: '',
  pantsSize: '',
  hasChildren: '',
  children: [],
  emergencyContacts: [{ ...emptyEmergencyContact }],
  previousCompanies: [
    { company: '', position: '' },
    { company: '', position: '' },
  ],
  academicTitle: '',
  academicInstitution: '',
  isStudying: '',
  currentCareer: '',
  entryYear: undefined,
  additionalInstitution: '',
  bankName: '',
  bankAccount: '',
  cci: '',
  ctsBank: '',
  satisfactionMost: '',
  satisfactionLeast: '',
  satisfactionNeeds: '',
  strengths: '',
  developmentAreas: '',
  greatestAchievement: '',
  monthlySalaryExpectation: undefined,
  englishLevel: '',
  availability: '',
  availableFrom: '',
}
