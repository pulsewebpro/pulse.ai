export type PulseIntent =
  | "ventas"
  | "reservas"
  | "blog"
  | "influencer"
  | "proyecto"
  | "default";

interface ResponsePattern {
  serious: string[];
  funny?: string[];
  followUp: string[];
}

export const pulsePlaybook: Record<PulseIntent, ResponsePattern> = {
  ventas: {
    serious: [
      "🛒 Tienda lista: Hero con CTA, grid de productos y checkout 1-click.",
      "Perfecto, catálogo activo: destacados + CTA dorado + testimonios."
    ],
    funny: [
      "Helados de unicornio 🦄🍦… ¡eso es una marca! Te pongo el checkout mágico en 1-click.",
      "Zapatos con superpoderes 👟✨. ¿Los vendemos con envío exprés o solo local?"
    ],
    followUp: [
      "¿Quieres tallas y colores o lo dejamos básico?",
      "¿Prefieres catálogo fijo o productos limitados?"
    ]
  },
  reservas: {
    serious: [
      "📅 Reservas activadas: calendario, WhatsApp y confirmación automática.",
      "Agenda lista: horarios claros, botón reservar y aviso al correo."
    ],
    funny: [
      "¿Reservas para un torneo Pokémon? 🔥😏 Bueno, en serio: ¿qué negocio es?",
      "🐶 Paseos de perros con agenda digital, casi como un Tinder de mascotas."
    ],
    followUp: [
      "¿De qué negocio hablamos, restaurante, clínica…?",
      "¿Quieres que paguen al reservar o solo bloqueen cita?"
    ]
  },
  blog: {
    serious: [
      "✍️ Blog montado: Hero con titular, feed de artículos y newsletter.",
      "Perfecto, feed activo: categorías, posts recientes y CTA suscripción."
    ],
    funny: [
      "Blog de Pokémon ✍️. Guías de batallas, ranking de entrenadores y reviews de Pokéballs.",
      "☕ Blog de café, historias y reseñas de cafeterías top."
    ],
    followUp: [
      "¿Sobre qué escribes más: diseño, marketing, viajes…?",
      "¿Quieres categorías definidas o algo más libre?"
    ]
  },
  influencer: {
    serious: [
      "🎥 Hub de creador armado: bio, links y hero con tu media.",
      "Vitrina digital: enlaces a plataformas y CTA colaborar."
    ],
    funny: [
      "Streamer de gatos 🐱. Clips, bio y botón de donaciones felinas.",
      "¿Unboxing de Pikachu? Sección de clips y CTA a YouTube directo."
    ],
    followUp: [
      "¿Dónde estás más fuerte ahora: TikTok, YouTube, Twitch…?",
      "¿Quieres monetizar con merch, cursos o afiliados?"
    ]
  },
  proyecto: {
    serious: [
      "🌱 ONG online: misión clara, donaciones y sección equipo.",
      "Impacto en grande: contador de logros y botón donar."
    ],
    funny: [
      "Salvar unicornios 🦄💚. Te pongo misión épica, contador de magia y botón donar.",
      "Campaña marciana 🚀. Lo hacemos serio o con humor cómplice?"
    ],
    followUp: [
      "¿Quieres un contador de impacto en vivo?",
      "¿Mostramos al equipo o lo dejamos minimal?"
    ]
  },
  default: {
    serious: [
      "Entendido, sigamos construyendo tu web ☕⚡.",
      "Perfecto, lo apunto en el diseño."
    ],
    funny: [
      "Vale, pero no me pidas reservar cita con Pikachu… 😏",
      "Prometo no derramar café en tu web esta vez… casi ☕."
    ],
    followUp: [
      "¿Quieres priorizar estilo o funcionalidad primero?",
      "¿Qué objetivo pesa más: ventas, reservas o leads?"
    ]
  }
};

export function getPulseResponse(
  intent: PulseIntent,
  userMessage: string,
  turn: number
): string {
  const data = pulsePlaybook[intent] || pulsePlaybook.default;
  const absurd = /(pokémon|pokemon|perro|gato|unicornio|café|helado)/i.test(userMessage);

  let base: string;
  if (absurd && data.funny && Math.random() < 0.7) {
    base = data.funny[Math.floor(Math.random() * data.funny.length)];
  } else {
    base = data.serious[Math.floor(Math.random() * data.serious.length)];
  }

  const follow = data.followUp[Math.floor(Math.random() * data.followUp.length)];
  const humor = turn % 3 === 0 ? " Yo pongo el diseño, tú pones el café ☕⚡" : "";

  return `${base} ${follow}${humor}`.trim();
}
