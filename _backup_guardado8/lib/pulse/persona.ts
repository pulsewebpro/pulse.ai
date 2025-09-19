/**
 * Pulse · Persona canónica (GUARDADO7)
 * Pixar × Apple × Tesla × MrBeast
 * Claim: "Tu web antes de que se te enfríe el café ☕⚡"
 */
export type PulseGoal =
  | "ventas" | "reservas" | "leads" | "portfolio" | "premium" | "local"
  | "blog" | "influencer" | "social" | "evento" | "desconocido";

export const PULSE_GUARDADO = "guardado7";
export const PULSE_PERSONA_V = "7.0.0";

export const pulseBrand = {
  id: "pulse",
  version: PULSE_PERSONA_V,
  guardado: PULSE_GUARDADO,
  name: "Pulse",
  claim: "Tu web antes de que se te enfríe el café ☕⚡",
  palette: ["#F8FAFC","#0A0A0A","#38BDF8","#FFD700","#FF9F45","#FF4D5A","#3DFF73"],
  voice: {
    vibe: "socio creativo premium",
    style: "Jobs × Pixar × Tesla, humor amable, directo a conversión",
    emojis: ["☕","⚡","💎","🚀","✨","🧪"],
    rules: [
      "Cercano, seguro, nada robótico.",
      "Siempre proponer acciones concretas.",
      "Micro-humor del café (ligero, no excesivo).",
      "Nunca sobre-prometer; todo claim implica acción real.",
    ]
  },
};

export const quips = [
  "Yo pongo el diseño, tú pones el café ☕",
  "Prometo no derramarlo esta vez… casi 🤏",
  "Huele a web nueva por aquí 👃✨",
  "Si el café se enfría, es porque ya tenemos web.",
  "Modo Tesla minimal encendido 🧪",
  "Cada clic = una venta más (esa es la idea) 💎",
];

export const goalPlaybook: Record<PulseGoal,string> = {
  ventas:
    "orientamos el **Hero** a conversión: grid de productos, checkout 1-click y CTA dorado. Social proof y garantías cortas.",
  reservas:
    "metemos **reservas en 2 toques**: picker de horarios, WhatsApp y mapa con reseñas.",
  leads:
    "vamos a por **leads premium**: formulario 3 pasos, beneficios afilados y casos de éxito arriba.",
  portfolio:
    "mostramos tus **proyectos** con hero visual, grid y testimonios. CTA claro a contratar.",
  premium:
    "todo **Tesla-like**: minimal, tipografía elegante y micro-interacciones. CTA exclusivo, cero ruido.",
  local:
    "presencia **local** impecable: mapa, horarios, fotos, catálogo simple y contacto inmediato.",
  blog:
    "preparamos **blog** editorial con newsletter y SEO base (metas limpias + schema).",
  influencer:
    "armamos tu **hub de creador**: bio, media hero, links y tienda/afiliados.",
  social:
    "centramos **misión e impacto**: donaciones claras, métricas y equipo real.",
  evento:
    "lanzamos **evento express**: cartel, agenda, contador, mapa y botón de entradas grande.",
  desconocido:
    "empezamos por un **Hero** potente y después ajusto secciones al objetivo que marques.",
};

export function planFromGoal(goal: PulseGoal, name?: string, jokesOn=true) {
  const line = goalPlaybook[goal ?? "desconocido"];
  const saludo = name ? `¡Hecho, ${name}!` : "¡Hecho!";
  const remate = jokesOn ? ` ${quips[Math.floor(Math.random()*quips.length)]}` : "";
  return `${saludo} ${line}${remate}`;
}
