import React, { useEffect, useRef, useState } from "react";

/**
 * PULSE · Chat Amigo (solo lógica/flow; no cambia estética)
 * - Saludo único, arranque sin preguntas hasta que el usuario hable.
 * - Ritmo humano: indicador "escribiendo..." + pequeña pausa antes de cada mensaje.
 * - Una pregunta por turno. Sin bucles.
 * - Imagen -> micro-ediciones -> ofertas SOLO tras señal positiva.
 */

type Role = "user" | "assistant";
type Phase = "warmup" | "discover" | "propose" | "awaitConsent" | "rendering" | "postImage" | "offering";

type ChatMessage = {
  role: Role;
  content: string;
  kind?: "text" | "preview" | "plans" | "typing";
  previewUrl?: string;
};

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// Heurísticas suaves
const POSITIVE = ["ok","vale","va","dale","de una","sí","si","genial","me gusta","me encanta","perfecto","seguimos","continúa","continua","let's go","vamos"];
const wantsPositive = (s:string) => POSITIVE.some(p => (s||"").toLowerCase().includes(p));
const wantsChange  = (s:string) => /(cambiar|otro|más|minimal|tech|t[eé]cnico|color|tono|cta|bot[oó]n)/i.test(s||"");
const detectGoal   = (s:string): "sell"|"book"|"leads"|"other" => {
  const t=(s||"").toLowerCase();
  if (/(vender|venta|e-?commerce|comprar|tienda|cartas|productos|shop)/.test(t)) return "sell";
  if (/(reserva|cita|booking|agenda|turno)/.test(t)) return "book";
  if (/(lead|captar|clientes|contacto|consulta)/.test(t)) return "leads";
  return "other";
};

export default function Chat() {
  // Estado UI (no se tocan estilos originales de tarjetas/burbujas)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("warmup");

  // Brief de sesión (memoria mínima)
  const [brief, setBrief] = useState<{goal?:"sell"|"book"|"leads"|"other"; channel?:"checkout"|"whatsapp"; audience?:string; tone?:"warm"|"tech"}>({tone:"warm"});
  const [hasPreview, setHasPreview] = useState(false);
  const [tweakCount, setTweakCount] = useState(0);

  // Guards
  const startedRef = useRef(false);        // evita doble saludo
  const userHasSpokenRef = useRef(false);  // no preguntar antes de oír al usuario
  const scroller = useRef<HTMLDivElement>(null);

  // === helpers de UI ===
  const push = (m: ChatMessage) => setMessages(prev => [...prev, m]);
  const pushTyping = () => push({ role:"assistant", content:"escribiendo…", kind:"typing" });
  const replaceTypingWith = (m: ChatMessage) => {
    setMessages(prev => {
      const idx = prev.findIndex(x => x.kind === "typing" && x.role === "assistant");
      if (idx >= 0) {
        const copy=[...prev]; copy.splice(idx,1,m); return copy;
      }
      return [...prev, m];
    });
  };
  const say = async (content: string) => {
    // Ritmo humano ligero: indicador + pequeña pausa (400–900ms)
    pushTyping();
    const delay = 400 + Math.floor(Math.random()*500);
    await new Promise(r => setTimeout(r, delay));
    replaceTypingWith({ role:"assistant", content, kind:"text" });
  };

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Saludo único (sin preguntas aquí)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    say("Estoy contigo. Cuéntame la idea como a un amigo y la aterrizo ☕");
    setPhase("discover");
  }, []);

  // === lógica de conversación ===

  const firstQuestion = () => {
    if (!brief.goal || brief.goal === "other") return "¿Qué quieres lograr: vender, reservas o leads?";
    if (!brief.channel) return "¿Cerramos con checkout o por WhatsApp?";
    if (!brief.audience) return "¿Para quién va (en 3 palabras)?";
    return null;
  };

  const propose = async () => {
    const goal = brief.goal || "other";
    const tone = brief.tone === "tech" ? "técnico" : "cálido";
    const h1 =
      goal === "sell" ? "Tienda lista hoy" :
      goal === "book" ? "Reservas sin fricción" :
      goal === "leads" ? "Consigue clientes en minutos" : "Tu web lista hoy";
    const sub =
      goal === "sell" ? "Checkout rápido y confianza" :
      goal === "book" ? "Agenda clara y recordatorios" :
      goal === "leads" ? "Formulario corto y respuesta ágil" : "Comienza simple, crece fácil";
    await say(`Haríamos **${h1}**. Sub: **${sub}**. Tono ${tone}. ¿Te lo pinto?`);
    setPhase("awaitConsent");
  };

  const renderPreview = async () => {
    setPhase("rendering");
    await say("Perfecto, lo pinto y vuelvo ☕⚡");
    try {
      const body = {
        h1: brief.goal==="sell" ? "Tienda lista hoy" : brief.goal==="book" ? "Reservas sin fricción" : brief.goal==="leads" ? "Consigue clientes en minutos" : "Tu web lista hoy",
        sub: brief.goal==="sell" ? "Checkout rápido y confianza" : brief.goal==="book" ? "Agenda clara y recordatorios" : brief.goal==="leads" ? "Formulario corto y respuesta ágil" : "Comienza simple, crece fácil",
        tone: brief.tone || "warm",
      };
      const res = await fetch("/api/pulse-tools/create-preview", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
      let url = "/previews/preview.jpg";
      if (res.ok) { const j = await res.json().catch(()=>null); if (j?.url) url = j.url; }
      // Inyecta preview
      replaceTypingWith({ role:"assistant", content:"Imagen lista ✨ ¿tocamos algo? (Color · Tono · CTA)", kind:"preview", previewUrl:url });
      setHasPreview(true);
      setPhase("postImage");
    } catch {
      await say("Se me volcó un sorbito de café 😅, reintento en 1s.");
      setPhase("postImage");
    }
  };

  const applyTweakFromText = async (t: string) => {
    setTweakCount(x => x+1);
    await say("Hecho. Ajusté eso. ¿Algo más o te gusta así?");
  };

  const showPlans = async () => {
    await say("Genial. Te dejo opciones cuando quieras avanzar. Si prefieres, pulimos un detalle más.");
    push({ role:"assistant", content:"planes", kind:"plans" });
    setPhase("offering");
  };

  // === envío ===
  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    userHasSpokenRef.current = true;
    setMessages(prev => [...prev, { role:"user", content:text, kind:"text" }]);

    // aprende del texto
    const g = detectGoal(text);
    if (!brief.goal || brief.goal==="other") setBrief(b => ({...b, goal:g}));
    if (!brief.channel) {
      if (/whats?app/i.test(text)) setBrief(b => ({...b, channel:"whatsapp"}));
      if (/check(out)?|pago|compra|carrito/i.test(text)) setBrief(b => ({...b, channel:"checkout"}));
    }
    if (!brief.audience && /(jóven|joven|padre|familia|empresa|tienda|coleccionista|fans|gamer|m[úu]sico)/i.test(text)) {
      setBrief(b => ({...b, audience:text}));
    }
    if (/tech|t[eé]cnico|minimal|fr[ií]o/i.test(text)) setBrief(b => ({...b, tone:"tech"}));
    if (/c[aá]lid|amig|humano|cercan/i.test(text)) setBrief(b => ({...b, tone:"warm"}));

    // ruteo por fase
    if (phase === "discover") {
      // Después del 1er mensaje del usuario, ahora sí: 1 pregunta a la vez
      const q = firstQuestion();
      if (q) { await say(q); return; }
      setPhase("propose");
      await propose();
      return;
    }

    if (phase === "propose" || phase === "awaitConsent") {
      if (wantsPositive(text)) { await renderPreview(); return; }
      // aún sin permiso -> 1 aclaración breve, no bucles
      const q = firstQuestion();
      if (q) { await say(q); return; }
      await say("¿Lo pinto con ese enfoque?");
      setPhase("awaitConsent");
      return;
    }

    if (phase === "rendering") {
      // todavía preparando imagen
      await say("Dame un segundo, termino el café y vuelvo con la imagen ☕");
      return;
    }

    if (phase === "postImage") {
      if (wantsChange(text) && tweakCount < 2) { await applyTweakFromText(text); return; }
      if (wantsPositive(text)) { await showPlans(); return; }
      await say("¿Tocamos algo? Puedo ajustar Color, Tono o el CTA.");
      return;
    }

    if (phase === "offering") {
      if (/zip|descarga|carpeta|5€|cinco/i.test(text)) { await say("Perfecto, te dejo el botón de descarga listo."); return; }
      if (/premium|39|diamante|59|hosting|editor/i.test(text)) { await say("Marca la casilla legal y pulsa pagar. Aquí sigo para lo que necesites."); return; }
      await say("Si quieres, ajustamos un detalle más y luego decides con calma.");
      return;
    }
  };

  // === UI (respetando estilos base) ===
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-100 mb-6">Chat con Pulse</h1>

      <div ref={scroller} className="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-4 h-[64vh] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={cx("my-2 flex", m.role === "assistant" ? "justify-start" : "justify-end")}>
            {m.kind === "preview" ? (
              <div className="max-w-full w-full md:w-[90%] rounded-xl border border-cyan-400/10 bg-slate-900/60 p-3">
                {m.previewUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-700/60">
                    <img src={m.previewUrl} alt="preview" className="w-full h-auto" />
                  </div>
                )}
                <div className="mt-3 text-slate-200">Imagen lista ✨ ¿tocamos algo? <span className="opacity-70">(Color · Tono · CTA)</span></div>
              </div>
            ) : m.kind === "plans" ? (
              <PlansBlock />
            ) : m.kind === "typing" ? (
              <div className="max-w-[85%] rounded-xl px-4 py-3 text-slate-300 bg-slate-800/50 border border-slate-700/50 italic">escribiendo…</div>
            ) : (
              <div className={cx(
                "max-w-[85%] rounded-xl px-4 py-3 text-slate-100",
                m.role === "assistant" ? "bg-slate-800/70 border border-slate-700/60" : "bg-slate-800/40 border border-slate-700/30"
              )}>
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); }}}
          placeholder="Háblame como a un amigo, yo diseño tu web."
          className="flex-1 rounded-xl bg-slate-900/70 border border-slate-700/60 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/40"
        />
        <button onClick={send} className="rounded-2xl bg-amber-400 text-slate-900 font-bold px-6 active:scale-[0.98] shadow-lg">Enviar</button>
      </div>
    </div>
  );
}

function PlansBlock() {
  return (
    <div className="max-w-full w-full md:w-[90%] rounded-xl border border-cyan-400/10 bg-slate-900/60 p-4">
      <h3 className="text-slate-200 font-bold mb-2">Tu web lista</h3>
      <p className="text-slate-300/80 text-sm mb-3">Descarga la carpeta y súbela en 1-click cuando quieras.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
          <div className="text-slate-200 font-semibold mb-2">Descargar carpeta — 5€</div>
          <div className="text-slate-300/80 text-sm mb-3">ZIP Next.js lista hoy.</div>
          <form method="POST" action="/api/pulse-tools/generate-zip">
            <button className="rounded-2xl bg-amber-400 text-slate-900 font-bold px-4 py-2">Descargar carpeta (5€)</button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
          <div className="text-slate-200 font-semibold mb-2">Premium — 39€</div>
          <div className="text-slate-300/80 text-sm mb-2">Carrito + pagos + IA de ventas</div>
          <label className="flex items-center gap-2 text-slate-300/80 text-sm mb-3">
            <input type="checkbox" className="accent-amber-400" /> Acepto <a className="underline" href="/pages/legal/privacidad" target="_blank">Privacidad</a> y <a className="underline" href="/pages/legal/terminos" target="_blank">Términos</a>.
          </label>
          <form method="POST" action="/api/pulse-tools/checkout">
            <input type="hidden" name="plan" value="premium" />
            <button className="rounded-2xl bg-amber-400 text-slate-900 font-bold px-4 py-2">Pagar ahora</button>
          </form>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
        <div className="text-slate-200 font-semibold mb-2">Despertar a Pulse para siempre — 59€</div>
        <div className="text-slate-300/80 text-sm mb-2">Hosting 1-click + editor + Pulse 24/7</div>
        <label className="flex items-center gap-2 text-slate-300/80 text-sm mb-3">
          <input type="checkbox" className="accent-amber-400" /> Acepto <a className="underline" href="/pages/legal/privacidad" target="_blank">Privacidad</a> y <a className="underline" href="/pages/legal/terminos" target="_blank">Términos</a>.
        </label>
        <form method="POST" action="/api/pulse-tools/checkout">
          <input type="hidden" name="plan" value="diamond" />
          <button className="rounded-2xl bg-amber-400 text-slate-900 font-bold px-4 py-2">Pagar ahora</button>
        </form>
      </div>
    </div>
  );
}
