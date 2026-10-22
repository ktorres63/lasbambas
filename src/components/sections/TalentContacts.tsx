import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { talentTeams } from '../../data/home'

export default function TalentContacts() {
  return (
    <section className="w-full border-t border-brand-red bg-white">
      <div className="mx-auto max-w-[1300px] px-[15px] pb-[70px] pt-[58px] lg:px-0">
        <div className="mb-10 max-w-[560px]">
          <p className="mb-[5px] text-[20px] leading-[36px] text-brand-red">Trabaja con nosotros</p>
          <h2 className="text-[34px] font-black leading-[40px] text-brand-red">
            Conoce nuestros talentos
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {talentTeams.map((team) => (
            <Link
              key={team.id}
              to={team.href}
              className="group flex flex-col justify-between border-2 border-brand-grey bg-[#fafafa] p-6 transition-colors duration-200 hover:border-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red sm:p-8"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[22px] leading-[28px] text-brand-ink">
                    {team.label}
                    <strong className="font-black">{team.strong}</strong>
                  </h3>
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0 text-brand-red transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </div>

                <ul className="mt-7 grid grid-cols-2 gap-4">
                  {team.contacts.map((contact) => (
                    <li key={contact.name}>
                      <img
                        src={contact.image}
                        alt={contact.name}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <p className="mt-3 text-[15px] font-black leading-[20px] text-brand-ink">
                        {contact.name}
                      </p>
                      <p className="mt-1 text-[12px] leading-[18px] text-brand-red">
                        {contact.role}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <span className="mt-7 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[1px] text-brand-red group-hover:underline">
                Ver vacantes
                <span aria-hidden="true">&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
