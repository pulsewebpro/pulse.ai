import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

type Intent = {
  sector: string; objetivo: string; estilo: string; idioma: "es"|"en"|"fr";
  h1: string; subtitle: string; sections: string[];
};
type Plan = { id:number; nombre:string; precio:number; claim:string };

const PULSE_IMG = "/pulse/pulse-neutral-coffee-4k.png";
const SECTORES = ["Cafetería","Abogado","Restaurante","E-commerce","Portfolio","Evento"];
const OBJETIVOS = ["Vender","Reservas","Leads","Portfolio"];

export default function ChatV2(){
  // Mensaje inicial MUY corto (on-ramp)
  const [messages,setMessages] = useState<ChatMessage[]>([
    { role:"assistant", content:"Dime sector + objetivo y te sirvo tu web. Ej: Cafetería · Reservas ☕⚡" }
  ]);
  const [input,setInput] = useState("");
  const [userHasSpoken, setUserHasSpoken] = useState(false);

  // Estados de orquestación
  const [intent,setIntent] = useState<Intent|null>(null);
  const [previewUrl,setPreviewUrl] = useState<string|null>(null);
  const [zipUrl,setZipUrl] = useState<string|null>(null);
  const [plans,setPlans] = useState<Plan[]|null>(null);
  const [loading,setLoading] = useState(false);

  // Legal inline para 39/59
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [activePlan, setActivePlan] = useState<number|null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ chatRef.current?.scrollTo({top:chatRef.current.scrollHeight, behavior:"smooth"}); },
    [messages,loading,previewUrl,zipUrl,plans]);

  // === Helpers ===
  const say = (role:Role, content:string) => setMessages(prev=>[...prev,{ role, content }]);

  //  INTENCIÓN → PROPUESTA (≤3s)  + ACCIÓN AUTOMÁTICA (≤8s)
  const processIdea = async (raw: string) => {
    setUserHasSpoken(true);
    say("user", raw.trim());
    setInput(""); setLoading(true);

    try{
      // 1) Intención (local, sin IA)
      const det = await fetch("/api/pulse-tools/local-intent",{
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ text: raw })
      }).then(r=>r.json());
      const it: Intent = det.intent; setIntent(it);

      // 2) Propuesta 1 + 2 variantes, tono humano
      const alt1 = it.estilo === "Minimal" ? "Premium cálido" : "Minimal";
      const alt2 = it.estilo === "Tech" ? "Editorial" : "Tech";
      const pitch =
        `Asumo estilo **premium cálido** (lo cambiamos si quieres).\n\n` +
        `**Propuesta**\n• H1: ${it.h1}\n• Subtítulo: ${it.subtitle}\n• Secciones: ${it.sections.join(" · ")}\n• CTA: "Diseñar mi web"\n\n` +
        `**Variante A (${alt1})** — más limpio y social arriba.\n` +
        `**Variante B (${alt2})** — hero técnico con bullets.`;
      say("assistant", pitch);

      // 3) Generación automática: Preview PNG (inyecta al hilo)
      const pv = await fetch("/api/pulse-tools/create-preview",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          sector: it.sector, objetivo: it.objetivo, estilo: it.estilo, idioma: it.idioma,
          titulo: it.h1, subtitulo: it.subtitle, colorway: "cyan"
        })
      }).then(r=>r.json());
      if (pv?.url) setPreviewUrl(pv.url);

      // 4) Generación automática: ZIP Next.js descargable (5€)
      const z = await fetch("/api/pulse-tools/generate-zip",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          sector: it.sector, objetivo: it.objetivo, idioma: it.idioma, brand:"Pulse Demo",
          h1: it.h1, subtitle: it.subtitle, sections: it.sections
        })
      }).then(r=>r.json());
      if (z?.url) setZipUrl(z.url);

      // 5) Planes bajo el bloque de demo
      setPlans([
        { id:5,  nombre:"Descargar", precio:5,  claim:"ZIP Next.js listo" },
        { id:39, nombre:"Expansión", precio:39, claim:"E-commerce + pagos + IA ventas" },
        { id:59, nombre:"Diamante 💎", precio:59, claim:"Hosting 1-click + editor + Pulse 24/7" },
      ]);
      say("assistant","Te preparé el preview y la descarga. Mira debajo ☕⚡");

    }catch(e){
      say("assistant","Se me derramó el café ☕💦. Repite tu idea y lo arreglo.");
    }finally{
      setLoading(false);
    }
  };

  // Chips visibles hasta que el usuario hable
  const showChips = useMemo(()=>!userHasSpoken, [userHasSpoken]);

  // Checkout simulado 39/59 con legal inline
  const openCheckout = async (plan_id:number) => {
    try{
      const r = await fetch("/api/pulse-tools/checkout",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ plan_id, currency:"EUR", accept_legal: acceptLegal })
      }).then(r=>r.json());
      if (r?.checkout_url) {
        window.open(r.checkout_url, "_blank");
        say("assistant", `Checkout preparado para plan ${plan_id}. ¡Vamos allá!`);
      } else {
        say("assistant","No pude abrir el checkout. ¿Aceptaste los términos?");
      }
    }catch{
      say("assistant","Algo falló al abrir el checkout. Probemos otra vez.");
    }
  };

  return (
    <div className="pulsev2-page">
      <Head><title>Chat con Pulse · V2</title></Head>
      <div className="pulsev2-wrap">
        <div className="pulsev2-grid">
          <div className="pulsev2-left"><img src={PULSE_IMG} alt="Pulse con café" /></div>

          <div className="pulsev2-right">
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
                  <span className="pulsev2-loader">
                    <img src={PULSE_IMG} alt="Cargando" />Preparando tu preview…
                  </span>
                </div>
              )}

              {(previewUrl || zipUrl || plans) && (
                <div className="pulsev2-actions">
                  {/* Demo automática */}
                  {previewUrl && (
                    <div className="pulsev2-card">
                      <strong>Preview generado</strong>
                      <div style={{marginTop:8}}>
                        <img src={previewUrl} alt="Preview" style={{width:"100%",borderRadius:12,border:"1px solid rgba(56,189,248,.2)"}}/>
                      </div>
                    </div>
                  )}

                  {/* Descarga ZIP (5€) */}
                  {zipUrl && (
                    <div className="pulsev2-card">
                      <strong>Tu web lista para descargar</strong>
                      <p style={{margin:"6px 0 10px",opacity:.9}}>Incluye: Next.js 14, páginas mínimas, legales y SEO base.</p>
                      <a className="pulsev2-cta" href={zipUrl} download>Descargar carpeta (5€)</a>
                    </div>
                  )}

                  {/* Planes 39 / 59 con legal inline */}
                  {plans && (
                    <div className="pulsev2-card">
                      <strong>Planes</strong>
                      <ul style={{margin:"6px 0 12px",paddingLeft:18,opacity:.9}}>
                        <li><b>39€</b> — e-commerce, pagos, IA de ventas</li>
                        <li><b>59€</b> — hosting 1-click, editor fácil y Pulse 24/7</li>
                      </ul>

                      <div className="pulsev2-planrow">
                        {plans.filter(p=>p.id!==5).map(p=>(
                          <div key={p.id} className="pulsev2-plan" style={{position:"relative"}}>
                            <div style={{fontWeight:800, marginBottom:6}}>{p.nombre} — {p.precio}€</div>
                            <div style={{opacity:.9, marginBottom:10}}>{p.claim}</div>

                            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,opacity:.9,marginBottom:8}}>
                              <input type="checkbox" checked={acceptLegal && activePlan===p.id}
                                     onChange={(e)=>{ setActivePlan(p.id); setAcceptLegal(e.target.checked); }} />
                              Acepto <a href="/pages/legal/privacy" style={{textDecoration:"underline",color:"#9bd7ff"}}>Privacidad</a> y <a href="/pages/legal/terms" style={{textDecoration:"underline",color:"#9bd7ff"}}>Términos</a>.
                            </label>

                            <button
                              className="pulsev2-cta"
                              disabled={!(acceptLegal && activePlan===p.id)}
                              onClick={()=>openCheckout(p.id)}
                              aria-disabled={!(acceptLegal && activePlan===p.id)}
                            >
                              Pagar ahora
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pulsev2-input">
              <input
                className="pulsev2-text"
                placeholder="Ej: Cafetería · Reservas"
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); processIdea(input); }}}
              />
              <button className="pulsev2-send" onClick={()=>processIdea(input)}>Enviar</button>
            </div>
          </div>
        </div>
        <div style={{marginTop:12,color:"#9ccff5",opacity:.8,fontSize:12}}>Tu web antes de que se te enfríe el café ☕⚡</div>
      </div>
    </div>
  );
}
