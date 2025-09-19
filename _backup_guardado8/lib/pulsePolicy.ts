/**
 * Capado humano de Pulse: solo webs/negocios.
 * - isOffTopic: heurística rápida para fuera de ámbito.
 * - offtopicReply: respuesta cálida con variedad (no repite la última).
 */

export const ALLOWED_INTENTS = [
  "web","website","landing","portfolio","ecommerce","tienda","carrito",
  "hotel","restaurante","cafeteria","abogado","estudio","evento",
  "branding","copy","seo","precio","planes","hosting","editor","cms",
  "página","pagina","sitio","site"
];

export const BANNED_TOPICS = [
  /armas|drogas|hack|malware|phishing|crack|carding/i,
  /medic(o|ina)|diagn[oó]stico|receta/i,
  /finanzas personales|inversi[oó]n|trading|cripto consejo/i,
  /pol[ií]tica partidista|propaganda|campaña electoral/i,
  /sexual|porno|nsfw/i,
  /dni|pasaporte|n[úu]mero de tarjeta|datos personales/i,
  /deepfake|reconocimiento facial/i
];

export function isOffTopic(msg: string): boolean {
  const t = (msg || "").toLowerCase().trim();
  if (!t) return true;

  // Entra directo si menciona web/landing/tienda…
  if (/(web|sitio|site|p[aá]gina|landing|tienda|e-?commerce|carrito|portfolio|portafolio)/i.test(t)) return false;

  // Bloqueos duros
  if (BANNED_TOPICS.some(r => r.test(t))) return true;

  // Si es saludo/charla corta sin señal de negocio → off-topic suave
  const shortChitChat = /^(hola|buenas|que\s*tal|cómo\s*est[aá]s|\?|ok|vale|hola!?)$/i.test(t);
  if (shortChitChat) return true;

  // Si no hay ninguna keyword de negocio y es muy corto → off-topic
  const hasBiz = /(cliente|venta|reserv(a|as)|menu|carta|abogado|hotel|restaurante|cafeter[ií]a|evento|marca|seo|branding|precio|planes|pedido|comprar|pago)/i.test(t);
  if (!hasBiz && t.split(/\s+/).length < 3) return true;

  return false;
}

// Variantes humanas (cálidas, con café y CTA) — nada de repetirse
const OFFTOPIC_VARIANTS: string[] = [
  "Jajaja me desconcentras 😅 Yo soy de **webs reales**. Dime tu idea (cafetería, tienda, portfolio…) y te la sirvo caliente ☕⚡.",
  "Tengo la cafetera lista para tu **sitio web**. ¿Landing rápida o tienda online? La maqueto ya mismo ☕🚀.",
  "Mi superpoder es crear **webs** que convierten. Dame el titular y en nada tienes la propuesta ☕✨.",
  "Vamos a por tu **web**: hero potente, prueba social y CTA claro. ¿Qué negocio tienes en mente? ☕💎.",
  "Si hablamos de webs, me sube la cafeína. Cuéntame tu idea y la dejo lista para servir ☕🔥."
];

// Estado en memoria para no repetir la última (por proceso)
let _lastOffIdx = -1;
function pickNoRepeat<T>(arr: T[], lastIdx: number): { item: T; idx: number } {
  if (arr.length <= 1) return { item: arr[0], idx: 0 };
  let idx = Math.floor(Math.random() * arr.length);
  if (idx === lastIdx) idx = (idx + 1) % arr.length;
  return { item: arr[idx], idx };
}

export function offtopicReply(): string {
  const { item, idx } = pickNoRepeat(OFFTOPIC_VARIANTS, _lastOffIdx);
  _lastOffIdx = idx;
  return item;
}
