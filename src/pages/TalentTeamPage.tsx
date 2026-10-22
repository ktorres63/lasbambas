import { Link, Navigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { talentTeams } from '../data/home'

interface TalentTeamPageProps {
  teamId: string
}

/** Página de contacto de un equipo que acompaña la postulación */
export default function TalentTeamPage({ teamId }: TalentTeamPageProps) {
  const team = talentTeams.find((item) => item.id === teamId)

  if (!team) return <Navigate to="/" replace />

  return (
    <section className="bg-[#f4f4f4] px-[15px] pb-20 pt-[140px] lg:pt-[170px]">
      <div className="mx-auto max-w-325">

        <div className="mt-4 max-w-[760px]">
          <p className="mb-2 text-[14px] uppercase tracking-[2px] text-brand-red">
            Trabaja con nosotros
          </p>
          <h1 className="text-[32px] font-light leading-[38px] text-brand-ink lg:text-[40px] lg:leading-[46px]">
            {team.label}
            <strong className="font-black">{team.strong}</strong>
          </h1>
          <p className="mt-4 text-[15px] leading-[24px] text-[#555]">
            Conoce a las personas de nuestro equipo que acompañan el proceso de postulación.
          </p>
        </div>

        <ul className="mt-10 grid max-w-[820px] gap-6 sm:grid-cols-2">
          {team.contacts.map((contact) => (
            <li
              key={contact.name}
              className="overflow-hidden border-2 border-[#e3e3e3] bg-white transition-colors duration-200 hover:border-brand-red/60"
            >
              <img
                src={contact.image}
                alt={contact.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-[20px] font-black leading-[26px] text-brand-ink">
                  {contact.name}
                </h2>
                <p className="mt-1 text-[13px] leading-[20px] text-brand-red">{contact.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          to="/trabaja-con-nosotros/vacantes-de-trabajo"
          className="mt-10 inline-flex items-center gap-3 bg-brand-red px-5 py-3 text-[12px] font-bold uppercase tracking-[1px] text-white transition-colors duration-200 hover:bg-brand-red-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
        >
          Ver vacantes disponibles
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
