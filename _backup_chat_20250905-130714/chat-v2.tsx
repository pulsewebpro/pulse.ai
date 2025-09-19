import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

type Intent = {
  sector: string; objetivo: string; estilo: string; idioma: "es"|"en"|"fr";
  h1: string; subtitle: string; sections: string[]; nombre?: string;
};
type Plan = { id:number; nombre:string; precio:number; claim:string };

const PULSE_IMG = "/pulse/pulse-neutral-coffee-4k.png";
const SECTORES = ["Cafetería","Abogado","Restaurante","E-commerce","Portfolio","Evento"];
const OBJETIVOS = ["Vender","Reservas","Leads","Portfolio"];

export default function ChatV2(){
  const [messages,setMessages] = useState<ChatMessage[]>([
    { role:"assistant", content:"Dime sector + objetivo y te sirvo tu web. Ej: Cafetería · Reservas ☕⚡" }
  ]);
  const [input,setInput] = useState("");
  const [userHasSpoken, setUserHasSpoken] = useState(false);

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
    [messages,loading,previewUrl,zipUrl,plans]);

  // Helpers
  const say = (role:Role, content:string) => setMessages(prev=>[...prev,{ role, content }]);

  // Skeleton inmediato (optimista)
  const showSkeleton = () => {
    setLoading(true); setErrored(false);
    say("assistant", "Venga, te lo sirvo caliente. Preparando tu preview… ☕⚡");
  };

  const processIdea = async (raw: string) => {
    const text = raw.trim();
    if(!text) return;
    setUserHasSpoken(true);
    say("user", text);
    setInput("");
    showSkeleton();

    try{
      // 1) Intent SIEMPRE (soft)
      const det = await fetch("/api/pulse-tools/local-intent",{
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ text })
      }).then(r=>r.json());
      const it: Intent = det.intent; setIntent(it);
      if (it?.nombre) localStorage.setItem("pulse_name", it.nombre);

      const nombre = it?.nombre || localStorage.getItem("pulse_name") || "amiga";
      const alt1 = it.estilo === "Minimal" ? "Premium cálido" : "Minimal";
      const alt2 = it.estilo === "Tech" ? "Editorial" : "Tech";
      const pitch =
        `${nombre}, asumo estilo **${it.estilo}** (lo cambio si quieres).\n\n` +
        `**Propuesta**\n• H1: ${it.h1}\n• Subtítulo: ${it.subtitle}\n• Secciones: ${it.sections.join(" · ")}\n• CTA: "Diseñar mi web"\n\n` +
        `**Variante A (${alt1})** — más limpio y social.\n` +
        `**Variante B (${alt2})** — hero técnico con bullets.`;
      say("assistant", pitch);

      // 2) Generar preview (inyectar cuando esté listo)
      const pv = await fetch("/api/pulse-tools/create-preview",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          sector: it.sector, objetivo: it.objetivo, estilo: it.estilo, idioma: it.idioma,
          titulo: it.h1, subtitulo: it.subtitle, colorway: "cyan"
        })
      }).then(r=>r.json());
      setPreviewUrl(pv?.url || "/pulse/pulse-neutral-coffee-4k.png");

      // 3) ZIP descargable
      const z = await fetch("/api/pulse-tools/generate-zip",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          sector: it.sector, objetivo: it.objetivo, idioma: it.idioma, brand:"Pulse Demo",
          h1: it.h1, subtitle: it.subtitle, sections: it.sections
        })
      }).then(r=>r.json());
      setZipUrl(z?.url || null);

      // 4) Planes visibles
      setPlans([
        { id:5,  nombre:"Descargar", precio:5,  claim:"ZIP Next.js listo" },
        { id:39, nombre:"Expansión", precio:39, claim:"E-commerce + pagos + IA ventas" },
        { id:59, nombre:"Diamante 💎", precio:59, claim:"Hosting 1-click + editor + Pulse 24/7" },
      ]);
      say("assistant","Te dejé el preview y la descarga debajo. Si quieres carrito y pagos, mira los planes. ☕⚡");
    }catch{
      if (!errored){
        setErrored(true);
        // Fallback amable: demo estática + CTAs
        setPreviewUrl("/pulse/pulse-neutral-coffee-4k.png");
        setPlans([
          { id:5,  nombre:"Descargar", precio:5,  claim:"ZIP Next.js listo" },
          { id:39, nombre:"Expansión", precio:39, claim:"E-commerce + pagos + IA ventas" },
          { id:59, nombre:"Diamante 💎", precio:59, claim:"Hosting 1-click + editor + Pulse 24/7" },
        ]);
        say("assistant","Pequeño bache de red, pero no te dejo sin demo. Mira debajo y eliges. ☕💪");
      }
    }finally{
      setLoading(false);
    }
  };

  const showChips = useMemo(()=>!userHasSpoken, [userHasSpoken]);

  const openCheckout = async (plan_id:number) => {
    try{
      const r = await fetch("/api/pulse-tools/checkout",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ plan_id, currency:"EUR", accept_legal: acceptLegal && activePlan===plan_id })
      }).then(r=>r.json());
      if (r?.checkout_url) window.open(r.checkout_url,"_blank");
      else say("assistant","Marca la casilla de términos y le damos caña.");
    }catch{
      say("assistant","No pude abrir checkout ahora mismo. Probemos de nuevo.");
    }
  };

  return (
    <div className="pulsev2-page">
      <Head><title>Chat con Pulse · V2</title></Head>
      <div className="pulsev2-wrap">
        <div className="pulsev2-grid">
          <aside className="pulsev2-left"><img src={PULSE_IMG} alt="Pulse con café"/></aside>

          <section className="pulsev2-right">
            <h1 className="pulsev2-h1">Chat con Pulse</h1>

            {showChips && (
              <div className="pulsev2-chips" aria-label="Atajos rápidos">
                {SECTORES.map(s => (
                  <button key={s} className="pulsev2-chip" onClick={()=>processIdea(`${s} · ${OBJETIVOS[0]}`)}>{s}</button>
                ))}
                {OBJETIVOS.map(g => (
                  <button key={g} className="pulsev2-chip" onClick={()=>processIdea(`E-commerce · ${g}`)}>{g}</button>
                ))}
              </div>
            )}

            <div ref={chatRef} className="pulsev2-chat">
              {messages.map((m,i)=>(<div key={i} className={`pulsev2-msg ${m.role}`}>{m.content}</div>))}

              {loading && (
                <div className="pulsev2-msg assistant">
                  <span className="pulsev2-loader"><img src={PULSE_IMG} alt="Cargando" />Preparando tu preview…</span>
                </div>
              )}

              {(previewUrl || zipUrl || plans) && (
                <div className="pulsev2-actions">
                  {previewUrl && (
                    <div className="pulsev2-card">
                      <strong>Preview generado</strong>
                      <div style={{marginTop:8}}>
                        <img src={previewUrl} alt="Preview" style={{width:"100%",borderRadius:12,border:"1px solid rgba(56,189,248,.2)"}}/>
                      </div>
                    </div>
                  )}

                  {zipUrl && (
                    <div className="pulsev2-card">
                      <strong>Tu web lista para descargar</strong>
                      <p style={{margin:"6px 0 10px",opacity:.9}}>Incluye: Next.js 14, páginas mínimas, legales y SEO base.</p>
                      <a className="pulsev2-cta" href={zipUrl} download>Descargar carpeta (5€)</a>
                    </div>
                  )}

                  {plans && (
                    <div className="pulsev2-card">
                      <strong>Planes</strong>
                      <ul style={{margin:"6px 0 12px",paddingLeft:18,opacity:.9}}>
                        <li><b>39€</b> — e-commerce, pagos, IA de ventas</li>
                        <li><b>59€</b> — hosting 1-click, editor fácil y Pulse 24/7</li>
                      </ul>
                      <div className="pulsev2-planrow">
                        {plans.filter(p=>p.id!==5).map(p=>(
                          <div key={p.id} className="pulsev2-plan">
                            <div style={{fontWeight:800, marginBottom:6}}>{p.nombre} — {p.precio}€</div>
                            <div style={{opacity:.9, marginBottom:10}}>{p.claim}</div>
                            <label className="pulsev2-legal">
                              <input type="checkbox" checked={acceptLegal && activePlan===p.id}
                                onChange={(e)=>{ setActivePlan(p.id); setAcceptLegal(e.target.checked); }}/>
                              Acepto <a href="/pages/legal/privacy">Privacidad</a> y <a href="/pages/legal/terms">Términos</a>.
                            </label>
                            <button className="pulsev2-cta" disabled={!(acceptLegal && activePlan===p.id)} onClick={()=>openCheckout(p.id)}>Pagar ahora</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pulsev2-input">
              <input className="pulsev2-text" placeholder="Ej: Cafetería · Reservas"
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); processIdea(input); }}}/>
              <button className="pulsev2-send" onClick={()=>processIdea(input)}>Enviar</button>
            </div>
          </section>
        </div>

        <div className="pulsev2-foot">Tu web antes de que se te enfríe el café ☕⚡</div>
      </div>

      <style jsx>{`
        .pulsev2-page{ min-height:100vh; padding:24px; }
        .pulsev2-wrap{ max-width:1200px; margin:0 auto; }
        .pulsev2-grid{ display:grid; grid-template-columns: 380px 1fr; gap:24px; align-items:flex-start; }
        .pulsev2-left{ position:sticky; top:24px; }
        .pulsev2-left img{ width:100%; height:auto; max-width:360px; display:block; }
        .pulsev2-right{ display:flex; flex-direction:column; }
        .pulsev2-h1{ margin:0 0 8px; font-size:28px; font-weight:800; color:#E6F3FF; }
        .pulsev2-chips{ display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 12px; }
        .pulsev2-chip{ padding:6px 10px; border-radius:9999px; border:1px solid rgba(56,189,248,.25); background:rgba(8,30,50,.35); color:#CFE8FF; cursor:pointer; font-weight:600; }
        .pulsev2-chat{ min-height:420px; max-height:540px; overflow:auto; padding:12px; border:1px solid rgba(56,189,248,.2); border-radius:16px; background:rgba(2,8,15,.35); display:flex; flex-direction:column; }
        .pulsev2-msg{ margin:8px 0; padding:10px 12px; border-radius:14px; line-height:1.45; max-width:85%; }
        .pulsev2-msg.user{ align-self:flex-end; background:rgba(148,163,184,.18); color:#E6F3FF; }
        .pulsev2-msg.assistant{ align-self:flex-start; background:rgba(56,189,248,.12); border:1px solid rgba(56,189,248,.25); color:#DBEAFE; }
        .pulsev2-loader{ display:flex; align-items:center; gap:8px; }
        .pulsev2-loader img{ width:22px; height:22px; }
        .pulsev2-actions{ display:grid; gap:12px; margin-top:12px; }
        .pulsev2-card{ padding:12px; border:1px solid rgba(56,189,248,.2); border-radius:16px; background:rgba(2,8,15,.35); }
        .pulsev2-cta{ display:inline-block; padding:10px 14px; border-radius:9999px; border:1px solid rgba(255,215,0,.7); background:linear-gradient(180deg,#FF9F45,#FFD700); color:#0A0A0A; font-weight:800; text-decoration:none; }
        .pulsev2-planrow{ display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); }
        .pulsev2-plan{ padding:12px; border-radius:14px; border:1px solid rgba(56,189,248,.25); background:rgba(8,30,50,.35); }
        .pulsev2-legal{ display:flex; align-items:center; gap:8px; font-size:13px; opacity:.9; margin:4px 0 10px; }
        .pulsev2-legal a{ color:#9bd7ff; text-decoration:underline; }
        .pulsev2-input{ margin-top:12px; display:flex; gap:8px; }
        .pulsev2-text{ flex:1; padding:12px 14px; border-radius:14px; background:rgba(8,30,50,.35); border:1px solid rgba(56,189,248,.25); color:#E6F3FF; }
        .pulsev2-send{ padding:12px 16px; border-radius:14px; background:linear-gradient(180deg,#FF9F45,#FFD700); color:#0A0A0A; font-weight:800; border:0; cursor:pointer; }
        .pulsev2-foot{ margin-top:12px; color:#9ccff5; opacity:.8; font-size:12px; }
        @media (max-width: 980px){ .pulsev2-grid{ grid-template-columns: 1fr; } .pulsev2-left{ position:static; } .pulsev2-left img{ max-width:280px; margin:0 auto; } .pulsev2-chat{ max-height:60vh; } }
      `}</style>
    </div>
  );
}
