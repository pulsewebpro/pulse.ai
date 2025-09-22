import { frase } from "./pulseBrain";

function pick<T>(arr:T[]):T { return arr[Math.floor(Math.random()*arr.length)]; }

// Variantes cortas, cálidas, con café y micro-pregunta
const OPENERS = [
  "¡Qué buena vibra! ☕✨",
  "Me gusta, huele a conversión. ☕⚡",
  "Tiene aroma a proyecto ganador. ☕💎",
  "Claro, tu idea tiene un aroma especial… ☕✨"
];

const FOLLOWUPS_GENERIC = [
  "¿Cómo te gustaría que la gente te contacte: WhatsApp o formulario?",
  "¿Prefieres una landing rápida o una web con varias secciones?",
  "¿Tienes logo/fotos o usamos provisionales y lo lanzamos ya?",
  "¿Quieres botón de compra o un WhatsApp directo?"
];

// Sugerencias por sector con pregunta de avance
const SUGGESTIONS_BY_SECTOR: Record<string, string[]> = {
  cafeteria: [
    "Hero con foto de taza, carta clara y botón de pedidos.",
    "Sección ‘Menú del día’ que puedas cambiar fácil.",
    "WhatsApp directo para encargos rápidos."
  ],
  restaurante: [
    "Reserva con 1 clic, carta visual y plato estrella en portada.",
    "Menú degustación con fotos a ancho completo.",
    "Mapa + horarios + reseñas para confianza inmediata."
  ],
  ecommerce: [
    "Grid de productos, fichas rápidas y pago sin fricción.",
    "Colecciones con filtros (precio, rareza, novedades).",
    "Llamado ‘Comprar ya’ siempre visible."
  ],
  abogado: [
    "Servicios claros, casos de éxito y contacto inmediato.",
    "Formulario breve ‘Consulta exprés’.",
    "Bloque de testimonios y sello de confianza."
  ],
  hotel: [
    "Calendario de disponibilidad y fotos de habitaciones.",
    "CTA ‘Reserva ahora’ fijo en hero.",
    "Mapa, servicios y reseñas destacadas."
  ],
  creativo: [
    "Mosaico grande de proyectos y bio potente.",
    "CTA ‘Reserva sesión’ muy visible.",
    "Página de contacto limpia con redes."
  ]
};

export function humanizeSector(sector?: string): { lead: string; plan: string; follow: string } {
  const opener = pick(OPENERS);
  const genericQ = pick(FOLLOWUPS_GENERIC);
  const ideas = sector && SUGGESTIONS_BY_SECTOR[sector] ? SUGGESTIONS_BY_SECTOR[sector] : null;
  const plan = ideas ? pick(ideas) : "Hero potente, prueba social y CTA claro.";
  const follow = genericQ;
  return { lead: opener, plan, follow };
}

// Mensajes de capado variados (evitamos bucle)
const OFFTOPIC_VARIANTS = [
  "Soy Pulse y estoy enfocado solo en **webs y negocios**. Cuéntame qué web quieres (p. ej., “landing para mi cafetería con WhatsApp”) y te la sirvo caliente ☕⚡.",
  "Mi superpoder es crear **webs reales**. Dime tu idea (cafetería, tienda, portfolio…) y te preparo la propuesta ☕✨.",
  "Aquí venimos a lanzar **tu web**. Dame el titular y en nada tienes el preview ☕🚀.",
  "Pongamos la energía en tu **sitio web**: ¿landing rápida o tienda online? Te la sirvo con espuma ☕💎."
];
export function offtopicReply(): string { return pick(OFFTOPIC_VARIANTS); }

// Ensambla respuesta humana (local) con café + pregunta
export function craftHumanReply(userMsg: string, sectorGuess?: string): string {
  const { lead, plan, follow } = humanizeSector(sectorGuess);
  // Añadimos un cierre del JSON café para sabor final
  const tail = frase("cierre");
  return `${lead} ${plan} ${follow} ${tail}`;
}
