import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("23456789abcdefghijkmnpqrstuvwxyz", 8);

const PREVIEWS_DIR = path.join(process.cwd(),"public","previews");

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  try{
    const { titulo = "Tu web lista hoy", subtitulo = "Checkout rápido y confianza", colorway="cyan" } = req.body||{};
    if(!fs.existsSync(PREVIEWS_DIR)) fs.mkdirSync(PREVIEWS_DIR,{recursive:true});

    const id = nanoid();
    const outfile = path.join(PREVIEWS_DIR, `preview-${id}.png`);

    const grad = colorway==="cyan"
      ? "linear-gradient(180deg, rgba(2,12,24,1) 0%, rgba(1,7,14,1) 100%)"
      : "linear-gradient(180deg, #0b0b0b 0%, #000000 100%)";

    const svg = `
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#031423"/>
          <stop offset="100%" stop-color="#01070E"/>
        </linearGradient>
        <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#38BDF8" flood-opacity=".25"/></filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="1120" cy="100" r="6" fill="#38BDF8" opacity=".6"/>
      <circle cx="1160" cy="140" r="4" fill="#38BDF8" opacity=".4"/>
      <g filter="url(#s)">
        <text x="64" y="290" font-family="Inter, -apple-system, Segoe UI, Roboto, sans-serif" font-size="64" font-weight="800" fill="#E6F3FF">${String(titulo).slice(0,64)}</text>
        <text x="64" y="356" font-family="Inter, -apple-system, Segoe UI, Roboto, sans-serif" font-size="28" fill="#CFE8FF" opacity=".9">${String(subtitulo).slice(0,96)}</text>
      </g>
      <rect x="64" y="420" width="340" height="56" rx="28" fill="#FFD700"/>
      <text x="84" y="457" font-family="Inter, -apple-system, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="800" fill="#0A0A0A">Comprar ahora</text>
    </svg>`;

    await sharp(Buffer.from(svg)).png().toFile(outfile);
    return res.status(200).json({ ok:true, url: `/previews/${path.basename(outfile)}` });
  }catch(e){
    // Fallback seguro: usa un asset existente
    return res.status(200).json({ ok:true, url: "/pulse/pulse-neutral-coffee-4k.png", fallback:true });
  }
}
