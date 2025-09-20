import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";

// --- util ZIP STORE ---
const CRC_TABLE=(()=>{let c:number;const t=new Uint32Array(256);for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++){c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);}t[n]=c>>>0;}return t;})();
const crc32=(b:Uint8Array)=>{let c=0^-1;for(let i=0;i<b.length;i++)c=(c>>>8)^CRC_TABLE[(c^b[i])&0xFF];return (c^-1)>>>0;};
const dd=()=>{const d=new Date();const time=((d.getHours()&0x1F)<<11)|((d.getMinutes()&0x3F)<<5)|((Math.floor(d.getSeconds()/2))&0x1F);
const date=(((d.getFullYear()-1980)&0x7F)<<9)|(((d.getMonth()+1)&0x0F)<<5)|(d.getDate()&0x1F);return{time,date};};
const cat=(xs:Uint8Array[])=>{const L=xs.reduce((a,c)=>a+c.length,0),o=new Uint8Array(L);let p=0;for(const c of xs){o.set(c,p);p+=c.length;}return o;};
function makeZip(files:{name:string;data:Uint8Array}[]){const{time,date}=dd();const locals:Uint8Array[]=[];const centrals:Uint8Array[]=[];let off=0;
for(const f of files){const name=new TextEncoder().encode(f.name);const crc=crc32(f.data);const sz=f.data.length;
const lfh=new DataView(new ArrayBuffer(30));lfh.setUint32(0,0x04034b50,true);lfh.setUint16(4,20,true);lfh.setUint16(6,0,true);lfh.setUint16(8,0,true);
lfh.setUint16(10,time,true);lfh.setUint16(12,date,true);lfh.setUint32(14,crc,true);lfh.setUint32(18,sz,true);lfh.setUint32(22,sz,true);
lfh.setUint16(26,name.length,true);lfh.setUint16(28,0,true);
const local=cat([new Uint8Array(lfh.buffer),name,f.data]);locals.push(local);
const cdh=new DataView(new ArrayBuffer(46));cdh.setUint32(0,0x02014b50,true);cdh.setUint16(4,20,true);cdh.setUint16(6,20,true);cdh.setUint16(8,0,true);
cdh.setUint16(10,0,true);cdh.setUint16(12,time,true);cdh.setUint16(14,date,true);cdh.setUint32(16,crc,true);cdh.setUint32(20,sz,true);cdh.setUint32(24,sz,true);
cdh.setUint16(28,name.length,true);cdh.setUint16(30,0,true);cdh.setUint16(32,0,true);cdh.setUint16(34,0,true);cdh.setUint16(36,0,true);cdh.setUint32(38,0,true);
cdh.setUint32(42,off,true);
const central=cat([new Uint8Array(cdh.buffer),name]);centrals.push(central);off+=local.length;}
const centralDir=cat(centrals);const localData=cat(locals);
const eocd=new DataView(new ArrayBuffer(22));eocd.setUint32(0,0x06054b50,true);eocd.setUint16(4,0,true);eocd.setUint16(6,0,true);
eocd.setUint16(8,files.length,true);eocd.setUint16(10,files.length,true);eocd.setUint32(12,centralDir.length,true);eocd.setUint32(16,localData.length,true);eocd.setUint16(20,0,true);
return cat([localData,centralDir,new Uint8Array(eocd.buffer)]);}

export default function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  const preview=String(req.query.preview||""); const name=String(req.query.name||"pulse-demo");
  const primary=String(req.query.primary||"");
  if(!preview.startsWith("/templates/")||!preview.endsWith(".html")) return res.status(400).json({ok:false,error:"invalid_preview_path"});
  const filePath=path.join(process.cwd(),"public",preview.replace(/^\//,"")); if(!fs.existsSync(filePath)) return res.status(404).json({ok:false,error:"not_found"});
  let html=fs.readFileSync(filePath,"utf8");
  if(primary && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(primary)){
    const style=`<style>:root{--pulse-primary:${primary}} a,.btn,button,input[type=submit],.cta{background:var(--pulse-primary)!important;color:#fff!important;border-color:var(--pulse-primary)!important} a{color:var(--pulse-primary)!important}</style>`;
    html = html.includes("</head>") ? html.replace("</head>",`${style}</head>`) : style+html;
  }
  const files=[{name:"index.html",data:new TextEncoder().encode(html)},{name:"README.txt",data:new TextEncoder().encode(`Pulsa doble en index.html\nOriginal: ${preview}\nGenerado: ${new Date().toISOString()}\n`)}];
  const zip=makeZip(files);
  res.setHeader("Content-Type","application/zip");
  res.setHeader("Content-Disposition",`attachment; filename="${name.replace(/[^a-z0-9-_]/gi,"_")}.zip"`);
  res.status(200).send(Buffer.from(zip.buffer,zip.byteOffset,zip.byteLength));
}
