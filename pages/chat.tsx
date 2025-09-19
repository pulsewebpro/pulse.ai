// PULSE_PREVIEW_EMBED_START
import dynamic from "next/dynamic";
const PreviewEmbed = dynamic(() => import("@/components/PreviewEmbed"), { ssr: false });
// PULSE_PREVIEW_EMBED_END

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { pulseBrand } from "@/lib/pulse/persona";
import { getPulseResponse, PulseIntent } from "@/lib/pulse/pulse-playbook";

// Simulación de memoria premium (persistente si el plan está activo)
function loadPremiumMemory() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("pulse-premium-mem") || "null"); }
  catch { return null; }
}
function savePremiumMemory(mem: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("pulse-premium-mem", JSON.stringify(mem));
}

// Chips de intención (sanos, sin onClick aquí)
const chips: { icon: string; label: string; goal: PulseIntent; text: string }[] = [
  { icon:"🛒", label:"VENTAS",               goal:"ventas",   text:"Quiero poner mis productos online rápido." },
  { icon:"📅", label:"GENERADOR RESERVAS",   goal:"reservas", text:"Necesito que reserven mesa/cita sin llamar." },
  { icon:"✍️", label:"Blog / Contenido",     goal:"blog",     text:"Para escritores, periodistas, community managers." },
  { icon:"🎥", label:"Influencer / Creador", goal:"influencer", text:"Soy tiktoker/streamer y quiero centralizar mis links/brand." },
  { icon:"🌱", label:"Proyecto social",      goal:"default",  text:"ONG local con donaciones sencillas y voluntariado." },
];

// Intent seguro (sin “social” en tipo)
const detectIntent = (t:string):PulseIntent => {
  const s=t.toLowerCase();
  if(/venta|tienda|producto/.test(s)) return "ventas";
  if(/reserva|cita|booking/.test(s)) return "reservas";
  if(/blog|contenido|post/.test(s)) return "blog";
  if(/influencer|tiktok|youtube|twitch|instagram/.test(s)) return "influencer";
  if(/social|ong|comunidad|activismo/.test(s)) return "default";
  return "default";
};

export default function ChatPage(){
  const [isReady,setIsReady]=useState(false);
  const [premium,setPremium]=useState(false);
  const [mem,setMem]=useState<any>(null);
  const [messages,setMessages]=useState<{role:"pulse"|"user";text:string;ts:number}[]>([]);
  const [idea,setIdea]=useState("");
  const [typing,setTyping]=useState(false);
  const [turn,setTurn]=useState(0);
  const listRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    setIsReady(true);
    if(premium){
      const prev=loadPremiumMemory();
      if(prev) setMem(prev);
    }
    setMessages([{
      role:"pulse",
      text:`Estoy contigo. Háblame de tu web o negocio. ${pulseBrand.claim}`,
      ts:Date.now()
    }]);
  },[premium]);

  useEffect(()=>{ if(premium && mem) savePremiumMemory(mem); },[premium,mem]);

  useEffect(()=>{ listRef.current?.scrollTo({top:listRef.current.scrollHeight,behavior:"smooth"}); },[messages.length,typing]);

  const pushPulse = (text:string)=> setMessages(m=>[...m,{role:"pulse",text,ts:Date.now()}]);
  const pushUser  = (text:string)=> setMessages(m=>[...m,{role:"user", text,ts:Date.now()}]);

  const respond = async (userText:string, intent?:PulseIntent) => {
    const goal = intent ?? detectIntent(userText);
    setTyping(true);
    await new Promise(r=>setTimeout(r, 300+Math.random()*400));
    setTurn(t=>t+1);
    let reply = getPulseResponse(goal,userText,turn);
    if(premium && mem){
      if(goal==="ventas"){ reply += " 💡 Idea: podemos añadir upsells (ej. complementos) para aumentar ticket medio."; }
      if(goal==="blog"){ reply += " 💡 Idea: newsletter automática para fidelizar comunidad."; }
      if(goal==="influencer"){ reply += " 💡 Idea: sección merch o cursos premium para monetizar más."; }
    }
    pushPulse(reply);
    setTyping(false);
    if(premium){ setMem({...mem, lastGoal:goal, lastMsg:userText}); }
  };

  const send = async ()=>{ const text=idea.trim(); if(!text) return; pushUser(text); setIdea(""); await respond(text); };
  const onEnter=async(e:React.KeyboardEvent<HTMLInputElement>)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); await send(); } };

  const onChip=async(idx:number)=>{ const pick=chips[idx]; setIdea(pick.text); pushUser(pick.text); await respond(pick.text,pick.goal); };

  if(!isReady){ return <div className="chat-panel">Cargando chat… ☕⚡</div>; }

  return (
    <>
      <Head><title>Chat con Pulse ☕⚡</title></Head>

      <div className="chat-layout">
        <div className="pulse-avatar">
          <img src="/pulse/pulse-neutral-coffee-4k.png" alt="Pulse pensando" loading="eager"/>
          <div className="bubble">{mem?.name ? `Pensando en ${mem.name}…` : "Estoy pensando tu mejor versión…"}</div>
        </div>

        <section className="chat-panel" aria-label="Chat con Pulse">
          <h1>Chat con Pulse</h1>
          <div className="messages" ref={listRef} role="log" aria-live="polite" aria-relevant="additions text">
            {messages.map((m,i)=>(
              <div key={i}
                className={m.role==="pulse"?"chat-bubble-pulse":"chat-bubble-user"}
                style={m.role==="user"?{marginLeft:"auto"}:undefined}
                dangerouslySetInnerHTML={{__html:m.text}}
              />
            ))}
            {typing && <div className="chat-bubble-pulse">Pensando…</div>}
          </div>

          <div className="input-row">
            <input
              className="chat-input"
              placeholder="Cuéntame tu idea ☕⚡ (Enter = enviar)"
              value={idea} onChange={(e)=>setIdea(e.target.value)} onKeyDown={onEnter}
            />
            <button className="chat-button" onClick={send} disabled={!idea.trim()}>Enviar</button>
          </div>
        </section>

        <aside className="generator-card">
          <h2>Generador en vivo ☕⚡</h2>
          <div className="chips-grid">
            {chips.map((chip,idx)=>(
              <button key={idx} className="chip-button" onClick={()=>onChip(idx)}>
                <span className="chip-emoji">{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          <div className="preview-box">
            {premium ? (
              <span>Preview premium: {mem?.lastGoal==="ventas" ? "Tienda con upsells" : "Tu web personalizada"} ☕⚡</span>
            ) : (<span className="opacity-80"></span>)}

            {/* PULSE_PREVIEW_EMBED_MOUNT_START */}
            <PreviewEmbed initialQuery="Landing demo de Pulse" height={560} />
            {/* PULSE_PREVIEW_EMBED_MOUNT_END */}
          </div>

          <div className="premium-toggle">
            <button onClick={()=>setPremium(!premium)}>
              {premium ? "🔓 Premium activado" : "🔒 Activar Premium"}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
