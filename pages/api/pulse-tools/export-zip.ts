import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

/* ========= Utilidades ZIP (STORE) ========= */
const CRC_TABLE = (() => {
  let c: number; const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Uint8Array): number {
  let c = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF];
  return (c ^ -1) >>> 0;
}
function dosDateTime(d = new Date()) {
  const time = ((d.getHours()   & 0x1F) << 11) |
               ((d.getMinutes() & 0x3F) <<  5) |
               ((Math.floor(d.getSeconds()/2)) & 0x1F);
  const date = (((d.getFullYear()-1980) & 0x7F) << 9) |
               (((d.getMonth()+1)       & 0x0F) << 5) |
               (d.getDate()             & 0x1F);
  return { time, date };
}
function cat(chunks: Uint8Array[]): Uint8Array {
  const len = chunks.reduce((a,c)=>a+c.length,0);
  const out = new Uint8Array(len);
  let off = 0; for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}
function makeZip(files: { name: string; data: Uint8Array }[]) {
  const { time, date } = dosDateTime();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const nameBytes = new TextEncoder().encode(f.name);
    const crc = crc32(f.data);
    const size = f.data.length;

    const lfh = new DataView(new ArrayBuffer(30));
    lfh.setUint32(0, 0x04034b50, true);   // local file header
    lfh.setUint16(4, 20, true);
    lfh.setUint16(6, 0, true);
    lfh.setUint16(8, 0, true);            // STORE
    lfh.setUint16(10, time, true);
    lfh.setUint16(12, date, true);
    lfh.setUint32(14, crc, true);
    lfh.setUint32(18, size, true);
    lfh.setUint32(22, size, true);
    lfh.setUint16(26, nameBytes.length, true);
    lfh.setUint16(28, 0, true);

    const local = cat([new Uint8Array(lfh.buffer), nameBytes, f.data]);
    locals.push(local);

    const cdh = new DataView(new ArrayBuffer(46));
    cdh.setUint32(0, 0x02014b50, true);   // central dir header
    cdh.setUint16(4, 20, true);
    cdh.setUint16(6, 20, true);
    cdh.setUint16(8, 0, true);
    cdh.setUint16(10, 0, true);
    cdh.setUint16(12, time, true);
    cdh.setUint16(14, date, true);
    cdh.setUint32(16, crc, true);
    cdh.setUint32(20, size, true);
    cdh.setUint32(24, size, true);
    cdh.setUint16(28, nameBytes.length, true);
    cdh.setUint16(30, 0, true);
    cdh.setUint16(32, 0, true);
    cdh.setUint16(34, 0, true);
    cdh.setUint16(36, 0, true);
    cdh.setUint32(38, 0, true);
    cdh.setUint32(42, offset, true);

    const central = cat([new Uint8Array(cdh.buffer), nameBytes]);
    centrals.push(central);
    offset += local.length;
  }
  const centralDir = cat(centrals);
  const localData = cat(locals);

  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, files.length, true);
  eocd.setUint16(10, files.length, true);
  eocd.setUint32(12, centralDir.length, true);
  eocd.setUint32(16, localData.length, true);
  eocd.setUint16(20, 0, true);

  return cat([localData, centralDir, new Uint8Array(eocd.buffer)]);
}

/* ========= Helpers de paths y scraping ========= */
const PUB = path.join(process.cwd(), "public");
const encoder = new TextEncoder();

type Ref = { raw: string; abs: string; zip: string; kind: "img"|"css"|"js"|"other" };

function isHttp(u: string) { return /^https?:\/\//i.test(u); }
function badProto(u: string) { return /^(mailto:|tel:|javascript:|#)/i.test(u); }
function cleanUrl(u: string) {
  // quita ?query y #hash para el filesystem
  const iQ = u.indexOf("?"); if (iQ >= 0) u = u.slice(0, iQ);
  const iH = u.indexOf("#"); if (iH >= 0) u = u.slice(0, iH);
  return u;
}
function safeRelFromPublic(abs: string) {
  const rel = path.relative(PUB, abs).replace(/\\/g, "/");
  if (rel.startsWith("..")) return null; // fuera de /public
  return rel;
}
function guessKind(p: string): Ref["kind"] {
  const ext = p.toLowerCase().split(".").pop() || "";
  if (["png","jpg","jpeg","gif","webp","svg","avif"].includes(ext)) return "img";
  if (["css"].includes(ext)) return "css";
  if (["js","mjs"].includes(ext)) return "js";
  return "other";
}

/** Resuelve un href/src encontrado en HTML/CSS a:
 *  - ruta absoluta en disco (si existe dentro de /public)
 *  - ruta dentro del zip bajo 'assets/...'
 *  - tipo de recurso para reescrituras
 */
function resolveRef(baseDirAbs: string, ref: string): Ref | null {
  let url = cleanUrl(ref.trim());
  if (!url || isHttp(url) || badProto(url)) return null;

  // abs file on disk
  let abs: string;
  if (url.startsWith("/")) {
    abs = path.join(PUB, url.replace(/^\//,""));
  } else {
    abs = path.join(baseDirAbs, url);
  }
  abs = path.normalize(abs);

  const relFromPublic = safeRelFromPublic(abs);
  if (!relFromPublic || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) return null;

  // zip path: mirror estructura bajo assets/
  const zip = path.join("assets", relFromPublic).replace(/\\/g, "/");
  return { raw: ref, abs, zip, kind: guessKind(abs) };
}

/** Extrae refs de HTML: src="", href="", url(...) inline */
function scanHtml(html: string, baseDirAbs: string): Ref[] {
  const found = new Map<string, Ref>();
  const attrRe = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  const urlRe  = /url\(\s*['"]?([^)"']+)['"]?\s*\)/gi;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(html))) {
    const r = resolveRef(baseDirAbs, m[1]); if (r) found.set(r.abs, r);
  }
  while ((m = urlRe.exec(html))) {
    const r = resolveRef(baseDirAbs, m[1]); if (r) found.set(r.abs, r);
  }
  return [...found.values()];
}

/** Extrae refs de CSS: url(...) */
function scanCss(css: string, cssAbsPath: string): Ref[] {
  const base = path.dirname(cssAbsPath);
  const found: Record<string, Ref> = {};
  const urlRe  = /url\(\s*['"]?([^)"']+)['"]?\s*\)/gi;
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(css))) {
    const r = resolveRef(base, m[1]); if (r) found[r.abs] = r;
  }
  return Object.values(found);
}

/** Reescribe rutas en HTML para que apunten a assets/... */
function rewriteHtml(html: string, refs: Ref[]): string {
  let out = html;
  for (const r of refs) {
    const escaped = r.raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // src="/x" | href="/x"
    out = out.replace(new RegExp(`(src|href)=["']${escaped}["']`, "g"), (_m, a) => `${a}="${r.zip}"`);
    // url(/x) o url("/x")
    out = out.replace(new RegExp(`url\\((['"]?)${escaped}\\1\\)`, "g"), `url(${r.zip})`);
  }
  return out;
}

/** Reescribe rutas en CSS para que apunten a assets/... */
function rewriteCss(css: string, refs: Ref[]): string {
  let out = css;
  for (const r of refs) {
    const escaped = r.raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`url\\((['"]?)${escaped}\\1\\)`, "g"), `url(${r.zip})`);
  }
  return out;
}

/* ========= Handler ========= */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const preview = String(req.query.preview || "");
  const name    = String(req.query.name || "pulse-demo");
  const primary = String(req.query.primary || ""); // opcional: color primario #hex

  if (!preview.startsWith("/templates/") || !preview.endsWith(".html")) {
    return res.status(400).json({ ok:false, error: "invalid_preview_path" });
  }

  // Resuelve archivos desde /public
  const publicPreviewAbs = path.join(PUB, preview.replace(/^\//,""));
  if (!publicPreviewAbs.startsWith(PUB)) return res.status(400).json({ ok:false, error: "invalid_path" });
  if (!fs.existsSync(publicPreviewAbs)) return res.status(404).json({ ok:false, error: "not_found" });

  let html = fs.readFileSync(publicPreviewAbs, "utf8");
  const baseDirAbs = path.dirname(publicPreviewAbs);

  // 1) Escanear HTML para encontrar assets
  const htmlRefs = scanHtml(html, baseDirAbs);

  // 2) Cargar CSS y escanear sus url(...)
  const cssRefsNested: Ref[] = [];
  for (const r of htmlRefs.filter(x => x.kind === "css")) {
    try {
      const css = fs.readFileSync(r.abs, "utf8");
      const nested = scanCss(css, r.abs);
      for (const n of nested) {
        if (!htmlRefs.find(x => x.abs === n.abs) && !cssRefsNested.find(x => x.abs === n.abs)) {
          cssRefsNested.push(n);
        }
      }
    } catch {}
  }

  // 3) Consolidar todos los assets
  const allRefs: Ref[] = [];
  const seen = new Set<string>();
  for (const r of [...htmlRefs, ...cssRefsNested]) {
    if (!seen.has(r.abs)) { seen.add(r.abs); allRefs.push(r); }
  }

  // 4) (opcional) Inyectar color primario en <head>
  if (primary && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(primary)) {
    const style = `<style>:root{--pulse-primary:${primary}} a,.btn,button,input[type=submit],.cta{background:var(--pulse-primary)!important;color:#fff!important;border-color:var(--pulse-primary)!important} a{color:var(--pulse-primary)!important}</style>`;
    html = html.includes("</head>") ? html.replace("</head>", `${style}</head>`) : style + html;
  }

  // 5) Reescribir rutas en HTML
  html = rewriteHtml(html, allRefs);

  // 6) Preparar archivos para el ZIP
  const files: { name: string; data: Uint8Array }[] = [];
  files.push({ name: "index.html", data: encoder.encode(html) });

  // Añadir assets (y reescribir CSS internas)
  for (const ref of allRefs) {
    try {
      if (ref.kind === "css") {
        const css = fs.readFileSync(ref.abs, "utf8");
        // Reescritura de url(...) dentro del CSS (respecto a ese CSS)
        const nested = scanCss(css, ref.abs);
        // Mapear nested a assets/ también (se añaden si no estaban)
        for (const n of nested) {
          if (!allRefs.find(x => x.abs === n.abs)) {
            // Añadir al pack (también en files):
            try {
              const d = fs.readFileSync(n.abs);
              files.push({ name: n.zip, data: new Uint8Array(d) });
            } catch {}
          }
        }
        const cssRew = rewriteCss(css, [...nested, ...allRefs]);
        files.push({ name: ref.zip, data: encoder.encode(cssRew) });
      } else {
        const bin = fs.readFileSync(ref.abs);
        files.push({ name: ref.zip, data: new Uint8Array(bin) });
      }
    } catch {
      // ignorar assets que no podamos leer
    }
  }

  // 7) README
  const readme =
`Pulsa doble en index.html para abrir la demo (offline).

Estructura:
- index.html
- assets/**  (archivos copiados desde /public con rutas reescritas)

Consejos:
- Cambia colores en :root --pulse-primary dentro de index.html.
- Sustituye imágenes en assets/ por las tuyas conservando el nombre.

Original: ${preview}
Generado: ${new Date().toISOString()}
`;
  files.push({ name: "README.txt", data: encoder.encode(readme) });

  // 8) Generar y enviar ZIP
  const zip = makeZip(files);
  const safe = name.replace(/[^a-z0-9-_]/gi, "_");
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${safe || "pulse-demo"}.zip"`);
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(Buffer.from(zip.buffer, zip.byteOffset, zip.byteLength));
}
