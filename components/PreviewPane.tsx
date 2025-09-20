import React from "react";

type Props = {
  data?: {
    selection?: { previewUrl: string; name: string; palette: string[]; reason?: string };
    copy?: { title: string; subtitle?: string; cta?: string };
  } | null;
};

export default function PreviewPane({ data }: Props) {
  const url = data?.selection?.previewUrl;
  const name = data?.selection?.name || "Preview";
  const palette = data?.selection?.palette || [];

  return (
    <aside style={{width:"50%", minWidth:420, borderLeft:"1px solid rgba(255,255,255,0.08)", padding:"12px", display:"flex", flexDirection:"column", gap:12}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h3 style={{margin:0, fontWeight:700}}>{name}</h3>
        {!!palette.length && (
          <div style={{display:"flex", gap:6}}>
            {palette.map((c,i)=>(
              <span key={i} title={c} style={{width:18, height:18, borderRadius:6, border:"1px solid #0003", background:c}}/>
            ))}
          </div>
        )}
      </div>

      {!url ? (
        <div style={{padding:16, border:"1px dashed #8884", borderRadius:12}}>
          <b>Sin preview todavía.</b> Elige un sector/chip o envía un brief y generaré una propuesta.
        </div>
      ) : (
        <iframe
          title="Pulse Preview"
          src={url}
          style={{width:"100%", height:"70vh", border:"1px solid #0002", borderRadius:12}}
        />
      )}

      {data?.copy && (
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          <div style={{opacity:.8}}>{data.copy.subtitle}</div>
          <button
            aria-label="Abrir propuesta"
            onClick={()=> url && window.open(url, "_blank")}
            style={{padding:"10px 14px", borderRadius:10, border:"1px solid #fff2", cursor:"pointer"}}
          >
            {data.copy.cta || "Abrir"}
          </button>
        </div>
      )}
    </aside>
  );
}
