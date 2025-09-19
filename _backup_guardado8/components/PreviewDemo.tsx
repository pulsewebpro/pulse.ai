import React from "react";

type Props = {
  sector?: string | null;
  title?: string;
  note?: string | null;
};

const palettes: Record<string, {badge:string; accent:string; emoji:string;}> = {
  cafeteria:   { badge:"#FF9F45", accent:"#FFD700", emoji:"☕" },
  restaurante: { badge:"#FF4D5A", accent:"#FFD700", emoji:"🍝" },
  ecommerce:   { badge:"#3DFF73", accent:"#FFD700", emoji:"🛒" },
  abogado:     { badge:"#38BDF8", accent:"#FFD700", emoji:"🔒" },
  hotel:       { badge:"#38BDF8", accent:"#FFD700", emoji:"🏨" },
  creativo:    { badge:"#38BDF8", accent:"#FFD700", emoji:"💎" }
};

export default function PreviewDemo({ sector, title, note }: Props){
  const theme = palettes[sector || "creativo"] || palettes.creativo;
  const heading = title?.trim() ? title.trim() : "Tu web lista para servir";
  const subtitle = note || "Hero potente, prueba social y CTA claro.";

  return (
    <div
      style={{
        borderRadius:18,
        border:"1px solid rgba(56,189,248,.18)",
        background:"linear-gradient(180deg, rgba(6,10,22,.85), rgba(2,6,20,.65))",
        boxShadow:"0 16px 60px rgba(0,0,0,.45)",
        padding:18,
        display:"grid",
        gap:12
      }}
      aria-label="Vista previa rápida de la web"
    >
      {/* Hero */}
      <div style={{
        borderRadius:14,
        padding:"16px 18px",
        background:"radial-gradient(900px 240px at 0% 0%, rgba(56,189,248,.12), transparent), rgba(3,7,18,.6)",
        border:"1px solid rgba(56,189,248,.18)"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:6}}>
          <span style={{
            display:"inline-block", padding:"6px 10px", borderRadius:999,
            background: theme.badge, color:"#0A0A0A", fontWeight:800, fontSize:12
          }}>
            {sector || "preview"}
          </span>
          <span style={{opacity:.8, fontSize:12}}>demo</span>
        </div>
        <h3 style={{margin:"4px 0 6px", color:"#E6F6FF", fontSize:20, fontWeight:900}}>
          {heading} {theme.emoji}
        </h3>
        <p style={{margin:0, color:"#C8E9FF", opacity:.9}}>{subtitle}</p>
        <div style={{display:"flex", gap:10, marginTop:12}}>
          <button style={{
            padding:"10px 14px", borderRadius:12, border:`1px solid ${theme.accent}`,
            background:`linear-gradient(180deg, ${theme.accent}, #FF9F45)`, color:"#0A0A0A",
            fontWeight:800
          }}>Comprar ahora</button>
          <button style={{
            padding:"10px 14px", borderRadius:12, border:"1px solid rgba(56,189,248,.35)",
            background:"rgba(56,189,248,.1)", color:"#E6F6FF", fontWeight:700
          }}>WhatsApp</button>
        </div>
      </div>

      {/* Grid / secciones */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12}}>
        {Array.from({length:3}).map((_,i)=>(
          <div key={i} style={{
            borderRadius:12, padding:12,
            background:"rgba(148,163,184,.08)",
            border:"1px solid rgba(148,163,184,.24)"
          }}>
            <div style={{height:80, borderRadius:8, background:"rgba(255,255,255,.06)", marginBottom:8}}/>
            <div style={{height:10, borderRadius:6, background:"rgba(255,255,255,.12)", marginBottom:6}}/>
            <div style={{height:10, borderRadius:6, background:"rgba(255,255,255,.12)", width:"60%"}}/>
          </div>
        ))}
      </div>
    </div>
  );
}
