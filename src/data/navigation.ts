export interface SubMenuLink {
  label: string
  /** Texto que se resalta en negrita dentro de la etiqueta */
  strong?: string
  href: string
}

export interface NavSection {
  id: string
  /** Etiqueta del elemento principal, con la parte en negrita marcada */
  title: string
  titleStrong?: string
  href: string
  children: SubMenuLink[]
}

export interface TopBarLink {
  label: string
  href: string
}

/** Barra superior de accesos directos */
export const topBar: TopBarLink[] = [
  { label: 'Contáctenos', href: '/contactenos' },
  { label: 'Proveedores', href: '/proveedores' },
  { label: 'Consultas y reclamos', href: '/consultas-y-reclamos' },
  { label: 'Línea ética', href: '/linea-etica' },
  { label: 'AAA', href: '#' },
]

/** Menú principal del home (español) */
export const mainNav: NavSection[] = [
  {
    id: 'acerca',
    title: 'Acerca de',
    titleStrong: 'Las Bambas',
    href: '/acerca-de-las-bambas',
    children: [
      { label: 'Sobre', strong: 'MMG', href: '/acerca-de-las-bambas/sobre-mmg' },
      {
        label: 'Conociendo',
        strong: 'Las Bambas',
        href: '/acerca-de-las-bambas/conociendo-a-las-bambas',
      },
      {
        label: 'Hitos',
        strong: 'Históricos',
        href: '/acerca-de-las-bambas/historia',
      },
      {
        label: 'Nuestra',
        strong: 'Operación',
        href: '/acerca-de-las-bambas/nuestra-operacion',
      },
      { label: 'Reconocimientos', href: '/acerca-de-las-bambas/reconocimientos' },
    ],
  },
  {
    id: 'sostenibilidad',
    title: 'Sostenibilidad',
    href: '/sostenibilidad',
    children: [
      {
        label: 'Marco de',
        strong: 'Sostenibilidad',
        href: '/sostenibilidad/desarrollo-sostenible',
      },
      {
        label: 'Gestión',
        strong: 'Ambiental',
        href: '/sostenibilidad/gestion-ambiental',
      },
      {
        label: 'Gestión',
        strong: 'Social',
        href: '/sostenibilidad/relacionamiento-con-la-comunidad',
      },
      {
        label: 'Derechos',
        strong: 'Humanos',
        href: '/sostenibilidad/derechos-humanos',
      },
    ],
  },
  {
    id: 'innovacion',
    title: 'Innovación',
    href: '/innovacion',
    children: [
      {
        label: 'Camino a una',
        strong: 'Mina Inteligente',
        href: '/innovacion/camino-a-una-mina-inteligente',
      },
      {
        label: 'Programa de',
        strong: 'Transformación Digital en Minería',
        href: '/innovacion/programa-de-transformacion-digital-en-mineria',
      },
    ],
  },
  {
    id: 'noticias',
    title: 'Noticias y',
    titleStrong: 'Publicaciones',
    href: '/noticias-y-publicaciones',
    children: [
      {
        label: 'Notas de',
        strong: 'Prensa',
        href: '/noticias-y-publicaciones/noticias',
      },
      { label: 'Publicaciones', href: '/noticias-y-publicaciones/publicaciones' },
      { label: 'Libro', strong: 'Las Bambas', href: '/noticias-y-publicaciones/libro-las-bambas' },
      {
        label: 'Galería',
        strong: 'Multimedia',
        href: '/noticias-y-publicaciones/galeria-multimedia',
      },
    ],
  },
  {
    id: 'trabaja',
    title: 'Trabaja con',
    titleStrong: 'Nosotros',
    href: '/trabaja-con-nosotros',
    children: [
      // { label: 'DESCuBRE', href: '/trabaja-con-nosotros/descubre' },
      {
        label: 'Vacantes de',
        strong: 'Trabajo',
        href: '/trabaja-con-nosotros/vacantes-de-trabajo',
      },
    ],
  },
]
