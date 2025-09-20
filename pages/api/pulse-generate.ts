import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Item = { id:string; name:string; previewPath:string; tags?:string[]; palette?:string[] };
type Top = { id:string; score:number };
type Selection = { templateId:string; name:string; previewUrl:string; palette:string[]; reason:string; top3?:Top[] };

const MAN = path.join(process.cwd(),"data","templates.manifest.json");
const PUB = path.join(process.cwd(),"public");

function readItems(): Item[] {
  try { return JSON.parse(fs.readFileSync(MAN,"utf8")); } catch { return []; }
}
function existsPublic(p:string){ const abs=path.join(PUB,p.replace(/^\//,"")); return abs.startsWith(PUB) && fs.existsSync(abs); }

function tokenize(s:string){
  return (s||"")
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu,"")
    .replace(/[^a-z0-9áéíóúñ\s]/gi," ")
    .split(/\s+/).filter(Boolean);
}

function score(brief:string, sector?:string, objective?:string){
  const tokens = tokenize([brief, sector, objective].filter(Boolean).join(" "));
  const has = (...words:string[]) => words.some(w=>tokens.includes(w));
  const k = {
    ecommerce: has("venta","ventas","tienda","ecommerce","shop","producto","checkout","carrito","pago","comprar"),
    reservas:  has("reserva","reservas","cita","citas","agenda","booking","mesa","turno"),
    blog:      has("blog","articulo","articulos","contenido","noticias","seo","copy"),
    portfolio: has("portfolio","creador","influencer","link","links","bio","tiktok","youtube","twitch")
  };
  return k;
}

function select(brief:string, sector?:string, objective?:string): Selection {
  const items = readItems().filter(it => it.previewPath?.startsWith("/templates/"));
  const k = score(brief, sector, objective);

  const weights: Record<string, number> = {
    ecommerce: k.ecommerce ? 3 : 0,
    reservas:  k.reservas  ? 3 : 0,
    blog:      k.blog      ? 3 : 0,
    portfolio: k.portfolio ? 3 : 0,
    landing:   1 // comodín
  };

  const scored: Top[] = items.map(it => {
    let s = 0;
    if (weights[it.id] != null) s += weights[it.id];
    const tks = tokenize(brief + " " + (sector||"") + " " + (objective||""));
    s += (it.tags||[]).reduce((acc,tag)=> acc + (tks.includes(tag) ? 0.5 : 0), 0);
    // pequeña preferencia por archivos que existen
    s += existsPublic(it.previewPath) ? 0.2 : -2;
    return { id: it.id, score: s };
  }).sort((a,b)=> b.score - a.score);

  let chosen = items.find(it => it.id === (scored[0]?.id || "")) || items.find(it=>it.id==="landing") || items[0];
  if (!existsPublic(chosen.previewPath)) {
    const ok = items.find(it => existsPublic(it.previewPath));
    if (ok) chosen = ok;
  }

  return {
    templateId: chosen.id,
    name: chosen.name,
    previewUrl: existsPublic(chosen.previewPath) ? chosen.previewPath : "/templates/landing.html",
    palette: chosen.palette || ["#0ea5e9","#111827","#0b1020","#ffffff"],
    reason: `Elegido por coincidencia con: ${scored.slice(0,2).map(x=>x.id).join(", ") || "landing"}`
      + (sector?` · sector=${sector}`:"") + (objective?` · objetivo=${objective}`:""),
    top3: scored.slice(0,3)
  };
}

export default function handler(req:NextApiRequest,res:NextApiResponse){
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });
  try{
    const { brief="", mem={} } = (req.body||{}) as { brief?:string, mem?:any };
    const sector = mem.sector || mem.sectorName || "";
    const objective = mem.objective || mem.goal || "";
    const sel = select(brief, sector, objective);

    const city = mem.city || mem.ciudad || "";
    const copy = {
      title: sel.name,
      subtitle: sector
        ? `Boceto para ${sector}${city?` · ${city}`:""}`
        : `Boceto inicial${city?` · ${city}`:""}`,
      cta: "Abrir"
    };

    return res.status(200).json({ ok:true, selection: sel, copy });
  } catch(e:any){
    return res.status(200).json({ ok:false, error: e?.message || "unknown_error" });
  }
}
