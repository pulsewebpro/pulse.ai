import React, { useState } from "react";
import Head from "next/head";
import PreviewPane from "@/components/PreviewPane";

export default function PulseDJ() {
  const [sector, setSector] = useState("saas");
  const [ciudad, setCiudad] = useState("Madrid");
  const [idioma, setIdioma] = useState("es");
  const [previewData, setPreviewData] = useState<any>(null);

  async function generatePreview(brief: any) {
    try {
      const r = await fetch("/api/pulse-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief })
      });
      const j = await r.json();
      if (j?.ok) setPreviewData(j);
    } catch (e) { console.error("preview error", e); }
  }

  return (
    <>
      <Head><title>Pulse DJ · Preview</title></Head>
      <div style={{display:"flex",gap:16, padding:16}}>
        <div style={{flex:1, minWidth:320, display:"flex", flexDirection:"column", gap:12}}>
          <h2 style={{margin:0}}>Pulse DJ · Selector rápido</h2>

          <label>Sector</label>
          <select value={sector} onChange={e=>setSector(e.target.value)}>
            <option value="saas">SaaS</option>
            <option value="restaurant">Restaurante</option>
            <option value="portfolio">Portfolio</option>
            <option value="ecommerce">E-Commerce</option>
            <option value="blog">Blog</option>
          </select>

          <label>Ciudad</label>
          <input value={ciudad} onChange={e=>setCiudad(e.target.value)} placeholder="Ciudad" />

          <label>Idioma</label>
          <select value={idioma} onChange={e=>setIdioma(e.target.value)}>
            <option value="es">ES</option>
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>

          <button
            onClick={()=> generatePreview({ sector, ciudad, idioma, tags:["minimal","rapido"] })}
            style={{padding:"10px 14px", borderRadius:10, border:"1px solid #fff2", cursor:"pointer", marginTop:8}}
          >
            Generar preview
          </button>

          <p style={{opacity:.7, fontSize:12}}>
            Ruta de template debe existir en /public/templates/*.html (según tu manifest).
          </p>
        </div>

        <PreviewPane data={previewData} />
      </div>
    </>
  );
}
