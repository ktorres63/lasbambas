import {
  HeartPulse,
  Briefcase,
  HardHat,
  Truck,
  Pickaxe,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * Áreas laborales y puestos de la sección "Vacantes de Trabajo".
 *
 * Los puestos son únicamente informativos: no representan convocatorias
 * activas ni incluyen requisitos reales, salarios, ubicaciones ni fechas.
 * Estructura centralizada para facilitar su mantenimiento.
 */

/** Detalle mostrado en el modal "Ver detalles" de cada puesto */
export interface JobPositionDetails {
  /** Descripción general del puesto */
  description: string;
  /** Funciones principales */
  functions: string[];
  /** Requisitos del puesto */
  requirements: string[];
  /** Perfil profesional buscado */
  profile: string;
}

export interface JobPosition extends JobPositionDetails {
  id: string;
  name: string;
}

export interface JobArea {
  id: string;
  /** Nombre del área laboral */
  name: string;
  /** Icono representativo del área */
  icon: LucideIcon;
  /** Puestos del área (solo informativos) */
  positions: JobPosition[];
}

/**
 * ⚠️ CONTENIDO DE EJEMPLO — EDITABLE.
 * Genera textos de demostración para el detalle de cada puesto.
 * Reemplaza estos textos por la información real de cada posición
 * cuando esté disponible.
 */
function exampleDetails(positionName: string): JobPositionDetails {
  return {
    description: `Texto de ejemplo con la descripción general del puesto de ${positionName} dentro de la operación minera. Edita este contenido en src/data/jobs.ts.`,
    functions: [
      "Función de ejemplo: describir aquí una responsabilidad principal del puesto.",
      "Función de ejemplo: describir aquí una responsabilidad complementaria.",
      "Función de ejemplo: describir aquí una responsabilidad adicional.",
    ],
    requirements: [
      "Requisito de ejemplo: formación académica requerida para el puesto.",
      "Requisito de ejemplo: experiencia previa sugerida.",
      "Requisito de ejemplo: competencias o certificaciones necesarias.",
    ],
    profile: `Perfil de ejemplo para el puesto de ${positionName}: profesional orientado a resultados, con trabajo en equipo y compromiso con los estándares de seguridad.`,
  };
}

/** Genera un id estable a partir del nombre del puesto */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Crea un puesto con los datos de ejemplo por defecto.
 *
 * El segundo parámetro permite reemplazar solo los campos que quieras
 * para un puesto concreto, sin repetir el resto:
 *
 *   position("Médico Ocupacional", {
 *     description: "Descripción propia de este puesto...",
 *     requirements: ["Requisito propio 1", "Requisito propio 2"],
 *   })
 *
 * Nota: los arrays (functions, requirements) se reemplazan completos,
 * no se combinan con los de ejemplo.
 */
function position(
  name: string,
  overrides: Partial<JobPositionDetails> = {},
): JobPosition {
  return { id: slugify(name), name, ...exampleDetails(name), ...overrides };
}

export const jobAreas: JobArea[] = [
  {
    id: "salud",
    name: "Área Salud",
    icon: HeartPulse,
    positions: [
      // Ejemplo de puesto con datos propios (el resto de campos vendría del
      // contenido de ejemplo por defecto si no se especifica).
      position("Médico Ocupacional", {
        description:
          "Texto de ejemplo para el puesto de Médico Ocupacional: brinda atención médica y vigila la salud de los colaboradores en la operación minera. Edita este contenido en src/data/jobs.ts.",
        functions: [
          "Realizar evaluaciones médicas ocupacionales de ejemplo.",
          "Atender consultas y emergencias médicas en la unidad minera (ejemplo).",
          "Participar en los programas de vigilancia de la salud (ejemplo).",
        ],
        requirements: [
          "Requisito de ejemplo: título profesional de Médico Cirujano.",
          "Requisito de ejemplo: experiencia en salud ocupacional.",
          "Requisito de ejemplo: colegiatura y habilitación vigente.",
        ],
        profile:
          "Perfil de ejemplo: profesional con vocación de servicio, criterio clínico y compromiso con la prevención de riesgos.",
      }),
      position("Enfermero / Enfermera Ocupacional"),
      position("Técnico en Enfermería"),
      position("Asistente en Salud Ocupacional"),
    ],
  },
  {
    id: "administrativa",
    name: "Área Administrativa / Oficina",
    icon: Briefcase,
    positions: [
      position("Asistente Administrativo"),
      position("Administrador de Mina"),
      position("Contador - Rubro Minero"),
      position("Analista Contable Senior"),
      position("Asistente de Logística"),
      position("Ingeniero Industrial / de Operaciones"),
    ],
  },
  {
    id: "operarios",
    name: "Área Operarios / Operadores",
    icon: HardHat,
    positions: [
      position("Perforista Diamantino DDH"),
      position("Ayudante de Perforista"),
      position("Operador de Voladura"),
      position("Operador de Mina / Operario de Mina"),
      position("Operador de Equipo Pesado"),
    ],
  },
  {
    id: "conductores",
    name: "Área Conductores",
    icon: Truck,
    positions: [
      position("Conductor de Camioneta 4x4"),
      position("Conductor de Minibús / Minivan"),
      position("Conductor de Ómnibus / Bus Minero"),
      position("Conductor de Volquete"),
    ],
  },
  {
    id: "ingenieros",
    name: "Área Ingenieros",
    icon: Pickaxe,
    positions: [
      // Otro ejemplo con datos propios: solo se sobrescriben los campos indicados.
      position("Ingeniero de Minas", {
        description:
          "Texto de ejemplo para el puesto de Ingeniero de Minas: apoya la planificación y supervisión de las operaciones mineras. Edita este contenido en src/data/jobs.ts.",
        functions: [
          "Elaborar y dar seguimiento a los planes de minado (ejemplo).",
          "Supervisar la ejecución de las operaciones mineras (ejemplo).",
          "Coordinar con las áreas de geología, geomecánica y operaciones (ejemplo).",
        ],
        requirements: [
          "Requisito de ejemplo: título profesional en Ingeniería de Minas.",
          "Requisito de ejemplo: experiencia en operaciones mineras.",
          "Requisito de ejemplo: manejo de software de planificación minera.",
        ],
        profile:
          "Perfil de ejemplo: profesional analítico, orientado a la seguridad y a la mejora continua de los procesos.",
      }),
      position("Ingeniero SSOMA / SOMA"),
      position("Ingeniero Ambiental"),
      position("Ingeniero Geólogo / Geotecnia"),
      position("Ingeniero Metalurgista"),
      position("Ingeniero de Mantenimiento Mecánico"),
      position("Ingeniero Civil"),
      position("Ingeniero Eléctrico"),
    ],
  },
  {
    id: "seguridad",
    name: "Área Seguridad",
    icon: ShieldCheck,
    positions: [
      position("Vigía"),
      position("Vigía Acreditado de Equipo Pesado"),
      position("Controlador Vial / Paletero Minero"),
      position("Agente de Seguridad Patrimonial"),
      position("Supervisor de Seguridad"),
    ],
  },
];
