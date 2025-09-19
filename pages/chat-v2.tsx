import React, { useEffect, useRef, useState } from "react";

/**
 * PULSE · Chat Amigo — Anti-loop + NLU mejorado
 * - No cambia estilos, solo la lógica/conversación.
 * - Evita repetición de la misma pregunta.
 * - Entiende "Spotify/streaming/podcast/música" como venta por suscripción (sell).
 */

type Role = "user" | "assistant";
type Phase = "warmup" | "discover" | "propose" | "awaitConsent" | "rendering" | "postImage" | "offering";
type PendingKey = "goal" | "channel" | "audience" | null;

type ChatMessage = {
  role: Role;
  content: string;
  kind?: "text" | "preview" | "plans" | "typing";
  previewUrl?: string;
};

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const POSITIVE = ["ok","vale","va","dale","sí","si","genial","me gusta","me encanta","perfecto","seguimos","vamos","de una","go"];
const wantsPositive = (s:string) => POSITIVE.some(p => (s||"").toLowerCase().includes(p));
const isConfused = (s:string) => /(^\s*(que|qué)\??\s*$|\?\s*$|no\s*entiendo|expl[ií]came)/i.test(s||"");

const detectGoal = (s:string): "sell"|"book"|"leads"|"other" => {
  const t=(s||"").toLowerCase();
  if (/(vender|venta|e-?commerce|comprar|tienda|cartas|productos|shop|checkout|pago|carrito|suscripci[oó]n|membership|membres[ií]a)/.test(t)) return "sell";
  if (/(streaming|spotify|m[úu]sica|playlist|podcast|video|plataforma|player)/.test(t)) return "sell"; // suscripción = venta
  if (/(reserva|cita|booking|agenda|turno)/.test(t)) return "book";
  if (/(lead|captar|clientes|contacto|consulta|newsletter|registro)/.test(t)) return "leads";
  return "other";
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("warmup");

  const [brief, setBrief] = useState<{goal?:"sell"|"book"|"leads"|"other"; channel?:"checkout"|"whatsapp"; audience?:string; tone?:"warm"|"tech"}>({tone:"warm"});
  const [hasPreview, setHasPreview] = useState(false);

  // Anti-loop & memoria de preguntas
  const lastQuestionRef = useRef<string | null>(null);
  const askedGoalRef = useRef(0);
  const askedChannelRef = useRef(0);
  const askedAudienceRef = useRef(0);
  const pendingRef = useRef<PendingKey>(null);

  const startedRef = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);

  const push = (m: ChatMessage) => setMessages(prev => [...prev, m]);
  const pushTyping = () => push({ role:"assistant", content:"escribiendo…", kind:"typing" });
  const replaceTypingWith = (m: ChatMessage) => {
    setMessages(prev => {
      const i = prev.findIndex(x => x.kind === "typing" && x.role === "assistant");
      if (i>=0){ const c=[...prev]; c.splice(i,1,m); return c; }
      return [...prev,m];
    });
  };
  const say = async (content: string) => {
    // Ritmo humano ligero
    pushTyping();
    const delay = 380 + Math.floor(Math.random()*420);
    await new Promise(r => setTimeout(r, delay));
    replaceTypingWith({ role:"assistant", content, kind:"text" });
  };

  useEffect(()=>{ scroller.current?.scrollTo({top: scroller.current.scrollHeight, behavior:"smooth"}); },[messages]);

  // Saludo único (sin disparar preguntas aún)
  useEffect(()=>{
    if (startedRef.current) return;
    startedRef.current = true;
    say("Estoy contigo. Cuéntame la idea como a un amigo y la aterrizo ☕");
    setPhase("discover");
  },[]);

  // Helpers de preguntas (con anti-duplicación)
  const askOnce = async (q:string, key: PendingKey) => {
    if (lastQuestionRef.current === q) return; // anti-loop
    lastQuestionRef.current = q;
    pendingRef.current = key;
    await say(q);
  };

  const askGoal = async () => {
    askedGoalRef.current++;
    if (askedGoalRef.current === 1) {
      await askOnce("¿Qué quieres lograr: vender, reservas o leads?", "goal");
    } else if (askedGoalRef.current === 2) {
      await askOnce("Te doy 3 opciones rápidas: A) vender (productos o suscripciones) · B) reservas · C) captar leads. ¿Cuál te encaja más?", "goal");
    } else {
      // Escalada: asume venta por defecto (mejor avanzar que bloquear)
      setBrief(b=>({...b, goal: b.goal ?? "sell"}));
    }
  };

  const askChannel = async () => {
    askedChannelRef.current++;
    if (askedChannelRef.current === 1) {
      await askOnce("¿Cerramos con checkout o por WhatsApp?", "channel");
    } else {
      await askOnce("¿Prefieres botón de pagar (checkout) o chat por WhatsApp para cerrar la venta?", "channel");
    }
  };

  const askAudience = async () => {
    askedAudienceRef.current++;
    if (askedAudienceRef.current === 1) {
      await askOnce("¿Para quién va (en 3 palabras)?", "audience");
    } else {
      await askOnce("Dime tu público en breve: p.ej., “padres jóvenes”, “gamers retro” o “fans de música”.", "audience");
    }
  };

  // Propuesta y render
  const propose = async () => {
    const goal = brief.goal || "sell"; // fallback a sell
    const tone = brief.tone === "tech" ? "técnico" : "cálido";
    const h1 =
      goal === "sell" ? "Tienda lista hoy" :
      goal === "book" ? "Reservas sin fricción" :
      goal === "leads" ? "Consigue clientes en minutos" : "Tu web lista hoy";
    const sub =
      goal === "sell" ? "Checkout rápido y confianza (suscripción o productos)" :
      goal === "book" ? "Agenda clara y recordatorios" :
      goal === "leads" ? "Formulario corto y respuesta ágil" : "Comienza simple, crece fácil";
    await say(`Haríamos **${h1}**. Sub: **${sub}**. Tono ${tone}. ¿Te lo pinto?`);
    lastQuestionRef.current = "¿Te lo pinto?";
    pendingRef.current = null;
    setPhase("awaitConsent");
  };

  const renderPreview = async () => {
    setPhase("rendering");
    await say("Perfecto, lo pinto y vuelvo ☕⚡");
    try {
      const body = {
        h1: brief.goal==="sell" ? "Tienda lista hoy" : brief.goal==="book" ? "Reservas sin fricción" : brief.goal==="leads" ? "Consigue clientes en minutos" : "Tu web lista hoy",
        sub: brief.goal==="sell" ? "Checkout rápido y confianza (suscripción o productos)" : brief.goal==="book" ? "Agenda clara y recordatorios" : brief.goal==="leads" ? "Formulario corto y respuesta ágil" : "Comienza simple, crece fácil",
        tone: brief.tone || "warm",
      };
      const res = await fetch("/api/pulse-tools/create-preview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      let url = "/previews/preview.jpg";
      if (res.ok){ const j=await res.json().catch(()=>null); if (j?.url) url=j.url; }
      replaceTypingWith({ role:"assistant", content:"Imagen lista ✨ ¿tocamos algo? (Color · Tono · CTA)", kind:"preview", previewUrl:url });
      setPhase("postImage");
    } catch {
      await say("Se me cayó una gota de café 😅, reintento en 1s.");
      setPhase("postImage");
    }
  };

  const showPlans = async () => {
    await say("Genial. Te dejo opciones cuando quieras avanzar. Si prefieres, pulimos un detalle más.");
    push({ role:"assistant", content:"planes", kind:"plans" });
    setPhase("offering");
  };

  // Entrada usuario
  const handleUnderstanding = (text:string) => {
    // Actualiza brief por heurísticas
    const g = detectGoal(text);
    if (!brief.goal || brief.goal==="other") setBrief(b=>({...b, goal: g==="other" ? b.goal ?? "sell" : g}));

    if (!brief.channel) {
      if (/whats?app/i.test(text)) setBrief(b=>({...b, channel:"whatsapp"}));
      if (/check(out)?|pago|compra|carrito/i.test(text)) setBrief(b=>({...b, channel:"checkout"}));
    }
    if (!brief.audience && /(jóven|joven|padre|familia|empresa|tienda|coleccionista|fans|gamer|m[úu]sico|artista)/i.test(text)) {
      setBrief(b=>({...b, audience:text}));
    }
    if (/tech|t[eé]cnico|minimal|fr[ií]o/i.test(text)) setBrief(b=>({...b, tone:"tech"}));
    if (/c[aá]lid|amig|humano|cercan/i.test(text)) setBrief(b=>({...b, tone:"warm"}));
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages(prev => [...prev, { role:"user", content:text, kind:"text" }]);
    handleUnderstanding(text);

    // Si el usuario está confundido, reformula y no repitas literal
    if (isConfused(text)) {
      if (!brief.goal || brief.goal==="other") { await askGoal(); return; }
      if (!brief.channel) { await askChannel(); return; }
      if (!brief.audience) { await askAudience(); return; }
    }

    if (phase === "discover") {
      // Decide la siguiente pregunta mínima
      if (!brief.goal || brief.goal==="other") { await askGoal(); return; }
      if (!brief.channel) { await askChannel(); return; }
      if (!brief.audience) { await askAudience(); return; }
      // Ya tenemos lo mínimo → propone
      setPhase("propose");
      await propose();
      return;
    }

    if (phase === "propose" || phase === "awaitConsent") {
      if (wantsPositive(text)) { await renderPreview(); return; }
      // Si aún no hay permiso, intenta cerrar huecos sin repetir
      if (!brief.goal || brief.goal==="other") { await askGoal(); return; }
      if (!brief.channel) { await askChannel(); return; }
      if (!brief.audience) { await askAudience(); return; }
      await say("¿Te lo pinto con ese enfoque?");
      lastQuestionRef.current = "¿Te lo pinto con ese enfoque?";
      return;
    }

    if (phase === "rendering") {
      await say("Voy a por la imagen y vuelvo ☕");
      return;
    }

    if (phase === "postImage") {
      if (/(color|tono|cta|bot[oó]n|tipograf[ií]a|texto)/i.test(text)) {
        await say("Hecho. Ajusté eso. ¿Algo más o te gusta así?");
        return;
      }
      if (wantsPositive(text)) { await showPlans(); return; }
      await say("¿Quieres que la deje más **minimal** o más **tech**? También puedo tocar el CTA.");
      return;
    }

    if (phase === "offering") {
      if (/zip|descarga|carpeta|5€|cinco/i.test(text)) { await say("Te dejo el botón de descarga listo abajo."); return; }
      if (/premium|39|diamante|59|hosting|editor/i.test(text)) { await say("Marca la casilla legal y pulsa pagar. Aquí sigo para lo que necesites."); return; }
      await say("Si prefieres, ajustamos un detalle más y luego decides con calma.");
      return;
    }
  };

  // UI (estilos base ya existentes)
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
