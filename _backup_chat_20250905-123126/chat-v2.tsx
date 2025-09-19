import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import "../styles/pulse-chat-v2.css";
import type { ChatMessage } from "../lib/pulse_v2/types";
import { parseAssistant } from "../lib/pulse_v2/actions";

type Plan = { id:number; nombre:string; precio:number; claim:string };
const PULSE_IMG = "/public/pulse/pulse-neutral-coffee-4k.png".replace("/public","");

const sectors = ["Cafetería","Abogado","Restaurante","E-commerce","Portfolio","Evento"];
const goals = ["Vender","Reservas","Leads","Portfolio"];
const styles = ["Minimal","Premium cálido","Tech","Retro","Editorial"];

export default function ChatV2() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Antes de que se te enfríe la taza, tu web va a estar lista. Dime sector + objetivo y te sirvo el preview ☕⚡" }
  ]);
  const [input, setInput] = useState("");
  const [locale] = useState<"es"|"en"|"fr">("es");
  const [isLoading, setIsLoading] = useState(false);
  const [lastPlans, setLastPlans] = useState<Plan[]|null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior:"smooth" }); }, [messages, isLoading]);

  const ask = async (text: string) => {
    const user: ChatMessage = { role: "user", content: text.trim() };
    if (!user.content) return;
    setMessages(prev => [...prev, user]);
    setIsLoading(true);
    try {
      const res = await fetch("/api/pulse-v2", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ messages: [...messages, user], locale })
      });
      const data = await res.json();
      const parsed = parseAssistant(String(data.content || ""));
      // pinta texto
      setMessages(prev => [...prev, { role:"assistant", content: parsed.text || "¿Te preparo el preview? ☕" }]);
      // procesa acciones
      handleActions(parsed);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content: "Se me derramó el café ☕💦. Repite tu idea y lo arreglo." }]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleActions = (parsed: ReturnType<typeof parseAssistant>) => {
    let plans: Plan[]|null = null;
    parsed.actions.forEach(a => {
      if (a.type === "OFFER_PLANS") {
        plans = (a.payload?.planes || []).slice(0,3);
      }
    });
    setLastPlans(plans);
  };

  const quickAsk = (txt: string) => ask(txt);

  const showQuick = useMemo(()=>{
    const last = messages[messages.length-1]?.content.toLowerCase();
    return /hola|que|qué|\?$/.test(last || "");
  }, [messages]);

  return (
    <div className="pulsev2-page">
      <Head><title>Chat con Pulse · V2</title></Head>
      <div className="pulsev2-wrap">
        <div className="pulsev2-grid">
          <div className="pulsev2-left">
            <img src={PULSE_IMG} alt="Pulse con café" />
          </div>
          <div className="pulsev2-right">
            <h1 className="pulsev2-h1">Chat con Pulse</h1>

            {showQuick && (
              <div className="pulsev2-chips" aria-label="Atajos rápidos">
                {sectors.map(s => (
                  <button key={s} className="pulsev2-chip" onClick={()=>quickAsk(`Sector: ${s}. Objetivo: ${goals[0]}. Estilo: ${styles[1]}.`)}>
                    {s}
                  </button>
                ))}
                {goals.map(g => (
                  <button key={g} className="pulsev2-chip" onClick={()=>quickAsk(`Objetivo: ${g}. Sector: E-commerce.`)}>{g}</button>
                ))}
              </div>
            )}

            <div ref={chatRef} className="pulsev2-chat">
              {messages.map((m, i)=>(
                <div key={i} className={`pulsev2-msg ${m.role}`}>
                  {m.content}
                </div>
              ))}

              {isLoading && (
                <div className="pulsev2-msg assistant">
                  <span className="pulsev2-loader">
                    <img src={PULSE_IMG} alt="Cargando" />
                    Preparando tu preview…
                  </span>
                </div>
              )}

              {/* Render de planes si los hay */}
              {lastPlans && (
                <div className="pulsev2-actions">
                  <div className="pulsev2-card">
                    <strong>Planes disponibles</strong>
                    <div className="pulsev2-planrow">
                      {lastPlans.map(p=>(
                        <div key={p.id} className="pulsev2-plan">
                          <div style={{fontWeight:800, marginBottom:6}}>{p.nombre} — {p.precio}€</div>
                          <div style={{opacity:.9}}>{p.claim}</div>
                          <button className="pulsev2-cta" onClick={()=>{
                            setMessages(prev=>[...prev, {role:"assistant", content:`Perfecto. Abrimos checkout del plan ${p.nombre}. Acepta legal y seguimos ☕⚡`}]);
                          }}>Elegir</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pulsev2-input">
              <input
                className="pulsev2-text"
                placeholder="Ej: E-commerce de coleccionables con checkout rápido y WhatsApp"
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              />
              <button className="pulsev2-send" onClick={()=>ask(input)}>Enviar</button>
            </div>
          </div>
        </div>
        <div style={{marginTop:12, color:"#9ccff5", opacity:.8, fontSize:12}}>
          Tu web antes de que se te enfríe el café ☕⚡
        </div>
      </div>
    </div>
  );
}
