import { Link } from 'react-router'

interface FooterColumn {
  title?: string
  titleStrong?: string
  links: { label: string; href: string; external?: boolean }[]
}

const columns: FooterColumn[] = [
  {
    title: 'Acerca de',
    titleStrong: 'Las Bambas',
    links: [
      { label: 'Sobre MMG', href: '/acerca-de-las-bambas/sobre-mmg' },
      { label: 'Conociendo a Las Bambas', href: '/acerca-de-las-bambas/conociendo-a-las-bambas' },
      { label: 'Historia', href: '/acerca-de-las-bambas/historia' },
      { label: 'Nuestra Operación', href: '/acerca-de-las-bambas/nuestra-operacion' },
      { label: 'Reconocimientos', href: '/acerca-de-las-bambas/reconocimientos' },
    ],
  },
  {
    titleStrong: 'Sostenibilidad',
    links: [
      { label: 'Marco de sostenibilidad', href: '/sostenibilidad/desarrollo-sostenible' },
      { label: 'Gestión ambiental', href: '/sostenibilidad/gestion-ambiental' },
      { label: 'Gestión social', href: '/sostenibilidad/relacionamiento-con-la-comunidad' },
      { label: 'Derechos humanos', href: '#' },
      { label: 'Consultas y reclamos', href: '/consultas-y-reclamos' },
    ],
  },
  {
    titleStrong: 'Innovación',
    links: [
      { label: 'Camino a una Mina Inteligente', href: '/innovacion/camino-a-una-mina-inteligente' },
      {
        label: 'Programa de Transformación Digital en Mineria',
        href: '/innovacion/programa-de-transformacion-digital-en-mineria',
      },
    ],
  },
  {
    title: 'Noticias y',
    titleStrong: 'Publicaciones',
    links: [
      { label: 'Noticias', href: '/noticias-y-publicaciones/noticias' },
      { label: 'Publicaciones', href: '/noticias-y-publicaciones/publicaciones' },
      { label: 'Libro Las Bambas', href: '/noticias-y-publicaciones/libro-las-bambas' },
      { label: 'Galería de videos', href: '/noticias-y-publicaciones/galeria-multimedia' },
    ],
  },
  {
    links: [
      { label: 'Contáctenos', href: '/contactenos' },
      { label: 'Trabaja con Nosotros', href: '/trabaja-con-nosotros' },
      { label: 'Proveedores', href: '/proveedores' },
      { label: 'Iniciar sesión', href: '/login' },
    ],
  },
]

const radioLogos = [
  { src: '/assets/icons/logo-radio-surphuy.svg', href: 'https://ujjina.com/cdn/surphuyradiojw.html', alt: 'Radio Surphuy' },
  { src: '/assets/icons/logo-radio-las-bambas.svg', href: 'http://www.radiolasbambas.com/', alt: 'Radio Las Bambas' },
  { src: '/assets/icons/logo-willana-wasi.svg', href: 'https://www.willanawasi.pe/', alt: 'Willana Wasi' },
]

const socialIcons = [
  { src: '/assets/icons/ico-facebook.svg', href: 'https://www.facebook.com/JuntosLaHacemos', alt: 'Facebook' },
  { src: '/assets/icons/ico-youtube.svg', href: 'https://www.youtube.com/channel/UC3cs3aMlnUIYckw3Oql60wg', alt: 'YouTube' },
  { src: '/assets/icons/ico-linkedin.svg', href: 'https://www.linkedin.com/company/mineralasbambas', alt: 'LinkedIn' },
  { src: '/assets/icons/ico-X.svg', href: 'https://twitter.com/MineraLasBambas', alt: 'X' },
  { src: '/assets/icons/ico-instagram.svg', href: 'https://www.instagram.com/minera.lasbambas/', alt: 'Instagram' },
]

function FooterLink({ link }: { link: FooterColumn['links'][number] }) {
  const content = (
    <>
      {/* Viñeta móvil */}
      <span aria-hidden="true" className="absolute left-0 top-0 text-[15px] leading-[18px] text-white lg:hidden">
        -
      </span>
      {/* Viñeta escritorio */}
      <span aria-hidden="true" className="absolute left-0 top-[6px] hidden h-1.5 w-1.5 bg-white lg:block" />
      {link.label}
    </>
  )
  return (
    <li className="relative mb-2 w-full pl-4 text-[14px] leading-[18px] text-white lg:pl-3.5">
      {link.external ? (
        <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {content}
        </a>
      ) : (
        <Link to={link.href} className="hover:underline">
          {content}
        </Link>
      )}
    </li>
  )
}

export default function Footer() {
  return (
    <footer className="bg-brand-ink text-white lg:pt-[30px]">
      <div className="mx-auto max-w-[1300px] px-[15px] py-10 lg:px-0 lg:py-5">
        <div className="flex flex-col lg:flex-row lg:gap-10">
          {/* Logo */}
          <div className="lg:w-[calc(25%-15px)]">
            <Link to="/" className="mb-10 inline-block w-[182px] lg:mb-5">
              <img src="/assets/img/logo-white.svg" alt="Las Bambas" />
            </Link>
          </div>

          {/* Columnas de menú */}
          <div className="flex flex-col lg:w-[75%] lg:flex-row lg:justify-between">
            {columns.map((col, i) => (
              <ul key={i} className="mb-[30px] w-full last:mb-0 lg:mr-4 lg:mb-[30px] lg:max-w-[120px] lg:last:mr-0">
                {col.title && (
                  <li className="mb-3.5 w-full text-[14px] leading-[18px] text-white">
                    {col.title}
                    {col.titleStrong && (
                      <>
                        {' '}
                        <strong className="font-black">{col.titleStrong}</strong>
                      </>
                    )}
                  </li>
                )}
                {col.titleStrong && !col.title && (
                  <li className="mb-3.5 w-full text-[14px] leading-[18px] text-white">
                    <strong className="font-black">{col.titleStrong}</strong>
                  </li>
                )}
                {col.links.map((link) => (
                  <FooterLink key={link.label} link={link} />
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-7 lg:mt-5 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
          {/* Radios */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            {radioLogos.map((r) => (
              <a key={r.alt} href={r.href} target="_blank" rel="noopener noreferrer">
                <img src={r.src} alt={r.alt} className="h-8 w-auto" />
              </a>
            ))}
          </div>

          {/* Redes */}
          <div className="flex flex-wrap items-center gap-4 lg:justify-end lg:pb-6 lg:pt-[30px]">
            {socialIcons.map((s) => (
              <a key={s.alt} href={s.href} target="_blank" rel="noopener noreferrer">
                <img
                  src={s.src}
                  alt={s.alt}
                  className="h-[31px] w-auto transition-transform duration-200 hover:scale-120"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="mt-8 flex flex-col gap-2 border-t border-white pb-0 pt-8 text-left text-[15px] leading-[24px] text-white lg:flex-row lg:flex-wrap lg:items-center lg:gap-0 lg:pb-[20px] lg:pt-[43px]">
          <span>© Las Bambas 2023. Todos los Derechos Reservados.</span>
          <Link to="/terminos-y-condiciones" className="w-fit hover:underline lg:px-[15px]">
            Política de Privacidad
          </Link>
          <span aria-hidden="true" className="hidden lg:inline">
            I
          </span>
          <Link to="/politica-de-cookies" className="w-fit hover:underline lg:px-[15px]">
            Política de Cookies
          </Link>
        </div>
      </div>
    </footer>
  )
}
