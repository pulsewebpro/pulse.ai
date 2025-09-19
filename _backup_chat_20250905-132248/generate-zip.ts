import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("23456789abcdefghijkmnpqrstuvwxyz", 8);

const ZIPS_DIR = path.join(process.cwd(),"public","zips");

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  try{
    const { sector="E-commerce", objetivo="Vender", idioma="es", h1="Tu web lista hoy", subtitle="Convierte visitas en clientes", sections=["Hero","Sección 1","Sección 2","CTA"], brand="Pulse Demo" } = req.body||{};
    if(!fs.existsSync(ZIPS_DIR)) fs.mkdirSync(ZIPS_DIR,{recursive:true});
    const id = nanoid();
    const zipPath = path.join(ZIPS_DIR, `site-${id}.zip`);

    await new Promise<void>((resolve) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", ()=>resolve());
      archive.on("warning", ()=>{/* no-op */});
      archive.on("error", ()=>{ /* seguimos con lo que haya */ resolve(); });

      archive.pipe(output);

      const idx = `
import Head from "next/head";

export default function Home(){
  return (
    <main style={{minHeight:"100vh",background:"#0a0a0a",color:"#e6f3ff",padding:"32px"}}>
      <Head><title>${brand}</title></Head>
      <h1 style={{fontSize:44,fontWeight:900,marginBottom:8}}>${h1}</h1>
      <p style={{opacity:.9,marginBottom:18}}>${subtitle}</p>
      <ul>
        ${sections.map((s:string)=>`<li style={{marginBottom:6}}>${s}</li>`).join("")}
      </ul>
      <a href="#" style={{display:"inline-block",marginTop:16,padding:"10px 16px",borderRadius:12,background:"#FFD700",color:"#0A0A0A",fontWeight:800,textDecoration:"none"}}>CTA principal</a>
    </main>
  );
}
`;
      const pkg = `{"name":"pulse-demo","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start"},"dependencies":{"next":"14.2.3","react":"18.2.0","react-dom":"18.2.0"}}`;
      const readme = `# ${brand}\n\n${h1}\n\n${subtitle}\n`;

      archive.append(pkg, { name: "package.json" });
      archive.append(readme, { name: "README.md" });
      archive.append(idx, { name: "pages/index.tsx" });
      archive.finalize();
    });

    return res.status(200).json({ ok:true, url: `/zips/${path.basename(zipPath)}` });
  }catch(_e){
    // Fallback: ZIP mínimo
    const id = nanoid(); const zipPath = path.join(ZIPS_DIR, `site-${id}.zip`);
    fs.writeFileSync(zipPath, Buffer.from("UEsDBAoAAAAAADJMjVIAAAAAAAAAAAAAAAAJAAAAYmxhbmsudHh0UEsBAhQAFAAAAAAAMkyNUgAAAAAAAAAAAAAAAAsAJAAAAAAAAAAgAAAAAAAAAGJsYW5rLnR4dFBLBQYAAAAAAQABAD0AAAAnAAAAAAA=", "base64"));
    return res.status(200).json({ ok:true, url:`/zips/${path.basename(zipPath)}`, fallback:true });
  }
}
