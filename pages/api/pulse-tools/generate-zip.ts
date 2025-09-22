import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import archiver from "archiver";

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
    const body = (req.body||{});
    const id = nanoid(8);
    const outDir = path.join(process.cwd(),"public","zips");
    const zipPath = path.join(outDir, `pulse_${id}.zip`);
    fs.mkdirSync(outDir, { recursive:true });

    // Carpeta temporal simple con next.config y una index básica
    const tmp = path.join(process.cwd(),".tmp_zip_"+id);
    fs.mkdirSync(tmp, { recursive:true });
    fs.writeFileSync(path.join(tmp,"package.json"), JSON.stringify({ name:"pulse-demo", private:true }, null, 2));
    fs.mkdirSync(path.join(tmp,"pages"), { recursive:true });
    fs.writeFileSync(path.join(tmp,"pages","index.jsx"), `
export default function Home(){
  return (<main style={{padding:"48px",fontFamily:"Inter"}}>
    <h1>${(body.h1||"Tu web lista")}</h1>
    <p>${(body.subtitle||"Contenido demo generado por Pulse.")}</p>
  </main>);
}
`);

    // Crear ZIP
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib:{ level:9 }});
    archive.pipe(output);
    archive.directory(tmp, false);
    await archive.finalize();

    // Limpieza temporal
    fs.rmSync(tmp, { recursive:true, force:true });

    return res.status(200).json({ url:`/zips/${path.basename(zipPath)}` });
  }catch(e:any){
    return res.status(200).json({ error:String(e?.message||e) });
  }
}
