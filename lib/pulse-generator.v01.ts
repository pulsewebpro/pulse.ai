import fs from "fs";
import path from "path";
import * as archiver from "archiver";
import { v4 as uuidv4 } from "uuid";
import { plantProjectV01, PulseSkinV01, PulseSector } from "./pulse-kit.v01";

export async function generateWebZipV01(opts: { userPrompt: string; skin: PulseSkinV01; sector: PulseSector; }): Promise<string> {
  const id = uuidv4();
  const outDir = path.join("/tmp", id);
  const zipPath = path.join("/tmp", `${id}.zip`);
  fs.mkdirSync(outDir, { recursive: true });

  plantProjectV01(outDir, opts.skin, opts.sector, opts.userPrompt);

  const pkg = { name:`pulse-web-${id}`, private:true, scripts:{ dev:"next dev" }, dependencies:{ next:"14.0.0", react:"18.2.0", "react-dom":"18.2.0" } };
  fs.writeFileSync(path.join(outDir,"package.json"), JSON.stringify(pkg,null,2), "utf-8");

  fs.mkdirSync(path.dirname(zipPath), { recursive: true });
  const output = fs.createWriteStream(zipPath);
  const archive = archiver.create("zip");
  const p = new Promise<string>((resolve,reject)=>{ output.on("close",()=>resolve(`/api/download/${id}`)); archive.on("error",(e)=>reject(e)); });
  archive.pipe(output); archive.directory(outDir, false); await archive.finalize();
  return p;
}
