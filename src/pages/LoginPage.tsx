import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
} from 'lucide-react'
import { getStoredSession, loginWithCredentials } from '../services/auth'

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo electrónico.')
    .pipe(z.email('Ingresa un correo electrónico válido.')),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type LoginValues = z.infer<typeof loginSchema>

const inputClass =
  'h-12 w-full border bg-white pl-11 pr-4 text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#9a9a9a] focus:border-brand-red focus:ring-2 focus:ring-brand-red/15'

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    const existing = getStoredSession()
    if (existing) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const onSubmit = async (values: LoginValues) => {
    setAuthError(null)
    try {
      await loginWithCredentials(values.email, values.password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión. Inténtalo nuevamente.',
      )
    }
  }

  const fillDemoRecruiter = () => {
    setAuthError(null)
    setValue('email', 'rrhh@lasbambas.com', { shouldValidate: true })
    setValue('password', 'LasBambas2026!', { shouldValidate: true })
  }

  return (
    <section className="relative overflow-hidden bg-[#f4f4f4] px-[15px] pb-20 pt-[140px] lg:pt-[170px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full border-[42px] border-brand-red/5"
      />

      <div className="relative mx-auto max-w-[1100px]">
        <div className="grid overflow-hidden border border-[#dedede] bg-white shadow-[0_24px_70px_rgba(35,31,32,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative p-6 sm:p-10 lg:p-14">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-1 w-28 bg-brand-red lg:h-full lg:w-1.5"
            />

            <p className="mb-3 text-[12px] font-bold uppercase tracking-[2.5px] text-brand-red">
              Área de acceso
            </p>
            <h1 className="text-[32px] font-light leading-[38px] text-brand-ink lg:text-[42px] lg:leading-[48px]">
              Inicia <strong className="font-black">sesión</strong>
            </h1>
            <p className="mt-4 max-w-[420px] text-[15px] leading-[24px] text-[#666]">
              Ingresa tus credenciales corporativas para acceder al Dashboard de
              Recursos Humanos.
            </p>

            <form
              noValidate
              aria-busy={isSubmitting}
              onSubmit={handleSubmit(onSubmit)}
              onChange={() => {
                if (authError) setAuthError(null)
              }}
              className="mt-9 max-w-[430px] space-y-5"
            >
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-[12px] font-bold uppercase tracking-[1.5px] text-brand-ink"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#777]"
                  />
                  <input
                    {...register('email')}
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    autoFocus
                    placeholder="rrhh@lasbambas.com"
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                    className={`${inputClass} ${
                      errors.email ? 'border-brand-red' : 'border-[#cfcfcf]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p
                    id="login-email-error"
                    role="alert"
                    className="mt-2 text-[12px] leading-4 text-brand-red"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-[12px] font-bold uppercase tracking-[1.5px] text-brand-ink"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#777]"
                  />
                  <input
                    {...register('password')}
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    aria-invalid={errors.password ? true : undefined}
                    aria-describedby={
                      errors.password ? 'login-password-error' : undefined
                    }
                    className={`${inputClass} pr-12 ${
                      errors.password ? 'border-brand-red' : 'border-[#cfcfcf]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[#666] transition-colors hover:text-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye aria-hidden="true" className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="login-password-error"
                    role="alert"
                    className="mt-2 text-[12px] leading-4 text-brand-red"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {authError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 border border-[#e7b4b4] bg-[#fdf2f2] p-4 text-[13px] leading-5 text-[#8a1c15]"
                >
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0"
                  />
                  <p>{authError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 bg-brand-red px-6 text-[13px] font-bold uppercase tracking-[1.5px] text-white transition-colors duration-200 hover:bg-brand-red-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-[18px] w-[18px] animate-spin"
                  />
                ) : (
                  <LogIn aria-hidden="true" className="h-[18px] w-[18px]" />
                )}
                {isSubmitting ? 'Verificando…' : 'Iniciar sesión'}
              </button>

              <div className="border border-[#e4e4e4] bg-[#fafafa] p-3.5 text-[12px] leading-5 text-[#555]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-brand-ink">
                    <KeyRound aria-hidden="true" className="h-3.5 w-3.5 text-brand-red" />
                    Acceso Reclutador RR. HH.
                  </span>
                  <button
                    type="button"
                    onClick={fillDemoRecruiter}
                    className="text-[11px] font-bold uppercase tracking-[1px] text-brand-red underline hover:text-brand-red-dark"
                  >
                    Autocompletar
                  </button>
                </div>
                <p className="mt-1 font-mono text-[11px] text-[#666]">
                  rrhh@lasbambas.com · LasBambas2026!
                </p>
              </div>
            </form>

            <Link
              to="/"
              className="mt-7 inline-flex items-center gap-2 text-[13px] font-bold text-brand-ink transition-colors hover:text-brand-red"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>

          <aside className="relative isolate hidden min-h-[560px] flex-col justify-between overflow-hidden bg-brand-ink p-10 text-white lg:flex">
            <img
              src="/assets/home/banner-mineria.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-ink via-brand-ink/75 to-brand-ink/20"
            />

            <div className="flex items-start justify-between gap-6">
              <img
                src="/assets/img/logo-white.svg"
                alt="Las Bambas"
                className="h-10 w-auto"
              />
              <span className="text-[11px] font-bold uppercase tracking-[2px] text-white/70">
                Portal
              </span>
            </div>

            <div className="max-w-[330px]">
              <span aria-hidden="true" className="mb-6 block h-1 w-14 bg-brand-red" />
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[2.5px] text-white/70">
                Las Bambas
              </p>
              <p className="text-[34px] font-light leading-[40px]">
                Tu cuenta,
                <br />
                <strong className="font-black">en un solo lugar.</strong>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
