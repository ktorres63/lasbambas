import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { PersonnelEntryValues } from '../../../schemas/personnelEntry'
import {
  afpCommissionOptions,
  countryOptions,
  emptyChild,
  maritalStatusOptions,
  pantsSizeOptions,
  pensionSystemOptions,
  shirtSizeOptions,
  shoeSizeOptions,
  yesNoOptions,
} from '../../../data/personnelEntry'
import FormSection, { FormSubsection } from '../../form/FormSection'
import SelectField from '../../form/SelectField'
import TextField from '../../form/TextField'
import RadioGroupField from '../../form/RadioGroupField'
import RepeatableItem from '../../form/RepeatableItem'
import { getArrayRootError } from '../../form/fieldA11y'
import { toOptionalNumber } from '../../form/registerHelpers'
import { addButtonClass, errorClass, fieldGridClass } from '../../form/styles'

export default function PersonalDataSection() {
  const {
    register,
    watch,
    control,
    formState: { errors },
  } = useFormContext<PersonnelEntryValues>()

  const {
    fields: childFields,
    append: appendChild,
    remove: removeChild,
  } = useFieldArray({ control, name: 'children' })

  const nationality = watch('nationality')
  const pensionSystem = watch('pensionSystem')
  const maritalStatus = watch('maritalStatus')
  const hasChildren = watch('hasChildren')
  const showsSpouse = maritalStatus === 'casado' || maritalStatus === 'conviviente'
  const childrenError = getArrayRootError(errors.children)

  return (
    <FormSection
      letter="A"
      title="Datos personales"
      description="Información de identificación, contacto, previsión social y cargas familiares."
    >
      <div className="space-y-8">
        <FormSubsection title="Identificación">
          <div className={fieldGridClass}>
            <TextField
              label="Nombres completos"
              required
              autoComplete="name"
              placeholder="Nombres y apellidos"
              wrapClassName="sm:col-span-2"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <TextField
              label="DNI"
              required
              type="text"
              inputMode="numeric"
              maxLength={8}
              autoComplete="off"
              placeholder="8 dígitos"
              error={errors.dni?.message}
              {...register('dni')}
            />
            <TextField
              label="Fecha de nacimiento"
              required
              type="date"
              autoComplete="bday"
              error={errors.birthDate?.message}
              {...register('birthDate')}
            />
            <SelectField
              label="Nacionalidad"
              required
              placeholder="Selecciona tu nacionalidad"
              options={countryOptions}
              error={errors.nationality?.message}
              {...register('nationality')}
            />
            {nationality === 'otra' && (
              <TextField
                label="Especifica tu nacionalidad"
                required
                placeholder="Escribe tu nacionalidad"
                error={errors.nationalityOther?.message}
                {...register('nationalityOther')}
              />
            )}
          </div>
        </FormSubsection>

        <FormSubsection title="Contacto">
          <div className={fieldGridClass}>
            <TextField
              label="Dirección"
              required
              autoComplete="street-address"
              placeholder="Avenida, calle, número y referencia"
              wrapClassName="sm:col-span-2"
              error={errors.address?.message}
              {...register('address')}
            />
            <TextField
              label="Distrito"
              required
              autoComplete="address-level3"
              error={errors.district?.message}
              {...register('district')}
            />
            <TextField
              label="Provincia"
              required
              autoComplete="address-level2"
              error={errors.province?.message}
              {...register('province')}
            />
            <TextField
              label="Teléfono fijo"
              type="tel"
              autoComplete="tel"
              error={errors.fixedPhone?.message}
              {...register('fixedPhone')}
            />
            <TextField
              label="Celular personal"
              required
              type="tel"
              autoComplete="tel"
              error={errors.mobile?.message}
              {...register('mobile')}
            />
            <TextField
              label="Email personal"
              required
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              error={errors.personalEmail?.message}
              {...register('personalEmail')}
            />
            <TextField
              label="Email Telrad"
              type="email"
              autoComplete="off"
              error={errors.telradEmail?.message}
              {...register('telradEmail')}
            />
          </div>
        </FormSubsection>

        <FormSubsection title="Previsión social y estado civil">
          <div className={fieldGridClass}>
            <RadioGroupField
              legend="Sistema previsional"
              required
              registration={register('pensionSystem')}
              options={pensionSystemOptions}
              error={errors.pensionSystem?.message}
            />
            {pensionSystem === 'afp' && (
              <RadioGroupField
                legend="Comisión AFP"
                required
                registration={register('afpCommission')}
                options={afpCommissionOptions}
                error={errors.afpCommission?.message}
              />
            )}
            <SelectField
              label="Estado civil"
              required
              placeholder="Selecciona tu estado civil"
              options={maritalStatusOptions}
              error={errors.maritalStatus?.message}
              {...register('maritalStatus')}
            />
            {showsSpouse && (
              <TextField
                label="Nombre completo del cónyuge"
                required
                autoComplete="off"
                error={errors.spouseName?.message}
                {...register('spouseName')}
              />
            )}
          </div>
        </FormSubsection>

        <FormSubsection title="Tallas">
          <div className={fieldGridClass}>
            <SelectField
              label="Talla de zapato"
              required
              placeholder="Selecciona una talla"
              options={shoeSizeOptions}
              error={errors.shoeSize?.message}
              {...register('shoeSize')}
            />
            <SelectField
              label="Talla de camisa o blusa"
              required
              placeholder="Selecciona una talla"
              options={shirtSizeOptions}
              error={errors.shirtSize?.message}
              {...register('shirtSize')}
            />
            <SelectField
              label="Talla de pantalón"
              required
              placeholder="Selecciona una talla"
              options={pantsSizeOptions}
              error={errors.pantsSize?.message}
              {...register('pantsSize')}
            />
          </div>
        </FormSubsection>

        <FormSubsection
          title="Hijos"
          description="Puedes agregar y eliminar los registros que necesites."
        >
          <RadioGroupField
            legend="¿Tiene hijos?"
            required
            registration={register('hasChildren')}
            options={yesNoOptions}
            error={errors.hasChildren?.message}
          />

          {hasChildren === 'si' && (
            <div className="mt-5">
              <div className="space-y-4">
                {childFields.map((field, index) => (
                  <RepeatableItem
                    key={field.id}
                    title={`Hijo ${index + 1}`}
                    removeLabel={`Eliminar hijo ${index + 1}`}
                    onRemove={() => removeChild(index)}
                  >
                    <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                      <TextField
                        label="Nombres y apellidos"
                        required
                        placeholder="Nombre completo del hijo o hija"
                        error={errors.children?.[index]?.fullName?.message}
                        {...register(`children.${index}.fullName`)}
                      />
                      <TextField
                        label="Edad"
                        required
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={99}
                        error={errors.children?.[index]?.age?.message}
                        {...register(`children.${index}.age`, {
                          setValueAs: toOptionalNumber,
                        })}
                      />
                    </div>
                  </RepeatableItem>
                ))}
              </div>

              {childFields.length === 0 && (
                <p className="mt-4 text-[13px] text-[#777]">
                  Aún no has agregado ningún hijo o hija.
                </p>
              )}

              {childrenError && (
                <p className={errorClass} role="alert">
                  {childrenError}
                </p>
              )}

              <button
                type="button"
                onClick={() => appendChild({ ...emptyChild })}
                className={`${addButtonClass} mt-4`}
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Agregar hijo
              </button>
            </div>
          )}
        </FormSubsection>

        {/* <FormSubsection
          title="Contactos de emergencia"
          description="Registra al menos un contacto. Puedes agregar más de uno."
        >
          <div className="space-y-4">
            {contactFields.map((field, index) => (
              <RepeatableItem
                key={field.id}
                title={`Contacto ${index + 1}`}
                removeLabel={`Eliminar contacto ${index + 1}`}
                onRemove={() => removeContact(index)}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Nombre completo"
                    required
                    autoComplete="off"
                    error={errors.emergencyContacts?.[index]?.fullName?.message}
                    {...register(`emergencyContacts.${index}.fullName`)}
                  />
                  <TextField
                    label="Teléfono fijo"
                    type="tel"
                    autoComplete="off"
                    error={errors.emergencyContacts?.[index]?.fixedPhone?.message}
                    {...register(`emergencyContacts.${index}.fixedPhone`)}
                  />
                  <TextField
                    label="Celular"
                    required
                    type="tel"
                    autoComplete="off"
                    error={errors.emergencyContacts?.[index]?.mobile?.message}
                    {...register(`emergencyContacts.${index}.mobile`)}
                  />
                </div>
              </RepeatableItem>
            ))}
          </div>

          {contactsError && (
            <p className={`${errorClass} mt-3`} role="alert">
              {contactsError}
            </p>
          )}

          <button
            type="button"
            onClick={() => appendContact({ ...emptyEmergencyContact })}
            className={`${addButtonClass} mt-4`}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Agregar contacto
          </button>
        </FormSubsection>

        <FormSubsection
          title="Experiencia laboral reciente"
          description="Indica tus dos últimas empresas. Si una empresa no aplica, puedes dejar el bloque vacío."
        >
          <div className="space-y-4">
            <fieldset className="border border-[#e0e0e0] p-4">
              <legend className="px-2 text-[13px] font-black uppercase tracking-[1px] text-brand-ink">
                Última empresa
              </legend>
              <div className={fieldGridClass}>
                <TextField
                  label="Nombre de la empresa"
                  autoComplete="organization"
                  error={errors.previousCompanies?.[0]?.company?.message}
                  {...register('previousCompanies.0.company')}
                />
                <TextField
                  label="Cargo"
                  autoComplete="organization-title"
                  error={errors.previousCompanies?.[0]?.position?.message}
                  {...register('previousCompanies.0.position')}
                />
              </div>
            </fieldset>

            <fieldset className="border border-[#e0e0e0] p-4">
              <legend className="px-2 text-[13px] font-black uppercase tracking-[1px] text-brand-ink">
                Penúltima empresa
              </legend>
              <div className={fieldGridClass}>
                <TextField
                  label="Nombre de la empresa"
                  autoComplete="organization"
                  error={errors.previousCompanies?.[1]?.company?.message}
                  {...register('previousCompanies.1.company')}
                />
                <TextField
                  label="Cargo"
                  autoComplete="organization-title"
                  error={errors.previousCompanies?.[1]?.position?.message}
                  {...register('previousCompanies.1.position')}
                />
              </div>
            </fieldset>
          </div>
        </FormSubsection> */}
      </div>
    </FormSection>
  )
}
