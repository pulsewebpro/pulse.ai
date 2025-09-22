export type PlanKey = "ventas" | "reservas" | "blog" | "creador" | "social";
export type BrainMem = {
  plan?: PlanKey[];
  platform?: "tiktok"|"youtube"|"twitch"|"instagram";
  alias?: string;
  products?: Array<{name:string, price?:string}>;
  cause?: string;
  sector?: string;
  objective?: string;
  tone?: "humorous"|"formal"|"neutral";
  [k:string]: any;
};

const NUM_MAP: Record<string, PlanKey> = {
  "1":"ventas","2":"reservas","3":"blog","4":"creador","5":"social"
};
const WORD_MAP: Record<PlanKey, RegExp> = {
  ventas:   /\b(venta|ventas|tienda|e-?commerce|producto|checkout|carrito)\b/i,
  reservas: /\b(reserva|reservas|cita|citas|agenda|booking|mesa|turno)\b/i,
  blog:     /\b(blog|art[íi]culo|art[íi]culos|contenido|noticias|seo)\b/i,
  creador:  /\b(creador|influencer|link[- ]?in[- ]?bio|links?|bio|tiktok|youtube|twitch)\b/i,
  social:   /\b(ong|social|donaci[oó]n|donar|voluntariado|colabora|impacto)\b/i,
};

function uniq<T>(arr:T[]){ return Array.from(new Set(arr)); }

function addPillarsFromText(plan:PlanKey[], text:string){
  const out=[...plan];
  (text.match(/\b[1-5]\b/g)||[]).forEach(n => out.push(NUM_MAP[n]));
  (Object.keys(WORD_MAP) as PlanKey[]).forEach(k=>{ if (WORD_MAP[k].test(text)) out.push(k); });
  return uniq(out);
}

function extractFacts(text:string, mem:BrainMem){
  const t = text.toLowerCase();
  const m = {...mem};
  if (/\btik ?tok\b/.test(t)) m.platform="tiktok";
  else if (/\byoutube\b/.test(t)) m.platform="youtube";
  else if (/\btwitch\b/.test(t)) m.platform="twitch";
  else if (/\b(ig|instagram)\b/.test(t)) m.platform="instagram";
  const alias = text.match(/\b(me llamo|mi nombre es|soy)\s+([@\w.\-]{2,})/i)?.[2];
  if (alias) m.alias = alias.replace(/^@/,'');
  const cause = text.match(/\b(causa|proyecto|ong)\b.*?:?\s*([a-záéíóúñ\s]{3,})/i)?.[2];
  if (cause) m.cause = cause.trim();
  const prods: Array<{name:string, price?:string}> = [];
  (text.match(/([a-z0-9 .\-]{2,})\s+(\d+[.,]?\d*)\s?(€|eur|euros)/gi)||[]).forEach(line=>{
    const mm = line.match(/^(.*?)[\s\-:]+(\d+[.,]?\d*)\s?(€|eur|euros)$/i);
    if (mm) prods.push({ name:mm[1].trim(), price:mm[2].replace(',','.')+"€" });
  });
  if (prods.length) m.products = uniq([...(m.products||[]), ...prods]);
  return m;
}

function chooseDominant(plan:PlanKey[]): PlanKey {
  if (!plan || plan.length===0) return "creador";
  const order: PlanKey[] = ["ventas","reservas","blog","creador","social"];
  for (const k of order) if (plan.includes(k)) return k;
  return plan[0];
}
function sectorFromPlan(plan:PlanKey[]): string {
  const d = chooseDominant(plan);
  return d==="ventas" ? "tienda online"
       : d==="reservas" ? "restaurante"
       : d==="blog" ? "blog"
       : d==="social" ? "ONG" : "creador";
}
function objectiveFromPlan(plan:PlanKey[]): string {
  const d = chooseDominant(plan);
  return d==="ventas" ? "ventas"
       : d==="reservas" ? "reservas"
       : d==="blog" ? "contenido"
       : d==="social" ? "colaborar" : "seguidores";
}

export function absorbFacts(text:string, mem:BrainMem): BrainMem {
  const plan = addPillarsFromText(mem.plan||[], text);
  const m1 = extractFacts(text, {...mem, plan});
  m1.sector = m1.sector || sectorFromPlan(plan);
  m1.objective = m1.objective || objectiveFromPlan(plan);
  return m1;
}

export function humanizeReply(reply:string, lastUser:string, mem:BrainMem){
  const plan = mem.plan||[];
  const bits:string[] = [];
  if (plan.includes("creador")) bits.push("link-in-bio con CTA");
  if (plan.includes("ventas"))  bits.push("landing con catálogo y checkout corto");
  if (plan.includes("reservas"))bits.push("agenda con horarios + botón reservar");
  if (plan.includes("blog"))    bits.push("blog legible y SEO");
  if (plan.includes("social"))  bits.push("sección Colabora (donar/voluntariado)");

  const start = (/^soy\b/i.test(lastUser) ? "¡Bien! Eso trae tráfico caliente." :
                 /ventas?/.test(lastUser) ? "Perfecto, conectamos ventas con tu perfil." :
                 /reserva/.test(lastUser) ? "Genial, reservas sin fricción." :
                 /blog|contenido/.test(lastUser) ? "Me gusta, el blog empuja SEO y recurrencia." :
                 /ong|social|donaci/.test(lastUser) ? "Me encanta, le damos propósito a cada visita." :
                 "Ok, voy sumando todo a la idea.");

  const resumen = `**Resumen vivo:** ${(plan.length? plan.join(' + ') : mem.sector || "perfil creador")}${mem.platform?` · plataforma: ${mem.platform}`:""}${mem.cause?` · causa: ${mem.cause}`:""}${(mem.products&&mem.products.length)?` · productos: ${mem.products.map(p=>p.name).join(', ')}`:""}.`;
  const prop = bits.length ? `Propongo: ${bits.join(" · ")}.` : "";
  let next = "¿Priorizamos ventas, reservas o leads hoy?";
  if (plan.includes("ventas")) next = "¿Pago en la web o pedido por WhatsApp/DM?";
  else if (plan.includes("blog")) next = "¿3 categorías clave del blog?";
  else if (plan.includes("social") && !mem.cause) next = "¿A qué causa va la donación?";

  const crafted = `${start} ${prop} ${resumen} **Siguiente paso:** ${next}`;
  return reply ? `${crafted}\n\n${reply}` : crafted;
}
