import fs from "fs";
import path from "path";

/** v0.1 — 2 skins, bloques: Hero + Value3 + Pricing + Footer */
export type PulseSkinV01 = "crystal-oro" | "warm-cafe";
export type PulseSector = "restaurante" | "portfolio" | "saas" | "tienda" | "consultoria";

export const SKIN_TOKENS_V01: Record<PulseSkinV01, {
  name: string;
  colors: { bg:string; fg:string; accent:string; ctaBg:string; ctaFg:string; soft:string; };
  font: string;
  heroOverlay: string;
}> = {
  "crystal-oro": {
    name: "Crystal Oro",
    colors: { bg:"#0A0A0A", fg:"#F8FAFC", accent:"#38BDF8", ctaBg:"#FFD700", ctaFg:"#0A0A0A", soft:"rgba(56,189,248,0.15)" },
    font: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
    heroOverlay: "linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.65) 100%)",
  },
  "warm-cafe": {
    name: "Warm Café",
    colors: { bg:"#111827", fg:"#F8FAFC", accent:"#FF9F45", ctaBg:"#FF9F45", ctaFg:"#0A0A0A", soft:"rgba(255,159,69,0.15)" },
    font: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
    heroOverlay: "linear-gradient(180deg, rgba(17,24,39,0.10) 0%, rgba(17,24,39,0.70) 100%)",
  },
};

export function compositionForV01(sector: PulseSector): Array<"hero"|"value3"|"pricing"|"footer"> {
  switch (sector) {
    case "restaurante": return ["hero","value3","pricing","footer"];
    case "portfolio":   return ["hero","value3","footer"];
    case "saas":        return ["hero","value3","pricing","footer"];
    case "tienda":      return ["hero","pricing","footer"];
    case "consultoria": return ["hero","value3","footer"];
    default:            return ["hero","pricing","footer"];
  }
}

export function copyForV01(sector: PulseSector, idea: string) {
  const base = {
    claim: "Tu web antes de que se te enfríe el café ☕⚡",
    cta: "Diseñar mi web",
    bullets: ["Diseño premium en 1 minuto","Texto e idioma automáticos","Listo para desplegar en Vercel"],
    price: { p5:"5€ Demo ZIP", p39:"39€ Expansión", p59:"59€ Diamante 💎" },
  };
  if (sector === "restaurante") return {...base, title:"Cafetería / Restaurante", subtitle: idea || "Menú, reservas y reseñas listas al instante."};
  if (sector === "portfolio")   return {...base, title:"Portfolio elegante y memorable", subtitle: idea || "Proyectos, acerca de mí y contacto en segundos."};
  if (sector === "saas")        return {...base, title:"Lanza tu SaaS a la velocidad del rayo", subtitle: idea || "Features, pricing y testimonios listos para vender."};
  if (sector === "tienda")      return {...base, title:"Tienda online lista para convertir", subtitle: idea || "Productos destacados y CTA a compra/consulta."};
  if (sector === "consultoria") return {...base, title:"Consultoría con presencia impecable", subtitle: idea || "Servicios claros, confianza y contacto."};
  return {...base, title:"Web lista para facturar", subtitle: idea || "Estructura premium y CTA listos."};
}

export function plantProjectV01(outDir: string, skin: PulseSkinV01, sector: PulseSector, idea: string) {
  const tokens = SKIN_TOKENS_V01[skin];
  const comp = compositionForV01(sector);
  const copy = copyForV01(sector, idea);

  fs.mkdirSync(path.join(outDir,"pages"),{recursive:true});
  fs.mkdirSync(path.join(outDir,"styles"),{recursive:true});
  fs.mkdirSync(path.join(outDir,"public","banner"),{recursive:true});

  const css = `
:root{--bg:${tokens.colors.bg};--fg:${tokens.colors.fg};--accent:${tokens.colors.accent};--cta-bg:${tokens.colors.ctaBg};--cta-fg:${tokens.colors.ctaFg};--soft:${tokens.colors.soft};--font:${tokens.font}}
*{box-sizing:border-box}html,body,#__next{height:100%}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--font)}
a{color:inherit}.container{max-width:1120px;margin:0 auto;padding:24px}
.hero{position:relative;min-height:64vh;border-radius:24px;overflow:hidden;background:#0a0a0a url('/banner/hero-bg.jpg') center/cover no-repeat}
.hero::before{content:"";position:absolute;inset:0;background:${tokens.heroOverlay}}
.heroInner{position:relative;z-index:1;padding:48px}
.h1{font-size:48px;line-height:1.1;margin:0 0 8px;text-shadow:0 6px 30px var(--soft)}
.sub{opacity:.9;margin:0 0 20px}
.cta{display:inline-block;background:var(--cta-bg);color:var(--cta-fg);padding:14px 22px;border-radius:16px;font-weight:700;text-decoration:none;transform:translateZ(0);transition:transform .15s ease, box-shadow .2s;box-shadow:0 12px 40px var(--soft)}
.cta:hover{transform:scale(1.03)}
.bar{display:flex;gap:12px;flex-wrap:wrap}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:20px;box-shadow:0 8px 30px var(--soft)}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.pricing{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.priceTitle{font-size:18px;margin:0 0 6px}.price{font-size:28px;font-weight:800;margin:0 0 8px}
.footer{opacity:.8;font-size:14px;margin-top:32px}
@media (max-width:900px){.grid3,.pricing{grid-template-columns:1fr}.h1{font-size:36px}}
`;
  fs.writeFileSync(path.join(outDir,"styles","globals.css"), css, "utf-8");

  const appTsx = `import type { AppProps } from 'next/app';
import '../styles/globals.css';
export default function App({ Component, pageProps }: AppProps){ return <Component {...pageProps} /> }`;
  fs.writeFileSync(path.join(outDir,"pages","_app.tsx"), appTsx, "utf-8");

  const hero = `<section className="hero"><div className="heroInner container">
  <div className="bar" style={{marginBottom:12, opacity:.9}}><span>Pulse · ${tokens.name}</span><span>·</span><span>${copy.claim}</span></div>
  <h1 className="h1">${copy.title}</h1><p className="sub">${copy.subtitle}</p>
  <a className="cta" href="#pricing">${copy.cta}</a>
</div></section>`;

  const value3 = `<section className="container" style={{marginTop:28}}><div className="grid3">
  ${copy.bullets.map(b=>`<div className="card">${b}</div>`).join("")}
</div></section>`;

  const pricing = `<section id="pricing" className="container" style={{marginTop:28}}>
  <div className="pricing">
    <div className="card"><h3 className="priceTitle">Demo</h3><p className="price">${copy.price.p5}</p><p>Descarga ZIP funcional.</p></div>
    <div className="card" style={{outline:\`2px solid \${"var(--cta-bg)"}\`}}><h3 className="priceTitle">Expansión</h3><p className="price">${copy.price.p39}</p><p>Módulos extra (tienda/pagos*).</p></div>
    <div className="card"><h3 className="priceTitle">Diamante 💎</h3><p className="price">${copy.price.p59}</p><p>Hosting 1-click + editor*</p></div>
  </div>
  <p style={{opacity:.7, marginTop:8}}>* En esta fase no incluye pagos reales.</p>
</section>`;

  const footer = `<footer className="container footer">© ${new Date().getFullYear()} Pulse — i18n ES/EN/FR — Legales de ejemplo</footer>`;

  const blocks: Record<string,string> = { hero, value3, pricing, footer };
  const index = `import React from 'react';
export default function Home(){
  return (<main>
    ${compositionForV01(sector).map(k=>blocks[k]).join("\n    ")}
  </main>);
}
`;
  fs.writeFileSync(path.join(outDir,"pages","index.tsx"), index, "utf-8");

  const placeholder = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8z8DwHwAF/wKc8Jf1mAAAAABJRU5ErkJggg==","base64");
  fs.writeFileSync(path.join(outDir,"public","banner","hero-bg.jpg"), placeholder);
}
