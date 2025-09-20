import { useRouter } from "next/router";
import fs from "fs";
import path from "path";

type Item = { id?: string; name?: string; previewPath?: string };

// Solo en server: leer manifest
function resolvePath(q: string | string[] | undefined, pathParam: string | string[] | undefined) {
  const PUB = path.join(process.cwd(), "public");
  const MAN = path.join(process.cwd(), "data", "templates.manifest.json");
  const fallback = "/templates/landing.html";

  // 1) Si viene path explícito, úsalo si existe
  const pathStr = typeof pathParam === "string" ? pathParam : undefined;
  if (pathStr && pathStr.startsWith("/templates/")) {
    const abs = path.join(PUB, pathStr.replace(/^\//, ""));
    if (fs.existsSync(abs)) return pathStr;
  }

  // 2) Buscar en manifest por nombre/id aproximado
  try {
    const arr: Item[] = JSON.parse(fs.readFileSync(MAN, "utf8"));
    const needle = String(Array.isArray(q) ? q[0] : q || "").toLowerCase().trim();
    let best: Item | undefined;

    if (needle) {
      best =
        arr.find(it => (it.id||"").toLowerCase() === needle) ||
        arr.find(it => (it.name||"").toLowerCase() === needle) ||
        arr.find(it => (it.name||"").toLowerCase().includes(needle));
    }

    const candidate = best?.previewPath && best.previewPath.startsWith("/templates/")
      ? best.previewPath
      : fallback;

    const abs = path.join(PUB, candidate.replace(/^\//,""));
    return fs.existsSync(abs) ? candidate : fallback;
  } catch {
    return fallback;
  }
}

export async function getServerSideProps(ctx: any) {
  const p = resolvePath(ctx.query.q, ctx.query.path);
  return { props: { path: p } };
}

export default function PreviewEmbed({ path }: { path: string }) {
  const router = useRouter();
  return (
    <main style={{margin:0,padding:0}}>
      <iframe
        title="Preview"
        src={path}
        style={{width:"100vw",height:"100vh",border:"0"}}
        sandbox="allow-same-origin allow-scripts allow-forms"
        referrerPolicy="no-referrer"
      />
    </main>
  );
}
