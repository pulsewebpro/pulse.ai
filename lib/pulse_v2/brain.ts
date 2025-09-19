import fs from "fs";
import path from "path";
import { ChatMessage, ParsedAssistant, PulseAction, SessionState } from "./types";
import { nanoid } from "nanoid";

// Utilidades pequeñas
const r = (p: string) => path.join(process.cwd(), p);
const safeRead = (p: string) => fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";

const phrasebank = safeRead(r("templates/pulse/phrasebank-es.md"));
const microQs = JSON.parse(safeRead(r("templates/pulse/micro_questions.es.json") || "{}"));
const proposalsRaw = safeRead(r("templates/pulse/proposals.es.md"));
const intentsCsv = safeRead(r("templates/pulse/intents.es.csv"));

type Intent = { trigger: string; vertical: string; objetivo?: string; modelo_hint?: string; };

const intents: Intent[] = intentsCsv
  .split(/\r?\n/)
  .map(l => l.trim())
  .filter(l => l && !l.startsWith("#"))
  .map(l => {
    const [trigger, vertical, objetivo, modelo_hint] = l.split(",").map(s => (s||"").trim());
    return { trigger, vertical, objetivo, modelo_hint };
  });

// Mini helpers para extraer bloques de proposals por vertical
function proposalFor(vertical: string) {
  const rx = new RegExp(`##\\s*${vertical}\\s*[\\r\\n]+([\\s\\S]*?)(?=\\n##\\s*|$)`, "i");
  const m = proposalsRaw.match(rx);
  return (m?.[1] || "").trim();
}

// Detecta idioma muy simple
function detectLang(txt: string): "es"|"en"|"fr" {
  const t = txt.toLowerCase();
  if (/[àâçéèêëîïôûùüÿœ]/.test(t) || t.includes("français") || t.includes("francés")) return "fr";
  if (/[a-z]/.test(t) && (t.includes("english") || t.includes("english") || /\bthe\b/.test(t))) return "en";
  return "es";
}

// Intención por triggers
function detectIntent(txt: string) {
  const t = txt.toLowerCase();
  let hit: Intent | null = null;
  for (const it of intents) {
    if (!it.trigger) continue;
    if (t.includes(it.trigger.toLowerCase())) { hit = it; break; }
  }
  return hit;
}

// Extrae nombre si dice "soy X" o "me llamo X"
function extractName(txt: string) {
  const m = txt.match(/\b(?:soy|me llamo)\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+)\b/i);
  return m ? m[1] : undefined;
}

// FSM principal
export function nextAssistant(thread: ChatMessage[], state: SessionState): ParsedAssistant {
  const lastUser = [...thread].reverse().find(m => m.role === "user")?.content || "";
  const name = extractName(lastUser);
  if (name) state.slots.nombre = name;

  // Detect idioma 1ª vez
  if (!state.slots.idioma) state.slots.idioma = detectLang(lastUser);

  // Intento de intención por triggers
  const intent = detectIntent(lastUser);
  if (intent?.vertical && !state.slots.sector) state.slots.sector = intent.vertical.toLowerCase();
  if (intent?.objetivo && !state.slots.objetivo) {
    state.slots.objetivo = intent.objetivo as any;
  }
  if (intent?.modelo_hint && !state.slots.modelo) {
    state.slots.modelo = intent.modelo_hint as any;
  }
  if (!state.slots.tono) state.slots.tono = "premium";

  // Confianza simple
  let confianza = 0;
  if (state.slots.sector) confianza += 2;
  if (state.slots.objetivo) confianza += 1;
  if (state.slots.modelo || state.slots.tema) confianza += 1;

  // Etapas
  if (state.stage === "warmup") {
    state.stage = "discovery";
    const warmups = (phrasebank.match(/## Warm-up[\s\S]*?##/i)?.[0] || "").split("\n- ").slice(1,6).map(s=>s.replace(/^-/,'').trim());
    const pick = warmups[Math.floor(Math.random()*warmups.length)] || "Estoy contigo. Cuéntame tu idea como a un amigo y yo la convierto en web real ☕";
    return { text: pick, actions: [] };
  }

  // Si ya renderizamos, no hablamos más (gating)
  if (state.stage === "offers") {
    return { text: "", actions: [] };
  }

  // Discovery: máx 2 preguntas
  if (state.stage === "discovery" && confianza < 3 && state.asked < 2) {
    const vertical = (state.slots.sector || "default") as keyof typeof microQs;
    const list = microQs[vertical] || microQs["default"] || [];
    const q = list[state.asked] || microQs["default"][state.asked] || "¿Qué quieres lograr primero: vender, reservas o leads?";
    state.asked += 1;
    return { text: q, actions: [] };
  }

  // Si aún falta, asumimos defaults del vertical y proponemos
  if (state.stage === "discovery" && confianza < 3 && state.asked >= 2) {
    if (!state.slots.objetivo && state.slots.sector === "streaming") state.slots.objetivo = "suscripcion";
    if (!state.slots.objetivo && state.slots.sector === "ecommerce") state.slots.objetivo = "vender";
    if (!state.slots.objetivo && state.slots.sector === "reservas") state.slots.objetivo = "reservas";
    if (!state.slots.objetivo && state.slots.sector === "leads") state.slots.objetivo = "leads";
    if (!state.slots.modelo) {
      if (state.slots.sector === "ecommerce") state.slots.modelo = "checkout";
      if (state.slots.sector === "reservas") state.slots.modelo = "calendario";
      if (state.slots.sector === "leads") state.slots.modelo = "formulario";
      if (state.slots.sector === "streaming") state.slots.modelo = "suscripcion";
    }
    confianza = 3;
  }

  // Recap + Propuesta
  if (state.stage === "discovery" && confianza >= 3) {
    state.stage = "proposal";
    const sector = state.slots.sector || "ecommerce";
    const recap = `Entonces: ${sector} con ${state.slots.objetivo || "objetivo claro"} para ${state.slots.tema || "tu público"}. ¿Sí?`;
    const p = proposalFor(sector) || proposalFor("ecommerce");
    const lines = p.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    // Formateo 4 líneas máximo
    const H1 = lines.find(l=>/^H1:/i.test(l))?.replace(/^H1:\s*/i,"") || "Tu web lista en minutos";
    const Sub = lines.find(l=>/^Subtítulo:/i.test(l))?.replace(/^Subtítulo:\s*/i,"") || "Claridad, confianza y acción.";
    const Sec = (lines.find(l=>/^Secciones:/i.test(l))?.replace(/^Secciones:\s*/i,"") || "Hero · Sección 1 · Sección 2 · Sección 3 · CTA").replace(/\s+/g," ").trim();
    const CTA = (lines.find(l=>/^CTA:/i.test(l))?.replace(/^CTA:\s*/i,"") || "Empezar ahora");
    const Vari = "Variantes: A (Minimal) · B (Tech)";
    const text = ` ${recap}\n\n**H1:** ${H1}\n**Subtítulo:** ${Sub}\n**Secciones:** ${Sec}\n**CTA:** ${CTA} · **${Vari}**`;
    return { text, actions: [] };
  }

  if (state.stage === "proposal") {
    state.stage = "rendering";
    const text = "Perfecto. **Lo tengo. Genero la imagen.** ☕⚡";
    const actions: PulseAction[] = [
      { type: "CREATE_PREVIEW", payload: { id: nanoid(), ratio: "16:9" } }
    ];
    return { text, actions };
  }

  if (state.stage === "rendering") {
    // Tras crear preview (front lo inyecta), pasamos a ofertas
    state.stage = "offers";
    const actions: PulseAction[] = [
      { type: "OFFER_PLANS", payload: {
        legal: "Al continuar aceptas la Política de Privacidad y Términos.",
        plans: [
          { id: "zip5",   title: "Descargar carpeta (5€)" },
          { id: "p39",    title: "Expansión — 39€" },
          { id: "p59",    title: "Despertar a Pulse — 59€" }
        ]
      } }
    ];
    // Gating: chat calla (texto vacío) y UI muestra la tarjeta
    return { text: "", actions };
  }

  // Fallback
  return { text: "Se me derramó un pelín el café mientras renderizaba 😅. Reintento ya mismo.", actions: [] };
}
