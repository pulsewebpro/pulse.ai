// lib/dj/language.ts
export type PlanKey = "ventas" | "reservas" | "blog" | "creador" | "social";
export type BrainMem = {
  plan?: PlanKey[];
  platform?: "tiktok" | "youtube" | "twitch" | "instagram";
  alias?: string;
  payment?: "web" | "whatsapp";
  products?: Array<{ name: string; price?: string }>;
  cause?: string;
  city?: string;
  tone?: "humorous" | "formal" | "neutral";
  sector?: string;
  objective?: string;
  [k: string]: any;
};

const NUM_MAP: Record<string, PlanKey> = {
  "1": "ventas", "2": "reservas", "3": "blog", "4": "creador", "5": "social",
};
const WORD_MAP: Record<PlanKey, RegExp> = {
  ventas:   /\b(venta|ventas|tienda|e-?commerce|producto|checkout|carrito)\b/i,
  reservas: /\b(reserva|reservas|cita|citas|agenda|booking|mesa|turno)\b/i,
  blog:     /\b(blog|art[íi]culo|art[íi]culos|contenido|noticias|seo)\b/i,
  creador:  /\b(creador|influencer|link[- ]?in[- ]?bio|links?|bio|tiktok|youtube|twitch)\b/i,
  social:   /\b(ong|social|donaci[oó]n|donar|voluntariado|colabora|impacto)\b/i,
};

const uniq = <T,>(a: T[]) => Array.from(new Set(a));
function addPillarsFromText(plan: PlanKey[], text: string) {
  const out = [...plan];
  (text.match(/\b[1-5]\b/g) || []).forEach((n) => out.push(NUM_MAP[n]));
  (Object.keys(WORD_MAP) as PlanKey[]).forEach((k) => {
    if (WORD_MAP[k].test(text)) out.push(k);
  });
  return uniq(out);
}

export function absorbFacts(text: string, mem: BrainMem): BrainMem {
  const t = text.toLowerCase();
  const m: BrainMem = { ...(mem || {}) };
  m.plan = addPillarsFromText(m.plan || [], text);

  if (/\btik ?tok\b/.test(t)) m.platform = "tiktok";
  else if (/\byoutube\b/.test(t)) m.platform = "youtube";
  else if (/\btwitch\b/.test(t)) m.platform = "twitch";
  else if (/\b(ig|instagram)\b/.test(t)) m.platform = "instagram";

  const alias = text.match(/\b(me llamo|mi nombre es|soy)\s+([@\w.\-]{2,})/i)?.[2] || "";
  if (alias) m.alias = alias.replace(/^@/, "");

  if (/\bpago en la web\b/i.test(text)) m.payment = "web";
  if (/\b(whatsapp|dm|mensaje directo)\b/i.test(text)) m.payment = "whatsapp";

  const cause = text.match(/\b(causa|proyecto|ong)\b.*?:?\s*([a-záéíóúñ\s]{3,})/i)?.[2] || "";
  if (cause) m.cause = cause.trim();

  const prods: Array<{ name: string; price?: string }> = [];
  (text.match(/([a-z0-9 .\-]{2,})\s+(\d+[.,]?\d*)\s?(€|eur|euros)/gi) || []).forEach((line) => {
    const mm = line.match(/^(.*?)[\s\-:]+(\d+[.,]?\d*)\s?(€|eur|euros)$/i);
    if (mm) prods.push({ name: mm[1].trim(), price: mm[2].replace(",", ".") + "€" });
  });
  if (prods.length) m.products = uniq([...(m.products || []), ...prods]);

  return m;
}

function chooseDominant(plan: PlanKey[] = []): PlanKey {
  const order: PlanKey[] = ["ventas", "reservas", "blog", "creador", "social"];
  for (const k of order) if (plan.includes(k)) return k;
  return plan[0] || "creador";
}
export function sectorFrom(plan: PlanKey[] = []): string {
  const d = chooseDominant(plan);
  if (d === "ventas") return "tienda online";
  if (d === "reservas") return "restaurante";
  if (d === "blog") return "blog";
  if (d === "creador") return "creador";
  if (d === "social") return "ONG";
  return "creador";
}
export function objectiveFrom(plan: PlanKey[] = []): string {
  const d = chooseDominant(plan);
  if (d === "ventas") return "ventas";
  if (d === "reservas") return "reservas";
  if (d === "blog") return "contenido";
  if (d === "creador") return "seguidores";
  if (d === "social") return "colaborar";
  return "ventas";
}

export function humanizeReply(current: string, lastUser: string, mem: BrainMem): string {
  const plan = mem.plan || [];
  const tone = mem.tone || "neutral";

  const warm = (() => {
    if (/^soy\b/i.test(lastUser)) return "¡Bien! Eso nos da una base potente.";
    if (/ventas?/.test(lastUser)) return "Perfecto, conectamos ventas con tu perfil.";
    if (/reserva/.test(lastUser)) return "Genial, activamos reservas sin fricción.";
    if (/blog|contenido/.test(lastUser)) return "Me gusta: blog para SEO y fidelización.";
    if (/ong|social|donaci/.test(lastUser)) return "Me encanta: propósito y transparencia.";
    return "Ok, voy sumando a la idea.";
  })();

  const bloques: string[] = [];
  if (plan.includes("creador")) bloques.push("link-in-bio con CTA");
  if (plan.includes("ventas")) bloques.push("landing con grid y checkout corto");
  if (plan.includes("reservas")) bloques.push("agenda con horarios + botón reservar");
  if (plan.includes("blog")) bloques.push("blog de lectura cómoda y SEO");
  if (plan.includes("social")) bloques.push("sección Colabora (donar/voluntariado)");

  const glue = bloques.length ? `Propongo: ${bloques.join(" · ")}.` : "";
  const resumen =
    `**Resumen vivo:** ${plan.join(" + ") || "perfil creador"}` +
    (mem.platform ? ` · plataforma: ${mem.platform}` : "") +
    (mem.cause ? ` · causa: ${mem.cause}` : "") +
    (mem.products?.length ? ` · productos: ${mem.products.map(p => p.name).join(", ")}` : "") +
    ".";

  let next = "¿Qué priorizamos hoy: ventas, reservas o leads?";
  if (plan.includes("ventas") && !mem.payment)
    next = "Para ventas: ¿pago en la web o pedidos por WhatsApp/DM?";
  else if (plan.includes("blog") && !(mem as any).blogCats)
    next = "Para blog: ¿3 categorías clave?";
  else if (plan.includes("social") && !mem.cause)
    next = "Para social: ¿a qué causa destinamos la donación?";

  let crafted = `${warm} ${glue} ${resumen} **Siguiente paso:** ${next}`;
  if (tone === "humorous") crafted = "😄 " + crafted;
  if (tone === "formal") crafted = crafted.replace(/☕⚡/g, "");
  return current ? `${crafted}\n\n${current}` : crafted;
}

export function installLanguageRuntime() {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.PULSE_LANGUAGE) return;
  w.PULSE_LANGUAGE = { absorbFacts, humanizeReply, sectorFrom, objectiveFrom };
}
