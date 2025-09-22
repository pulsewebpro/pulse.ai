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
