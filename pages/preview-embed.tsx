import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Watermark, SectionHero, SectionFeatures, SectionGallery, SectionCTA, SectionFooter } from "@/lib/pulsekit/blocks.v01";
type GenRes = import("@/lib/pulsekit/generator.v01").GenResponse;

export default function PreviewEmbed(){
  const [data, setData] = useState<GenRes|null>(null);
  const [loading, setLoading] = useState(true);
  const plan=(process.env.NEXT_PUBLIC_PULSE_PLAN||process.env.PULSE_PLAN||"demo") as "demo"|"expansion"|"diamond";
  const watermarkOn=(process.env.NEXT_PUBLIC_PULSE_WATERMARK||process.env.PULSE_WATERMARK||"on")==="on";
  const watermarkEnabled = plan==="demo"?watermarkOn:false;

  useEffect(()=>{
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q") || "Landing demo generada por Pulse";
    fetch("/api/pulse-generate",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({prompt:q, lang:"es"})
    }).then(r=>r.json()).then(setData).finally(()=>setLoading(false));
  },[]);

  return (
    <>
      <Head><title>Pulse · Preview Embed</title><meta name="robots" content="noindex,nofollow"/></Head>
      <Watermark enabled={watermarkEnabled}/>
      {!data && (
        <div className="min-h-[40vh] grid place-content-center text-sm text-zinc-500">
          {loading ? "Generando…": "Sin datos"}
        </div>
      )}
      {data && (
        <main className="relative">
          {data.layout.map((b,i)=>{
            if(b.t==="hero") return <SectionHero key={i} title={b.title} subtitle={b.subtitle} cta={b.cta} theme={data.theme} />;
            if(b.t==="features") return <SectionFeatures key={i} items={b.items} theme={data.theme} />;
            if(b.t==="gallery") return <SectionGallery key={i} images={b.images} theme={data.theme} />;
            if(b.t==="cta") return <SectionCTA key={i} title={b.title} button={b.button} theme={data.theme} />;
            return <SectionFooter key={i} theme={data.theme}/>;
          })}
        </main>
      )}
    </>
  );
}
