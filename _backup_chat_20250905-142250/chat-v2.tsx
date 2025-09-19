import React, { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../lib/pulse_v2/types";
import { parseAssistant, hasPositiveSignal, wantsChange, intentFrom } from "../lib/pulse_v2/actions";

type Phase = "warmup" | "discover" | "propose" | "awaitConsent" | "rendering" | "postImage" | "offering";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export default function ChatV2() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("warmup");
  const [brief, setBrief] = useState<{ name?: string; goal?: "sell"|"book"|"leads"|"other"; channel?: "checkout"|"whatsapp"; audience?: string; tone?: "warm"|"tech" }>(
    { tone: "warm" }
  );
  const [hasPreview, setHasPreview] = useState(false);
  const [tweakCount, setTweakCount] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // saludo inicial
    pushAssistant("Estoy contigo. Cuéntame la idea como a un amigo y la aterrizo ☕");
    setPhase("discover");
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const push = (m: ChatMessage) => setMessages((prev) => [...prev, m]);
  const pushAssistant = (content: string) => push({ role: "assistant", content, kind: "text" });
  const pushUser = (content: string) => push({ role: "user", content, kind: "text" });

  // Helpers
  const firstQuestion = () => {
    if (!brief.goal) return "¿Qué quieres lograr: vender, reservas o leads?";
    if (!brief.channel) return "¿Cerramos con checkout o por WhatsApp?";
    if (!brief.audience) return "¿Para quién va esto (en 3 palabras)?";
    return null;
  };

  const propose = () => {
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
    pushAssistant(`Haría **${h1}**. Sub: **${sub}**. Tono ${tone}. ¿Te lo pinto?`);
    setPhase("awaitConsent");
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    pushUser(text);

    // En cada turno: actualizar brief con heurísticas simples
    const t = text.toLowerCase();
    const ng = intentFrom(text);
    if (!brief.goal || brief.goal === "other") {
      setBrief((b) => ({ ...b, goal: ng }));
    }
    if (!brief.channel) {
      if (/whats?app/.test(t)) setBrief((b) => ({ ...b, channel: "whatsapp" }));
      if (/check(out)?|pago|compra/.test(t)) setBrief((b) => ({ ...b, channel: "checkout" }));
    }
    if (!brief.audience && /(jóven|joven|padre|familia|empresa|tienda|coleccionista)/.test(t)) {
      setBrief((b) => ({ ...b, audience: text }));
    }
    if (/tech|técnic|frío|minimal/i.test(text)) setBrief((b) => ({ ...b, tone: "tech" }));
    if (/cálid|amig|cercan|humano/i.test(text)) setBrief((b) => ({ ...b, tone: "warm" }));

    // Ruteo por fase
    if (phase === "discover") {
      const q = firstQuestion();
      if (q) { pushAssistant(q); return; }
      setPhase("propose");
      propose();
      return;
    }

    if (phase === "propose" || phase === "awaitConsent") {
      if (hasPositiveSignal(text)) {
        await renderPreview();
        return;
      }
      // Si no dio “ok”, aclarar con una pregunta
      const q = firstQuestion();
      if (q) { pushAssistant(q); return; }
      // Si ya tenemos todo pero no dio permiso, pide permiso otra vez
      pushAssistant("¿Lo pinto con ese enfoque?");
      setPhase("awaitConsent");
      return;
    }

    if (phase === "rendering") {
      pushAssistant("Dame un segundo, vuelvo con la imagen ☕⚡");
      return;
    }

    if (phase === "postImage") {
      // Cambios o “me gusta”
      if (wantsChange(text) && tweakCount < 2) {
        await applyTweakFromText(text);
        return;
      }
      if (hasPositiveSignal(text)) {
        showPlans();
        return;
      }
      // Si nada claro, sugerir chips
      pushAssistant("¿Tocamos algo? [ Color ] [ Tono ] [ CTA ]");
      return;
    }

    if (phase === "offering") {
      // Deja que la UI lleve checkout o zip
      if (/zip|descarga|carpeta|5€|5 eur|cinco/i.test(text)) {
        // La UI ya tiene el botón, aquí solo empatía
        pushAssistant("Listo. Te dejo el botón para descargar la carpeta y avanzar cuando quieras.");
        return;
      }
      if (/premium|39|diamante|59|hosting|editor/i.test(text)) {
        pushAssistant("Perfecto. Marca la casilla legal y pulsa pagar ahora. Sigo aquí por si necesitas algo.");
        return;
      }
      // Humor + guía
      pushAssistant("Si prefieres, pulimos 1 detalle más y luego te muestro opciones otra vez 😊");
      return;
    }
  };

  const renderPreview = async () => {
    setPhase("rendering");
    pushAssistant("Perfecto, lo pinto y vuelvo ☕⚡");
    try {
      const body = {
        h1: brief.goal === "sell" ? "Tienda lista hoy" :
            brief.goal === "book" ? "Reservas sin fricción" :
            brief.goal === "leads" ? "Consigue clientes en minutos" : "Tu web lista hoy",
        sub: brief.goal === "sell" ? "Checkout rápido y confianza" :
             brief.goal === "book" ? "Agenda clara y recordatorios" :
             brief.goal === "leads" ? "Formulario corto y respuesta ágil" : "Comienza simple, crece fácil",
        tone: brief.tone || "warm",
      };
      const res = await fetch("/api/pulse-tools/create-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let url = "/previews/preview.jpg";
      if (res.ok) {
        const j = await res.json().catch(()=>null);
        if (j?.url) url = j.url;
      }
      push({ role: "assistant", content: "Imagen lista ✨ ¿tocamos algo?", kind: "preview", previewUrl: url });
      setHasPreview(true);
      setPhase("postImage");
      pushAssistant("Si te gusta, dímelo y te dejo opciones. Si no, tocamos Color/Tono/CTA.");
    } catch (e) {
      pushAssistant("Se me volcó un sorbito de café 😅, reintento en 1s.");
      setTimeout(() => { /* noop */ }, 800);
      setPhase("postImage");
    }
  };

  const applyTweakFromText = async (t: string) => {
    const payload:any = {};
    if (/color|amarill|azul|cian|dorado|oro|naranja/i.test(t)) payload.color = "ajuste";
    if (/tono|cálid|calido|amig|tech|técnic/i.test(t)) payload.tone = /tech|técnic/i.test(t) ? "tech" : "warm";
    if (/cta|botón|boton|llamado/i.test(t)) payload.cta = "ajuste";
    setTweakCount(c => c+1);
    pushAssistant("Hecho. Ajusté eso. ¿Algo más o te gusta así?");
  };

  const showPlans = () => {
    setPhase("offering");
    pushAssistant("Genial. Te dejo las opciones y decides cuando quieras.");
    push({ role: "assistant", content: "planes", kind: "plans" });
  };

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
                    {/* imagen 16:9 */}
                    <img src={m.previewUrl} alt="preview" className="w-full h-auto" />
                  </div>
                )}
                <div className="mt-3 text-slate-200">Imagen lista ✨ ¿tocamos algo? <span className="opacity-70">(Color · Tono · CTA)</span></div>
              </div>
            ) : m.kind === "plans" ? (
              <PlansBlock />
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
          onKeyDown={(e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); handleSend(); }}}
          placeholder="Háblame como a un amigo, yo diseño tu web."
          className="flex-1 rounded-xl bg-slate-900/70 border border-slate-700/60 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/40"
        />
        <button
          onClick={handleSend}
          className="rounded-2xl bg-amber-400 text-slate-900 font-bold px-6 active:scale-[0.98] shadow-lg"
        >Enviar</button>
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
