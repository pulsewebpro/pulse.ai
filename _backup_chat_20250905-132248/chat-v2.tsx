import { useEffect, useRef, useState } from "react";
import Head from "next/head";

type Role = "user" | "assistant";
type ChatMessage = { role: Role; content: string };

type Intent = {
  sector: string; objetivo: string; estilo: string; idioma: "es"|"en"|"fr";
  h1: string; subtitle: string; sections: string[]; nombre?: string; producto?: string;
};
type Detected = { intent: Intent; confidence: number; humor?: boolean };

type Plan = { id:number; nombre:string; precio:number; claim:string };

const PULSE_IMG = "/pulse/pulse-neutral-coffee-4k.png";

export default function ChatV2(){
  const [messages,setMessages] = useState<ChatMessage[]>([
    { role:"assistant", content:"Estoy contigo. Cuéntame tu idea como si se la contases a un amigo y yo te la convierto en web real ☕⚡" }
  ]);
  const [input,setInput] = useState("");
  const [state,setState] = useState<"descubrimiento"|"propuesta"|"renderizado">("descubrimiento");

  const [intent,setIntent] = useState<Intent|null>(null);
  const [previewUrl,setPreviewUrl] = useState<string|null>(null);
  const [zipUrl,setZipUrl] = useState<string|null>(null);
  const [plans,setPlans] = useState<Plan[]|null>(null);
  const [loading,setLoading] = useState(false);
  const [errored,setErrored] = useState(false);

  const [acceptLegal, setAcceptLegal] = useState(false);
  const [activePlan, setActivePlan] = useState<number|null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ chatRef.current?.scrollTo({top:chatRef.current.scrollHeight, behavior:"smooth"}); },
    [messages,loading,previewUrl,zipUrl,plans,state]);

  const say = (role:Role, content:string) => setMessages(prev=>[...prev,{ role, content }]);

  const friendlyAck = (d:Detected) => {
    const nombre = d.intent?.nombre?.trim();
    const hey = nombre ? `${nombre},` : "Genial,";
    const joke = d.humor ? " (me hiciste sonreír 😄)" : "";
    say("assistant", `${hey} te sigo${joke}. Dame 2 cosillas más si puedes: ¿qué quieres lograr (vender, reservas, leads) y si hay algo “must”?`);
  };

  const processIdea = async (raw:string) => {
    const text = raw.trim(); if(!text) return;
    say("user", text); setInput("");

    // Si ya renderizamos, no hablamos más: solo dejamos CTAs activos
    if (state==="renderizado") return;

    setLoading(true);
    try{
      const det:Detected = await fetch("/api/pulse-tools/local-intent",{
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ text })
      }).then(r=>r.json());

      // Memoria de nombre mínima
      const name = det.intent?.nombre?.trim();
      if (name) localStorage.setItem("pulse_name", name);

      // Si la confianza es baja, acompañamos sin bloquear
      if (det.confidence < 2 && state==="descubrimiento"){
        friendlyAck(det);
        setLoading(false);
        return;
      }

      // Pasamos a propuesta
      setState("propuesta");
      const it = det.intent; setIntent(it);

      const nombre = it?.nombre || localStorage.getItem("pulse_name") || "";
      const pref = nombre ? `${nombre}, ` : "";
      const pitch =
        `${pref}asumo estilo **${it.estilo}** (lo cambio si quieres).\n\n` +
        `**Propuesta**\n• H1: ${it.h1}\n• Subtítulo: ${it.subtitle}\n• Secciones: ${it.sections.join(" · ")}\n• CTA: "Diseñar mi web"`;

      say("assistant", pitch);
      say("assistant", "Dame un segundo, te genero la imagen. ☕⚡");

      // Preview (la IMAGEN es el gatillo para mostrar planes)
      const pv = await fetch("/api/pulse-tools/create-preview",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          sector: it.sector, objetivo: it.objetivo, estilo: it.estilo, idioma: it.idioma,
          titulo: it.h1, subtitulo: it.subtitle, colorway: "cyan"
        })
      }).then(r=>r.json());
      setPreviewUrl(pv?.url || "/pulse/pulse-neutral-coffee-4k.png");

      // ZIP descargable (aún oculto, solo aparece con la imagen)
      const z = await fetch("/api/pulse-tools/generate-zip",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          sector: it.sector, objetivo: it.objetivo, idioma: it.idioma, brand:"Pulse Demo",
          h1: it.h1, subtitle: it.subtitle, sections: it.sections
        })
      }).then(r=>r.json());
      setZipUrl(z?.url || null);

      // Llegó la imagen → silenciamos el chat y pasamos a “renderizado”
      setState("renderizado");
      setPlans([
        { id:5,  nombre:"Descargar carpeta", precio:5,  claim:"ZIP Next.js implementable 1-click" },
        { id:39, nombre:"Premium", precio:39, claim:"Carrito + pagos + IA de ventas" },
        { id:59, nombre:"Despertar a Pulse para siempre", precio:59, claim:"Hosting 1-click + editor + Pulse 24/7" },
      ]);

    }catch{
      if (!errored){
        setErrored(true);
        // Fallback: mostramos imagen de Pulse para no romper el momento y aún así ofrecer planes
        setPreviewUrl("/pulse/pulse-neutral-coffee-4k.png");
        setState("renderizado");
        setPlans([
          { id:5,  nombre:"Descargar carpeta", precio:5,  claim:"ZIP Next.js implementable 1-click" },
          { id:39, nombre:"Premium", precio:39, claim:"Carrito + pagos + IA de ventas" },
          { id:59, nombre:"Despertar a Pulse para siempre", precio:59, claim:"Hosting 1-click + editor + Pulse 24/7" },
        ]);
      }
    }finally{
      setLoading(false);
    }
  };

  const openCheckout = async (plan_id:number) => {
    try{
      const r = await fetch("/api/pulse-tools/checkout",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ plan_id, currency:"EUR", accept_legal: acceptLegal && activePlan===plan_id })
      }).then(r=>r.json());
      if (r?.checkout_url) window.open(r.checkout_url,"_blank");
      else say("assistant","Marca la casilla de términos para continuar.");
    }catch{
      say("assistant","No pude abrir checkout ahora mismo. Probemos de nuevo.");
    }
  };

  return (
    <div className="page">
      <Head><title>Chat con Pulse · V2</title></Head>
      <div className="wrap">
        <div className="grid">
          <aside className="left"><img src={PULSE_IMG} alt="Pulse con café"/></aside>

          <section className="right">
            <h1 className="h1">Chat con Pulse</h1>

            <div ref={chatRef} className="chat" aria-live="polite" aria-busy={loading}>
              {messages.map((m,i)=>(<div key={i} className={`msg ${m.role}`}>{m.content}</div>))}

              {loading && state!=="renderizado" && (
                <div className="msg assistant"><span className="loader"><img src={PULSE_IMG} alt="Cargando"/>Preparando…</span></div>
              )}

              {/* Bloque de IMAGEN + PLANES solo cuando ya hay imagen */}
              {state==="renderizado" && (
                <div className="actions" id="actions">
                  {previewUrl && (
                    <div className="card">
                      <strong>Imagen generada</strong>
                      <div style={{marginTop:8}}>
                        <img src={previewUrl} alt="Preview" style={{width:"100%",borderRadius:12,border:"1px solid rgba(56,189,248,.2)"}}/>
                      </div>
                    </div>
                  )}

                  <div className="card">
                    <strong>Tu web lista</strong>
                    <p style={{margin:"6px 0 10px",opacity:.9}}>Descarga la carpeta e impleméntala en 1-click.</p>

                    <div className="plans">
                      {plans?.map(p=>(
                        <div key={p.id} className={`plan ${p.id!==5?'premium':''}`}>
                          <div className="plan-h"><b>{p.nombre}</b> — {p.precio}€</div>
                          <div className="plan-s">{p.claim}</div>

                          {p.id===5 && (
                            <>
                              {zipUrl ? (
                                <a className="cta ping" href={zipUrl} download>Descargar carpeta (5€)</a>
                              ) : (
                                <button className="cta" disabled>Cargando ZIP…</button>
                              )}
                            </>
                          )}

                          {p.id!==5 && (
                            <>
                              <label className="legal">
                                <input type="checkbox" checked={activePlan===p.id && acceptLegal}
                                  onChange={(e)=>{ setActivePlan(p.id); setAcceptLegal(e.target.checked); }}/>
                                Acepto <a href="/pages/legal/privacy">Privacidad</a> y <a href="/pages/legal/terms">Términos</a>.
                              </label>
                              <button className="cta"
                                disabled={!(activePlan===p.id && acceptLegal)}
                                onClick={()=>openCheckout(p.id)}>
                                {p.nombre === "Premium" ? "Premium 39€" : "Despertar a Pulse 59€"}
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input del chat (si ya renderizamos, lo dejamos activo pero Pulse no hablará más) */}
            <div className="input">
              <input
                className="text"
                placeholder="Háblame como a un amigo, yo diseño tu web."
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); processIdea(input); }}}
              />
              <button className="send" onClick={()=>processIdea(input)}>Enviar</button>
            </div>
          </section>
        </div>

        <div className="foot">Tu web antes de que se te enfríe el café ☕⚡</div>
      </div>

      {/* Estilos ENCAPSULADOS (no tocan global) */}
      <style jsx>{`
        .page{ min-height:100vh; padding:24px; }
        .wrap{ max-width:1200px; margin:0 auto; }
        .grid{ display:grid; grid-template-columns: 380px 1fr; gap:24px; align-items:flex-start; }
        .left{ position:sticky; top:24px; }
        .left img{ width:100%; height:auto; max-width:360px; display:block; }
        .right{ display:flex; flex-direction:column; }
        .h1{ margin:0 0 8px; font-size:28px; font-weight:800; color:#E6F3FF; }

        .chat{ min-height:420px; max-height:60vh; overflow:auto; padding:12px;
          border:1px solid rgba(56,189,248,.2); border-radius:16px; background:rgba(2,8,15,.35);
          display:flex; flex-direction:column; }
        .msg{ margin:8px 0; padding:10px 12px; border-radius:14px; line-height:1.45; max-width:85%; }
        .msg.user{ align-self:flex-end; background:rgba(148,163,184,.18); color:#E6F3FF; }
        .msg.assistant{ align-self:flex-start; background:rgba(56,189,248,.12); border:1px solid rgba(56,189,248,.25); color:#DBEAFE; }
        .loader{ display:flex; align-items:center; gap:8px; }
        .loader img{ width:22px; height:22px; }

        .actions{ display:grid; gap:12px; margin-top:12px; }
        .card{ padding:12px; border:1px solid rgba(56,189,248,.2); border-radius:16px; background:rgba(2,8,15,.35); }
        .plans{ display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); }
        .plan{ padding:12px; border-radius:14px; border:1px solid rgba(56,189,248,.25); background:rgba(8,30,50,.35); }
        .plan.premium{ border-color: rgba(255,215,0,.45); }
        .plan-h{ font-weight:800; margin-bottom:6px; }
        .plan-s{ opacity:.9; margin-bottom:10px; }

        .legal{ display:flex; align-items:center; gap:8px; font-size:13px; opacity:.9; margin:4px 0 10px; }
        .legal a{ color:#9bd7ff; text-decoration:underline; }

        .cta{ display:inline-block; padding:10px 14px; border-radius:9999px; border:1px solid rgba(255,215,0,.7);
          background:linear-gradient(180deg,#FF9F45,#FFD700); color:#0A0A0A; font-weight:800; text-decoration:none; }
        .cta[disabled]{ opacity:.6; cursor:not-allowed; }
        .ping{ box-shadow:0 0 0 0 rgba(255,215,0,.7); animation:ping 0.9s ease-out 1; }
        @keyframes ping{ 0%{ box-shadow:0 0 0 0 rgba(255,215,0,.7);} 100%{ box-shadow:0 0 0 18px rgba(255,215,0,0);} }

        .input{ margin-top:12px; display:flex; gap:8px; }
        .text{ flex:1; padding:12px 14px; border-radius:14px; background:rgba(8,30,50,.35);
          border:1px solid rgba(56,189,248,.25); color:#E6F3FF; }
        .send{ padding:12px 16px; border-radius:14px; background:linear-gradient(180deg,#FF9F45,#FFD700);
          color:#0A0A0A; font-weight:800; border:0; cursor:pointer; }
        .foot{ margin-top:12px; color:#9ccff5; opacity:.8; font-size:12px; }

        @media (max-width: 980px){
          .grid{ grid-template-columns: 1fr; }
          .left{ position:static; }
          .left img{ max-width:280px; margin:0 auto; }
          .chat{ max-height:58vh; }
        }
      `}</style>
    </div>
  );
}
