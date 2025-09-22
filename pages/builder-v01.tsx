import React,{useState} from "react"; import Head from "next/head";
import { Watermark, SectionHero, SectionFeatures, SectionGallery, SectionCTA, SectionFooter } from "@/lib/pulsekit/blocks.v01";
type GenRes = import("@/lib/pulsekit/generator.v01").GenResponse;
export default function BuilderV01(){
  const [prompt,setPrompt]=useState("Restaurante bistró moderno en Madrid");
  const [data,setData]=useState<GenRes|null>(null); const [loading,setLoading]=useState(false);
  const plan=(process.env.NEXT_PUBLIC_PULSE_PLAN||process.env.PULSE_PLAN||"demo") as "demo"|"expansion"|"diamond";
  const watermarkOn=(process.env.NEXT_PUBLIC_PULSE_WATERMARK||process.env.PULSE_WATERMARK||"on")==="on";
  const watermarkEnabled = plan==="demo"?watermarkOn:false;
  async function go(){setLoading(true); const r=await fetch("/api/pulse-generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,lang:"es"})}); const j=await r.json(); setData(j); setLoading(false);}
  return (<>
    <Head><title>Pulse · Builder v01</title><meta name="description" content="Genera una web con Pulse sin tocar la home ni la personalidad."/><link rel="canonical" href="/builder-v01"/></Head>
    <Watermark enabled={watermarkEnabled}/>
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
        <label className="flex-1"><span className="block text-sm text-zinc-600 mb-1">Describe tu web</span>
          <input value={prompt} onChange={e=>setPrompt(e.target.value)} className="w-full rounded-2xl border px-4 py-3" placeholder="Ej: Tienda de flores minimalista en Barcelona"/></label>
        <button onClick={go} disabled={loading} className="px-6 py-3 rounded-2xl border font-semibold">{loading?"Generando…":"Generar"}</button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">Ladrillo 2 · Preview & plantillas (mini). Home y /chat intactos.</p>
    </div>
    {data?(
      <main className="relative">
        {data.layout.map((b,i)=> b.t==="hero"?<SectionHero key={i} title={b.title} subtitle={b.subtitle} cta={b.cta} theme={data.theme}/>
          : b.t==="features"?<SectionFeatures key={i} items={b.items} theme={data.theme}/>
          : b.t==="gallery"?<SectionGallery key={i} images={b.images} theme={data.theme}/>
          : b.t==="cta"?<SectionCTA key={i} title={b.title} button={b.button} theme={data.theme}/>
          : <SectionFooter key={i} theme={data.theme}/>)}
      </main>
    ):<div className="max-w-6xl mx-auto px-6 pb-16 text-sm text-zinc-500">Escribe tu idea y pulsa <b>Generar</b>. Verás una landing ensamblada con bloques neutros AA.</div>}
  </>);
}
