#!/usr/bin/env bash
set -euo pipefail

echo "☕⚡ Pulse · Ladrillo 2 · Generador mínimo (home/persona intactas)"

mkdir -p _backup_ladrillo2 pages/api lib/pulsekit public/uihut

# ── .env.local (planes)
if [ ! -f ".env.local" ]; then
  cat <<'ENV' > .env.local
PULSE_PLAN=demo
PULSE_WATERMARK=on
PULSE_PREVIEW_SCOPE=mini
PULSE_RATE_LIMIT=on
PULSE_MEMORY_PREMIUM=0
ENV
fi

# ── Bloques neutros AA
cat <<'TSX' > lib/pulsekit/blocks.v01.tsx
import React from "react";
export type Theme="neutral"|"gold"|"cyan";
export const themeTokens={neutral:{bg:"bg-white",fg:"text-zinc-900",muted:"text-zinc-600"},gold:{bg:"bg-white",fg:"text-zinc-900",muted:"text-zinc-600"},cyan:{bg:"bg-white",fg:"text-zinc-900",muted:"text-zinc-600"}};
const focus="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/70";
export const Watermark:React.FC<{enabled:boolean}>=({enabled})=>enabled?(
  <div aria-hidden className="pointer-events-none fixed inset-0 z-[1]" style={{backgroundImage:"repeating-linear-gradient(45deg, rgba(10,10,10,0.12) 0 40px, transparent 40px 160px)",mixBlendMode:"multiply"}}/>
):null;
export const SectionHero:React.FC<{title:string;subtitle:string;cta:string;theme:Theme}>=({title,subtitle,cta,theme})=>{
  const t=themeTokens[theme]; return (<header className={`${t.bg} ${t.fg}`}><div className="max-w-6xl mx-auto px-6 py-24 md:py-28">
  <h1 className="text-4xl md:text-6xl font-black tracking-tight">{title}</h1>
  <p className={`mt-4 text-lg md:text-xl ${t.muted}`}>{subtitle}</p>
  <a href="/chat" className={`mt-8 inline-flex items-center px-6 py-3 rounded-2xl border ${focus}`}><span className="font-semibold">{cta}</span></a>
</div></header>);};
export const SectionFeatures:React.FC<{items:{title:string;desc:string}[];theme:Theme}>=({items,theme})=>{
  const t=themeTokens[theme]; return (<section className={`${t.bg} ${t.fg} border-t`}><div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
  {items.map((f,i)=>(<div key={i} className="p-6 rounded-2xl border bg-white/60 backdrop-blur"><h3 className="font-bold">{f.title}</h3><p className="mt-2 text-sm text-zinc-600">{f.desc}</p></div>))}
</div></section>);};
export const SectionGallery:React.FC<{images:string[];theme:Theme}>=({images,theme})=>{
  const t=themeTokens[theme]; return (<section className={`${t.bg} ${t.fg} border-t`}><div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-4">
  {images.map((src,i)=>(<div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border bg-white/50"><div className="w-full h-full grid place-content-center text-sm text-zinc-500">IMG {i+1}</div></div>))}
</div></section>);};
export const SectionCTA:React.FC<{title:string;button:string;theme:Theme}>=({title,button,theme})=>{
  const t=themeTokens[theme]; return (<section className={`${t.bg} ${t.fg} border-t`}><div className="max-w-6xl mx-auto px-6 py-16 text-center">
  <h3 className="text-2xl md:text-3xl font-extrabold">{title}</h3>
  <a href="/chat" className={`mt-6 inline-flex items-center px-6 py-3 rounded-2xl border ${focus}`}><span className="font-semibold">{button}</span></a>
  <p className="mt-3 text-xs text-zinc-500">DEMO · tu web antes de que se te enfríe el café ☕⚡</p>
</div></section>);};
export const SectionFooter:React.FC<{theme:Theme}>=()=>(
  <footer className="bg-white border-t"><div className="max-w-6xl mx-auto px-6 py-10 text-xs text-zinc-500 flex items-center justify-between"><span>© Pulse {new Date().getFullYear()}</span><span className="font-mono">DEMO</span></div></footer>
);
TSX

# ── Generador
cat <<'TS' > lib/pulsekit/generator.v01.ts
export type Theme="neutral"|"gold"|"cyan"; export type Plan="demo"|"expansion"|"diamond";
export type GenRequest={prompt:string;lang?:"es"|"en"|"fr";theme?:Theme;plan?:Plan};
export type GenResponse={seed:number;theme:Theme;plan:Plan;lang:"es"|"en"|"fr";layout:Array<{t:"hero";title:string;subtitle:string;cta:string}|{t:"features";items:{title:string;desc:string}[]}|{t:"gallery";images:string[]}|{t:"cta";title:string;button:string}|{t:"footer"}>};
function hash(s:string){let h=0;for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0;}return Math.abs(h);}
function pick<T>(a:T[],i:number){return a[i%a.length];}
export function generate(req:GenRequest):GenResponse{
  const lang=req.lang??"es"; const plan=(req.plan??"demo") as Plan; const theme:Theme=req.theme??pick<Theme>(["neutral","gold","cyan"],hash(req.prompt)); const seed=hash(req.prompt+"|"+lang);
  const dict={es:{cta:"Hablar con Pulse",feat:["Rápido","Elegante","Listo para vender"],desc:["Tu web en minutos con bloques premium.","Diseño AA, limpio y con foco.","SEO básico e i18n listos."],final:"¿Listo para tu web?",btn:"Crear con Pulse"},
              en:{cta:"Talk to Pulse",feat:["Fast","Elegant","Ready to sell"],desc:["Your site in minutes with premium blocks.","AA design, clean and focused.","Basic SEO and i18n ready."],final:"Ready for your site?",btn:"Build with Pulse"},
              fr:{cta:"Parler à Pulse",feat:["Rapide","Élégant","Prêt à vendre"],desc:["Votre site en minutes avec des blocs premium.","Design AA, propre et ciblé.","SEO de base et i18n prêts."],final:"Prêt pour votre site ?",btn:"Créer avec Pulse"}}[lang];
  const title=req.prompt.length>8?req.prompt:"Website para tu idea";
  const subtitle=lang==="es"?"Generada por Pulse con bloques curados.":lang==="en"?"Generated by Pulse with curated blocks.":"Généré par Pulse avec des blocs soignés.";
  const layout:[GenResponse["layout"][number], ...GenResponse["layout"]] = [
    {t:"hero",title,subtitle,cta:dict.cta},
    {t:"features",items:[{title:dict.feat[0],desc:dict.desc[0]},{title:dict.feat[1],desc:dict.desc[1]},{title:dict.feat[2],desc:dict.desc[2]}]},
    {t:"gallery",images:Array.from({length:8}).map((_,i)=>`/uihut/placeholder-${i+1}.png`)},
    {t:"cta",title:dict.final,button:dict.btn},
    {t:"footer"}
  ];
  return {seed,theme,plan,lang,layout};
}
TS

# ── API
cat <<'TS' > pages/api/pulse-generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { generate } from "@/lib/pulsekit/generator.v01";
export default function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=="POST") return res.status(405).json({error:"Method Not Allowed"});
  const body=typeof req.body==="string"?JSON.parse(req.body||"{}"):req.body||{};
  const plan=(process.env.PULSE_PLAN||"demo") as "demo"|"expansion"|"diamond";
  const data=generate({prompt: body.prompt||"Website demo", lang: body.lang||"es", theme: body.theme, plan});
  res.status(200).json(data);
}
TS

# ── Página Builder
cat <<'TSX' > pages/builder-v01.tsx
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
TSX

# ── Placeholders UIHut
if [ ! -f "public/uihut/README.txt" ]; then echo "Coloca aquí assets UIHut. El generador los referenciará." > public/uihut/README.txt; fi
for i in $(seq 1 8); do f="public/uihut/placeholder-$i.png"; if [ ! -f "$f" ]; then printf "\211PNG\r\n\032\n\000\000\000\rIHDR\000\000\000\001\000\000\000\001\010\006\000\000\000\037\017\322\336\000\000\000\012IDATx\234c\000\001\000\000\005\000\001\r\n-\262\000\000\000\000IEND\256B`\202" > "$f"; fi; done

# ── Undo
cat <<'UNDO' > undo_ladrillo2.sh
#!/usr/bin/env bash
set -euo pipefail
echo "♻️  Undo Ladrillo 2"
rm -f pages/builder-v01.tsx pages/api/pulse-generate.ts
rm -rf lib/pulsekit
echo "Listo. Home y /chat intactos."
UNDO
chmod +x undo_ladrillo2.sh

echo "✅ Ladrillo 2 creado. Arranca dev y visita /builder-v01"
