import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { nanoid } from "nanoid";

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
    const { titulo, subtitulo } = (req.body||{});
    const id = nanoid(8);
    const outDir = path.join(process.cwd(),"public","previews");
    const outPath = path.join(outDir, `preview_${id}.png`);
    fs.mkdirSync(outDir, { recursive:true });

    const width = 1600, height = 900;
    const bg = {r:3,g:12,b:24,alpha:1};

    const svg = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#06182A"/>
            <stop offset="100%" stop-color="#03101C"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <circle cx="92%" cy="14%" r="6" fill="#38BDF8" opacity="0.5"/>
        <circle cx="88%" cy="22%" r="3" fill="#38BDF8" opacity="0.35"/>
        <text x="8%" y="52%" font-family="Inter, system-ui" font-size="64" font-weight="800" fill="#E6F3FF">
          ${String(titulo||"Tu web lista para vender").slice(0,46)}
        </text>
        <text x="8%" y="62%" font-family="Inter, system-ui" font-size="26" fill="#A8D4FF">
          ${String(subtitulo||"Checkout rápido, confianza y repetición de compra.").slice(0,80)}
        </text>
      </svg>
    `;

    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    await sharp({
      create:{ width, height, channels:4, background:bg }
    }).composite([{ input:png }]).png().toFile(outPath);

    return res.status(200).json({ url:`/previews/${path.basename(outPath)}` });
  }catch(e:any){
    return res.status(200).json({ url: "/pulse/pulse-neutral-coffee-4k.png", fallback:true, error: String(e?.message||e) });
  }
}
