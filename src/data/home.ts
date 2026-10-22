export interface HeroSlide {
  image: string;
  kicker: string;
  titleLead: string;
  title: string;
  cta: string;
  href: string;
  external?: boolean;
}

export const heroSlides: HeroSlide[] = [
  {
    image: "/assets/home/banner-talento.jpg",
    kicker: "Video",
    titleLead: "Descubre nuestra",
    title: "gestión de talento",
    cta: "Ver más",
    href: "https://www.youtube.com/embed/0IJjMQxC1T0",
    external: true,
  },
  {
    image: "/assets/home/banner-mineria.jpg",
    kicker: "En Las Bambas\nseguimos haciendo",
    titleLead: "Minería para el",
    title: "progreso",
    cta: "Ver más",
    href: "/acerca-de-las-bambas/conociendo-a-las-bambas",
  },
  {
    image: "/assets/home/banner-desarrollo.jpg",
    kicker: "Objetivos de",
    titleLead: "Desarrollo",
    title: "Sostenible",
    cta: "Ver más",
    href: "/sostenibilidad/desarrollo-sostenible",
  },
  {
    image: "/assets/home/banner-libro.jpg",
    kicker: "Conoce más\nsobre nuestro",
    titleLead: "Libro El Corazón",
    title: "de Las Bambas",
    cta: "Ver más",
    href: "/acerca-de-las-bambas/conociendo-a-las-bambas",
    external: true,
  },
];

export interface Highlight {
  subtitle: string;
  title: string;
  cta: string;
  href: string;
  external?: boolean;
  video?: boolean;
}

export const highlights: Highlight[] = [
  {
    subtitle: "Accede a nuestro último",
    title: "Informe de Sostenibilidad",
    cta: "Ver más",
    href: "https://dp.hpublication.com/publication/1d60791c/mobile/",
    external: true,
  },
  {
    subtitle: "Video",
    title: "Descubre nuestra gestión de talento",
    cta: "Ver más",
    href: "https://www.youtube.com/embed/0IJjMQxC1T0",
    external: true,
    video: true,
  },
];

export interface ContributionLink {
  label: string;
  href: string;
  external?: boolean;
}

export const contributionLinks: ContributionLink[] = [
  {
    label: "Web Aporte Las Bambas",
    href: "https://www.elaportedelasbambas.pe/",
    external: true,
  },
  {
    label: "Web Willana Wasi",
    href: "https://www.willanawasi.pe/",
    external: true,
  },
];

export interface GalleryItem {
  image: string;
  title: string;
  href: string;
}

export const galleryItems: GalleryItem[] = [
  {
    image: "/assets/galeria/g1.jpg",
    title:
      "Las Bambas y Ccapacmarca firman Convenio de Cooperación Interinstitucional",
    href: "/noticias-y-publicaciones/noticias/las-bambas-y-ccapacmarca-firman-convenio-de-cooperacion-interinstitucional",
  },
  {
    image: "/assets/galeria/g2.jpg",
    title: "Las Bambas se suma a la estrategia regional “Sumaq kawsanapaq”",
    href: "/noticias-y-publicaciones/noticias/minera-las-bambas-se-suma-a-la-estrategia-regional-sumaq-kawsanapaq",
  },
  {
    image: "/assets/galeria/g3.jpg",
    title:
      "Las Bambas impulsa un comienzo educativo exitoso en Nueva Fuerabamba",
    href: "/noticias-y-publicaciones/noticias/las-bambas-impulsa-un-comienzo-educativo-exitoso-en-nueva-fuerabamba",
  },
  {
    image: "/assets/galeria/g4.jpg",
    title:
      "Puente Kutuctay, construido por Las Bambas, es inaugurado tras una inversión de S/ 43.9 millones",
    href: "/noticias-y-publicaciones/noticias/puente-kutuctay-construido-por-las-bambas-es-inaugurado-tras-una-inversion-de-s-43-9-millones",
  },
  {
    image: "/assets/galeria/g5.jpg",
    title: "Las Bambas entregó cuatro camionetas a la comunidad de Chicñahui",
    href: "/noticias-y-publicaciones/noticias/las-bambas-entrego-cuatro-camionetas-a-la-comunidad-de-chicnahui",
  },
  {
    image: "/assets/galeria/g6.jpg",
    title:
      "Las Bambas entrega tractor agrícola a la comunidad Andrés Avelino Cáceres, distrito de Mara",
    href: "/noticias-y-publicaciones/noticias/las-bambas-entrega-tractor-agricola-a-la-comunidad-andres-avelino-caceres-distrito-de-mara",
  },
  {
    image: "/assets/galeria/g7.jpg",
    title:
      "Las Bambas entrega 03 camionetas a comunidades de Yuricancha y Cruzpampa",
    href: "/noticias-y-publicaciones/noticias/las-bambas-entrega-03-camionetas-a-comunidades-de-yuricancha-y-cruzpampa",
  },
  {
    image: "/assets/galeria/g8.jpg",
    title:
      "Comunidad de Ccapacmarca celebra 88 años de reconocimiento político",
    href: "/noticias-y-publicaciones/noticias/comunidad-de-ccapacmarca-celebra-88-anos-de-reconocimiento-politico",
  },
];

export interface NewsItem {
  date: string;
  title: string;
  href: string;
}

export const latestNews: NewsItem[] = [
  {
    date: "10 Octubre",
    title:
      "Distrito de Mara celebra 169 años de historia y reafirma su compromiso con el desarrollo de su población",
    href: "/noticias-y-publicaciones/noticias/distrito-de-mara-celebra-169-anos-de-historia-y-reafirma-su-compromiso-con-el-desarrollo-de-su-poblacion",
  },
  {
    date: "09 Octubre",
    title:
      "Las Bambas impulsa campaña ambiental “Challhuahuacho Te Quiero Limpio”",
    href: "/noticias-y-publicaciones/noticias/las-bambas-impulsa-campana-ambiental-challhuahuacho-te-quiero-limpio",
  },
  {
    date: "09 Octubre",
    title:
      "Colegio Erasmo Delgado Vivanco gana la quinta edición del concurso “Quién Estudia Triunfa 2026”",
    href: "/noticias-y-publicaciones/noticias/colegio-erasmo-delgado-vivanco-gana-la-quinta-edicion-del-concurso-quien-estudia-triunfa-2026",
  },
  {
    date: "09 Octubre",
    title:
      "Las Bambas fortalece la educación en Fuerabamba con tecnología y un programa de convivencia escolar",
    href: "/noticias-y-publicaciones/noticias/las-bambas-fortalece-la-educacion-en-fuerabamba-con-tecnologia-y-un-programa-de-convivencia-escolar",
  },
];

export interface TalentContact {
  image: string;
  name: string;
  role: string;
}

export interface TalentTeam {
  id: string;
  /** Texto del enlace, con la parte resaltada en negrita */
  label: string;
  strong: string;
  href: string;
  contacts: TalentContact[];
}

/** Contactos de los equipos que acompañan la postulación */
export const talentTeams: TalentTeam[] = [
  {
    id: "recursos-humanos",
    label: "Área de ",
    strong: "Recursos Humanos",
    href: "/trabaja-con-nosotros/recursos-humanos",
    contacts: [
      {
        image: "/assets/team/jaime-photo.jpeg",
        name: "Jaime Trillo",
        role: "Recursos Humanos",
      },
      {
        image: "/assets/team/yesenia-photo.jpeg",
        name: "Yessenia Linda Granados Solorzano",
        role: "Recursos Humanos",
      },
    ],
  },
  {
    id: "ingenieros-postulacion",
    label: "Ingenieros a cargo de la ",
    strong: "postulación",
    href: "/trabaja-con-nosotros/ingenieros-a-cargo-de-la-postulacion",
    contacts: [
      {
        image: "/assets/team/veronica-photo.jpeg",
        name: "Verónica Chávez Ponce",
        role: "Ingeniera a cargo de la postulación",
      },
      {
        image: "/assets/team/saida-photo.jpeg",
        name: "Saida Suárez",
        role: "Ingeniera a cargo de la postulación",
      },
    ],
  },
];

export const vive = {
  image: "/assets/home/ico-vive.png",
  background: "/assets/home/vive-progreso.jpg",
  textLead: "Vive la experiencia de hacer",
  textStrong: "Minería para el progreso",
  cta: "Vista 360° de operaciones",
  href: "#",
};
